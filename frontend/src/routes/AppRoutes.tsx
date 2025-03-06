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
    const { isAuthenticated, user } = useAuthStore();
    const { isExpanded } = useLayoutStore();

    const { refetch: autoLogin, isPending } = useAutoLogin();

    useEffect(() => {
        autoLogin();
    }, [autoLogin]);

    if (isPending) return <Loader />;

    // Fonction pour vérifier les permissions selon le rôle
    const hasAccess = (requiredRoles: string[]) => {
        if (!user || !user.role) return false;
        return requiredRoles.includes(user.role);
    };

    return (
        <>
            {/* Route d'erreur affichée au-dessus de tout */}
            <Routes>
                <Route path="/error" element={<Error />} />
            </Routes>

            <div className="min-h-screen flex">
                {isAuthenticated && <Sidebar />}
                <main
                    className={`flex-grow ${
                        isAuthenticated
                            ? `p-8 transition-all duration-300 ${isExpanded ? 'ml-56' : 'ml-16'}`
                            : ''
                    }`}
                >
                    <Routes>
                        {/* Routes publiques */}
                        <Route element={<PublicRoutes />}>
                            <Route path="/login" element={<Login />} />
                        </Route>

                        {/* Routes privées */}
                        <Route element={<PrivateRoutes />}>
                            {/* Routes accessibles à tous les utilisateurs authentifiés */}
                            <Route path="/profile" element={<Profile />} />

                            {/* Routes accessibles aux admin, employé, chef et artisan */}
                            <Route path="/worksites" element={<Worksites />} />
                            <Route path="/worksite/:id" element={<Worksite />} />

                            {/* Routes accessibles aux admin, employé et chef */}
                            <Route
                                path="/artisans"
                                element={
                                    hasAccess(['admin', 'employé', 'chef']) ? (
                                        <Artisans />
                                    ) : (
                                        <Navigate to="/error" replace />
                                    )
                                }
                            />
                            <Route
                                path="/user/:id"
                                element={
                                    hasAccess(['admin', 'employé', 'chef']) ? (
                                        <User />
                                    ) : (
                                        <Navigate to="/error" replace />
                                    )
                                }
                            />
                            <Route
                                path="/planification"
                                element={
                                    hasAccess(['admin', 'employé', 'chef']) ? (
                                        <Planification />
                                    ) : (
                                        <Navigate to="/error" replace />
                                    )
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    hasAccess(['admin', 'employé', 'chef']) ? (
                                        <Dashboard />
                                    ) : (
                                        <Navigate to="/error" replace />
                                    )
                                }
                            />

                            {/* Routes accessibles uniquement aux admin */}
                            <Route
                                path="/admin"
                                element={
                                    hasAccess(['admin']) ? (
                                        <Admin />
                                    ) : (
                                        <Navigate to="/error" replace />
                                    )
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    hasAccess(['admin']) ? (
                                        <Settings />
                                    ) : (
                                        <Navigate to="/error" replace />
                                    )
                                }
                            />
                        </Route>

                        {/* Route par défaut */}
                        <Route
                            path="/"
                            element={
                                <Navigate to={isAuthenticated ? '/worksites' : '/login'} replace />
                            }
                        />
                        <Route
                            path="*"
                            element={
                                <Navigate to={isAuthenticated ? '/error' : '/login'} replace />
                            }
                        />
                    </Routes>
                </main>
            </div>
        </>
    );
};

export default AppRoutes;
