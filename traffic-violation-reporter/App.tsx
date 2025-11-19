import React, { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { DashboardPage } from './components/DashboardPage';
import { RulesPage } from './components/RulesPage';
import { ContactPage } from './components/ContactPage';
import { RewardsPage } from './components/RewardsPage';
import { ProfilePage } from './components/ProfilePage';
import { PoliceStationsPage } from './components/PoliceStationsPage';
import { Toast } from './components/Toast';
import { ViolationReportData, PoliceStation } from './types';
import { deleteReport as deleteReportFromDB, getAllReports } from './services/databaseService';

// Simple hash-based routing
const useHashNavigation = () => {
    const [page, setPage] = useState(window.location.hash.replace('#', '') || 'home');

    const handleHashChange = () => {
        setPage(window.location.hash.replace('#', '') || 'home');
    };

    React.useEffect(() => {
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const navigate = (newPage: string) => {
        window.location.hash = newPage;
    }

    return { page, navigate };
};

type ToastState = { message: string, type: 'success' | 'error' } | null;

const App: React.FC = () => {
  const { page, navigate } = useHashNavigation();
  const [reports, setReports] = useState<ViolationReportData[]>([]);
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [toast, setToast] = useState<ToastState>(null);

  // Load reports from database on mount
  React.useEffect(() => {
    const loadReports = async () => {
      try {
        const storedReports = await getAllReports();
        const reportData: ViolationReportData[] = storedReports.map(stored => stored.reportData);
        setReports(reportData);
      } catch (error) {
        console.error('Error loading reports from database:', error);
      }
    };
    loadReports();
  }, []);

  const addReport = (newReport: ViolationReportData) => {
    setReports(prevReports => [newReport, ...prevReports]);
  };

  const deleteReport = async (reportId: string) => {
    try {
      // Delete from database
      await deleteReportFromDB(reportId);
      // Remove from state
      setReports(prevReports => prevReports.filter(report => report.reportId !== reportId));
      showToast('Report deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting report:', error);
      // Still remove from UI even if DB deletion fails
      setReports(prevReports => prevReports.filter(report => report.reportId !== reportId));
      showToast('Report removed from view', 'success');
    }
  };

  const handleStationsFound = (newStations: PoliceStation[]) => {
    setPoliceStations(prevStations => {
        const existingStationNames = new Set(prevStations.map(s => s.name));
        const uniqueNewStations = newStations.filter(s => !existingStationNames.has(s.name));
        return [...prevStations, ...uniqueNewStations];
    });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage reports={reports} policeStations={policeStations} onDeleteReport={deleteReport} />;
      case 'rules':
        return <RulesPage />;
      case 'contact':
        return <ContactPage />;
      case 'rewards':
        return <RewardsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'police-stations':
        return <PoliceStationsPage policeStations={policeStations} reports={reports} />;
      case 'home':
      default:
        return <HomePage onReportGenerated={addReport} onStationsFound={handleStationsFound} onShowToast={showToast} />;
    }
  };

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen font-sans">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <Header onNavigate={navigate} currentPage={page} />
        <main className="flex-grow">
          <div key={page} className="animate-page-enter">
            {renderPage()}
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;