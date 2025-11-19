// This service handles creating a unique hash for an image file
// and managing a list of hashes in localStorage to prevent duplicates.

const HASH_STORAGE_KEY = 'trafficai-image-hashes';

/**
 * Generates a SHA-256 hash for a given file.
 * @param file The file to hash.
 * @returns A promise that resolves to the hex string of the hash.
 */
export const generateImageHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

/**
 * Retrieves the list of stored image hashes from localStorage.
 * @returns An array of hash strings.
 */
const getStoredHashes = (): string[] => {
    try {
        const storedHashes = localStorage.getItem(HASH_STORAGE_KEY);
        return storedHashes ? JSON.parse(storedHashes) : [];
    } catch (e) {
        console.error("Could not retrieve hashes from localStorage", e);
        return [];
    }
};

/**
 * Checks if a given hash already exists in localStorage.
 * @param hash The hash to check.
 * @returns True if the hash exists, false otherwise.
 */
export const isHashStored = (hash: string): boolean => {
    const storedHashes = getStoredHashes();
    return storedHashes.includes(hash);
};

/**
 * Stores a new hash in localStorage.
 * @param hash The new hash to store.
 */
export const storeHash = (hash: string): void => {
    try {
        const storedHashes = getStoredHashes();
        if (!storedHashes.includes(hash)) {
            const updatedHashes = [...storedHashes, hash];
            localStorage.setItem(HASH_STORAGE_KEY, JSON.stringify(updatedHashes));
        }
    } catch (e) {
        console.error("Could not store hash in localStorage", e);
    }
};