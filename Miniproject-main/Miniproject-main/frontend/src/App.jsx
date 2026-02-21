import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import VerifyPage from './pages/VerifyPage';
import UploadPage from './pages/UploadPage';
import Dashboard from './pages/Dashboard';
import Layout from './components/layout/Layout';
import { DashboardProvider } from './context/DashboardContext';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neuro-bg text-neuro-text font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route
            path="/dashboard"
            element={
              <DashboardProvider>
                <Layout>
                  <Dashboard />
                </Layout>
              </DashboardProvider>
            }
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
