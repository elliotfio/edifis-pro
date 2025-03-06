import { useLogout } from '@/api/queries/authQueries';
import { useAuthStore } from '@/stores/authStore';
import { useLayoutStore } from '@/stores/layoutStore';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CalendarDays,
    ChevronLeft,
    LayoutDashboard,
    LogOut,
    Pickaxe,
    Settings,
    ShieldBan,
    TrafficCone,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarSection {
    title: string;
    items: {
        icon: React.ReactNode;
        label: string;
        href?: string;
        onClick?: () => void;
        color?: string;
    }[];
}

export default function Sidebar() {
    const { isExpanded, toggleSidebar } = useLayoutStore();
    const { user } = useAuthStore();
    const location = useLocation();
    const { mutate: logout } = useLogout();

    const handleLogout = () => {
        logout();
    };

    // Fonction pour vérifier les permissions selon le rôle
    const hasAccess = (requiredRoles: string[]) => {
        if (!user || !user.role) return false;
        return requiredRoles.includes(user.role);
    };

    const mainSections: SidebarSection[] = [
        {
            title: 'LISTES',
            items: [
                { icon: <TrafficCone size={20} />, label: 'Chantiers', href: '/worksites' },
                ...(hasAccess(['admin', 'employé', 'chef'])
                    ? [{ icon: <Pickaxe size={20} />, label: 'Artisans', href: '/artisans' }]
                    : []),
            ],
        },
        {
            title: 'ADMINISTRATIF',
            items: [
                ...(hasAccess(['admin', 'employé', 'chef'])
                    ? [
                          {
                              icon: <CalendarDays size={20} />,
                              label: 'Planification',
                              href: '/planification',
                          },
                          {
                              icon: <LayoutDashboard size={20} />,
                              label: 'Dashboard',
                              href: '/dashboard',
                          },
                      ]
                    : []),
            ],
        },
        ...(hasAccess(['admin'])
            ? [
                  {
                      title: 'ADMIN',
                      items: [
                          { icon: <ShieldBan size={20} />, label: 'Gestion admin', href: '/admin' },
                      ],
                  },
              ]
            : []),
    ].filter((section) => section.items.length > 0); // Filtrer les sections vides

    const bottomSection: SidebarSection = {
        title: 'PERSONNEL',
        items: [
            ...(hasAccess(['admin'])
                ? [{ icon: <Settings size={20} />, label: 'Settings', href: '/settings' }]
                : []),
            {
                icon: <LogOut size={20} />,
                label: 'Déconnexion',
                onClick: handleLogout,
                color: 'text-red-500',
            },
        ],
    };

    const isLinkActive = (href?: string) => {
        if (!href) return false;
        if (href === '/worksites' && location.pathname.startsWith('/worksite/')) {
            return true;
        }
        if (href === '/artisans' && location.pathname.startsWith('/user/')) {
            return true;
        }
        return location.pathname === href;
    };

    const renderSection = (section: SidebarSection) => (
        <div key={section.title}>
            <AnimatePresence>
                {isExpanded && (
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-medium text-gray-400 mb-2"
                    >
                        {section.title}
                    </motion.h3>
                )}
            </AnimatePresence>
            <nav className="space-y-1">
                {section.items.map((item) => {
                    const isActive = isLinkActive(item.href);

                    if (item.href) {
                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={`flex items-center gap-3 text-gray-500 rounded-lg p-2 transition-colors group relative w-full ${
                                    item.color || ''
                                }`}
                            >
                                <AnimatePresence mode="wait">
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeBackground"
                                            className="absolute inset-0 bg-secondary rounded-lg"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 30,
                                            }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}
                                </AnimatePresence>
                                <motion.span
                                    animate={{
                                        color: isActive ? 'rgb(93, 106, 189)' : 'currentColor',
                                    }}
                                    transition={{ duration: 0.2, delay: isActive ? 0.1 : 0 }}
                                    className="relative z-10 flex-shrink-0"
                                >
                                    {item.icon}
                                </motion.span>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                                color: isActive
                                                    ? 'rgb(93, 106, 189)'
                                                    : 'currentColor',
                                            }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{
                                                duration: 0.2,
                                                delay: isActive ? 0.1 : 0,
                                                color: { delay: isActive ? 0.1 : 0 },
                                            }}
                                            className="relative z-10 text-sm whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    } else {
                        return (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                className={`flex items-center gap-3 text-gray-500 rounded-lg p-2 transition-colors group relative w-full ${
                                    item.color || ''
                                }`}
                            >
                                <AnimatePresence mode="wait">
                                    {isLinkActive(item.href) && (
                                        <motion.div
                                            layoutId="activeBackground"
                                            className="absolute inset-0 bg-secondary rounded-lg"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 30,
                                            }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}
                                </AnimatePresence>
                                <motion.span
                                    animate={{
                                        color: isLinkActive(item.href)
                                            ? 'rgb(93, 106, 189)'
                                            : 'currentColor',
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        delay: isLinkActive(item.href) ? 0.1 : 0,
                                    }}
                                    className="relative z-10 flex-shrink-0"
                                >
                                    {item.icon}
                                </motion.span>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                                color: isLinkActive(item.href)
                                                    ? 'rgb(93, 106, 189)'
                                                    : 'currentColor',
                                            }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{
                                                duration: 0.2,
                                                delay: isLinkActive(item.href) ? 0.1 : 0,
                                                color: { delay: isLinkActive(item.href) ? 0.1 : 0 },
                                            }}
                                            className="relative z-10 text-sm whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        );
                    }
                })}
            </nav>
        </div>
    );

    const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?';

    return (
        <motion.aside
            animate={{
                width: isExpanded ? '240px' : '72px',
                transition: { duration: 0.3, ease: 'easeInOut' },
            }}
            className="h-screen bg-white border-r border-gray-200 flex flex-col py-4 fixed left-0 top-0"
        >
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={`absolute -right-3 top-6 p-1.5 rounded-full bg-primary border border-gray-200 hover:bg-primary/90 transition-colors ${
                    !isExpanded && 'rotate-180'
                }`}
            >
                <ChevronLeft size={16} color="white" />
            </button>

            {/* Profile Section */}
            <div className="px-4 flex items-center gap-4 pb-4 mb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <p className="text-primary font-semibold">{userInitials}</p>
                </div>
                <AnimatePresence>
                    {isExpanded && user && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col"
                        >
                            <span className="font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                            </span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main content with flex-col and justify-between */}
            <div className="flex flex-col justify-between flex-1 px-4">
                {/* Top sections */}
                <div className="space-y-6">{mainSections.map(renderSection)}</div>

                {/* Bottom section */}
                <div className="pt-6">{renderSection(bottomSection)}</div>
            </div>
        </motion.aside>
    );
}
