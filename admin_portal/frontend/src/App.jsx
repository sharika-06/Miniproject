import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import DashboardHome from './pages/DashboardHome';
import SystemSettings from './pages/SystemSettings';
import AdminManagement from './pages/AdminManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<DashboardHome />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="admins" element={<AdminManagement />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
