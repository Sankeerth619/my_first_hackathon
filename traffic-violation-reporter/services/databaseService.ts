// Database service using IndexedDB to store reports with user IDs and media files

interface StoredReport {
  id: string;
  reportId: string;
  userId: string | null;
  username: string | null;
  mediaType: 'image' | 'video';
  mediaUrl: string; // Data URL or blob URL
  mediaHash: string;
  reportData: any; // ViolationReportData
  timestamp: number;
  location: { latitude: number; longitude: number } | null;
}

const DB_NAME = 'TrafficAI_DB';
const DB_VERSION = 1;
const STORE_NAME = 'reports';

let dbInstance: IDBDatabase | null = null;

/**
 * Opens the IndexedDB database and creates object stores if needed
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('reportId', 'reportId', { unique: true });
        objectStore.createIndex('userId', 'userId', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('mediaHash', 'mediaHash', { unique: true });
      }
    };
  });
};

/**
 * Saves a report to the database
 */
export const saveReport = async (
  reportData: any,
  mediaUrl: string,
  mediaHash: string,
  mediaType: 'image' | 'video',
  userId: string | null,
  username: string | null
): Promise<void> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const report: StoredReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reportId: reportData.reportId,
      userId,
      username,
      mediaType,
      mediaUrl,
      mediaHash,
      reportData,
      timestamp: Date.now(),
      location: reportData.location,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(report);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save report'));
    });
  } catch (error) {
    console.error('Error saving report to database:', error);
    throw error;
  }
};

/**
 * Retrieves all reports for a specific user
 */
export const getUserReports = async (userId: string | null): Promise<StoredReport[]> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const reports = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(reports);
      };
      request.onerror = () => reject(new Error('Failed to retrieve reports'));
    });
  } catch (error) {
    console.error('Error retrieving user reports:', error);
    return [];
  }
};

/**
 * Retrieves all reports (for admin or dashboard purposes)
 */
export const getAllReports = async (): Promise<StoredReport[]> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const reports = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(reports);
      };
      request.onerror = () => reject(new Error('Failed to retrieve reports'));
    });
  } catch (error) {
    console.error('Error retrieving all reports:', error);
    return [];
  }
};

/**
 * Checks if a media hash already exists in the database
 */
export const isMediaHashExists = async (hash: string): Promise<boolean> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('mediaHash');

    return new Promise((resolve, reject) => {
      const request = index.get(hash);
      request.onsuccess = () => {
        resolve(request.result !== undefined);
      };
      request.onerror = () => reject(new Error('Failed to check media hash'));
    });
  } catch (error) {
    console.error('Error checking media hash:', error);
    return false;
  }
};

/**
 * Deletes a report by ID
 */
export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('reportId');

    return new Promise((resolve, reject) => {
      const getRequest = index.get(reportId);
      getRequest.onsuccess = () => {
        const report = getRequest.result;
        if (report) {
          const deleteRequest = store.delete(report.id);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(new Error('Failed to delete report'));
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(new Error('Failed to find report'));
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

