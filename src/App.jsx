import ProtectedRoute from './components/common/ProtectedRoute';

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

        {/* Admin Login & Reset - No Header/Footer */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />

        {/* Admin Dashboard & Protected Pages */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminHeader />
            <Outlet />
          </ProtectedRoute>
        }>
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
