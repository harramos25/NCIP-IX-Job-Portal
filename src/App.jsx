import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import ScrollToTop from './components/common/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import RegionalOffices from './pages/RegionalOffices';
import JobDetails from './pages/JobDetails';
import Apply from './pages/Apply';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHeader from './components/AdminHeader';
import AdminJobs from './pages/admin/AdminJobs';
import AdminJobCreate from './pages/admin/AdminJobCreate';
import AdminJobEdit from './pages/admin/AdminJobEdit';
import AdminJobView from './pages/admin/AdminJobView';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationView from './pages/admin/AdminApplicationView';
import AdminProfile from './pages/admin/AdminProfile';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <Routes>
        {/* Public Routes - Uses Default Header & Footer */}
        <Route element={
          <>
            <Header />
            <div style={{ minHeight: '80vh' }}>
              <Outlet />
            </div>
            <Footer />
          </>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/regional-offices" element={<RegionalOffices />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/job/:id/apply" element={<Apply />} />
        </Route>

        {/* Admin Routes - Uses Admin Header (except login) */}

        {/* Admin Login - No Header/Footer */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Dashboard & Protected Pages */}
        <Route path="/admin/*" element={
          <>
            <AdminHeader />
            <Outlet />
          </>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="jobs/create" element={<AdminJobCreate />} />
          <Route path="jobs/edit/:id" element={<AdminJobEdit />} />
          <Route path="jobs/:id" element={<AdminJobView />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="applications/:id" element={<AdminApplicationView />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
