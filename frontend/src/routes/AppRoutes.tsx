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
const AppRoutes = () => {
//   const { isAuthenticated } = useAuthStore();
  const [isAuthenticated, _] = useState(true);

  const { refetch: autoLogin, isPending } = useAutoLogin();

  // Faire l'auth
  // useEffect(() => {
  //   autoLogin();
  // }, [autoLogin]);

  if (isPending) return <Loader />


  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && <Sidebar />}
      <main className="flex-grow">
        <Routes>
          {/* Routes publiques */}
          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Routes privées */}
          <Route element={<PrivateRoutes />}>
            <Route path="/profile" element={<Profile />} />
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
