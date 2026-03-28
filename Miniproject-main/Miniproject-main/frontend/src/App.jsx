import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import VerifyPage from './pages/VerifyPage';
import UploadPage from './pages/UploadPage';
import Dashboard from './pages/Dashboard';
import Layout from './components/layout/Layout';
import { DashboardProvider } from './context/DashboardContext';
import AccountSettings from './pages/AccountSettings';
import Security from './pages/Security';
import AuditLog from './pages/AuditLog';
import NotificationsPage from './pages/NotificationsPage';
import HelpCenter from './pages/HelpCenter';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neuro-bg text-neuro-text font-sans">
        <DashboardProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route path="/settings" element={<Layout><AccountSettings /></Layout>} />
            <Route path="/security" element={<Layout><Security /></Layout>} />
            <Route path="/audit-log" element={<Layout><AuditLog /></Layout>} />
            <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />
            <Route path="/help" element={<Layout><HelpCenter /></Layout>} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DashboardProvider>
      </div>
    </BrowserRouter>
  )
}

export default App
