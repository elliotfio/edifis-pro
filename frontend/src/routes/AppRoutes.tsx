import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoutes from '@/routes/PrivateRoutes';
import PublicRoutes from '@/routes/PublicRoutes';
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import Profile from '@/features/user/Profile';
import Error from '@/features/Error';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/stores/authStore';
import Loader from '@/components/ui/Loader';
import { useAutoLogin } from '@/api/queries/authQueries';
import { useEffect, useState } from 'react';
import Worksites from '@/features/worksites/Worksites';
import Admin from '@/features/admin/Admin';
import Settings from '@/features/settings/Settings';
import Artisans from '@/features/artisans/Artisans';
import Planification from '@/features/planification/Planification';
import Dashboard from '@/features/dashboard/Dashboard';

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

//   const { refetch: autoLogin, isPending } = useAutoLogin();

  // Faire l'auth
  // useEffect(() => {
  //   autoLogin();
  // }, [autoLogin]);

//   if (isPending) return <Loader />


  return (
    <div className="min-h-screen flex">
      {isAuthenticated && <Sidebar />}
      <main className="flex-grow p-8">
        <Routes>
          {/* Routes publiques */}
          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Routes privées */}
          <Route element={<PrivateRoutes />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/worksites" element={<Worksites />} />
            <Route path="/artisans" element={<Artisans />} />
            <Route path="/planification" element={<Planification />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Route par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/error" element={<Error />} />
        </Routes>
      </main>
    </div>
  );
};

export default AppRoutes;
