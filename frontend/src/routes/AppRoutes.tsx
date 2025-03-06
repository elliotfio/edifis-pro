import { useAutoLogin } from '@/api/queries/authQueries';
import Sidebar from '@/components/layout/Sidebar';
import Loader from '@/components/ui/Loader';
import Admin from '@/features/admin/Admin';
import Artisans from '@/features/artisans/Artisans';
import Login from '@/features/auth/Login';
import Dashboard from '@/features/dashboard/Dashboard';
import Error from '@/features/Error';
import Planification from '@/features/planification/Planification';
import Settings from '@/features/settings/Settings';
import User from '@/features/show/User/User';
import Worksite from '@/features/show/Worksite/Worksite';
import Profile from '@/features/user/Profile';
import Worksites from '@/features/worksites/Worksites';
import PrivateRoutes from '@/routes/PrivateRoutes';
import PublicRoutes from '@/routes/PublicRoutes';
import { useAuthStore } from '@/stores/authStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();
  const { isExpanded } = useLayoutStore();

  const { refetch: autoLogin, isPending } = useAutoLogin();

  useEffect(() => {
    autoLogin();
  }, [autoLogin]);

  if (isPending) return <Loader />

  return (
    <div className="min-h-screen flex">
      {isAuthenticated && <Sidebar />}
      <main className={`flex-grow ${isAuthenticated ? `p-8 transition-all duration-300 ${isExpanded ? 'ml-56' : 'ml-16'}` : ''}`}>
        <Routes>
          {/* Routes publiques */}
          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Routes privées */}
          <Route element={<PrivateRoutes />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/worksites" element={<Worksites />} />
            <Route path="/worksite/:id" element={<Worksite />} />
            <Route path="/artisans" element={<Artisans />} />
            <Route path="/user/:id" element={<User />} />
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
