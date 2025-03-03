import { AnimatePresence, motion } from "framer-motion";
import {
    CalendarDays,
    ChevronLeft,
    LayoutDashboard,
    LogOut,
    Settings,
    ShieldBan,
    TrafficCone,
    Users2
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarSection {
    title: string;
    items: {
        icon: React.ReactNode;
        label: string;
        href: string;
        color?: string;
    }[];
}

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const location = useLocation();

    const mainSections: SidebarSection[] = [
        {
            title: "LISTES",
            items: [
                { icon: <TrafficCone size={20} />, label: "Chantiers", href: "/worksites" },
                { icon: <Users2 size={20} />, label: "Artisans", href: "/artisans" }
            ]
        },
        {
            title: "ADMINISTRATIF",
            items: [
                { icon: <CalendarDays size={20} />, label: "Planification", href: "/planification" },
                { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard" }
            ]
        },
        {
            title: "ADMIN",
            items: [
                { icon: <ShieldBan size={20} />, label: "Gestion admin", href: "/admin" }
            ]
        }
    ];

    const bottomSection: SidebarSection = {
        title: "PERSONNEL",
        items: [
            { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
            { icon: <LogOut size={20} />, label: "Déconnexion", href: "/logout", color: "text-red-500" }
        ]
    };

    const isLinkActive = (href: string) => {
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
                    return (
                        <Link
                            key={item.label}
                            to={item.href}
                            className="flex items-center gap-3 text-gray-500 rounded-lg p-2 transition-colors group relative"
                        >
                            <AnimatePresence mode="wait">
                                {isActive && (
                                    <motion.div
                                        layoutId="activeBackground"
                                        className="absolute inset-0 bg-secondary rounded-lg"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </AnimatePresence>
                            <motion.span
                                animate={{ color: isActive ? "rgb(93, 106, 189)" : "rgb(156, 163, 175)" }}
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
                                            color: isActive ? "rgb(93, 106, 189)" : "rgb(75, 85, 99)"
                                        }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ 
                                            duration: 0.2,
                                            delay: isActive ? 0.1 : 0,
                                            color: { delay: isActive ? 0.1 : 0 }
                                        }}
                                        className="relative z-10 text-sm whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <motion.div
            animate={{ width: isExpanded ? "280px" : "70px" }}
            transition={{ duration: 0.3 }}
            className="h-screen relative bg-white border-r border-gray-100 py-6 flex flex-col"
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-8 bg-primary border border-gray-200 p-1.5 rounded-full text-white hover:bg-primary/90 transition-colors"
            >
                <motion.div animate={{ rotate: isExpanded ? 0 : 180 }} transition={{ duration: 0.3 }}>
                    <ChevronLeft size={16} />
                </motion.div>
            </button>

            {/* Profile Section */}
            <div className="px-4 flex items-center gap-4 pb-4 mb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <p className="text-primary font-semibold">R</p>
                </div>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col"
                        >
                            <span className="font-medium text-gray-900">Raph</span>
                            <span className="text-xs text-gray-500">raph@raph.raph</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main content with flex-col and justify-between */}
            <div className="flex flex-col justify-between flex-1 px-4">
                {/* Top sections */}
                <div className="space-y-6">
                    {mainSections.map(renderSection)}
                </div>

                {/* Bottom section */}
                <div className="pt-6">
                    {renderSection(bottomSection)}
                </div>
            </div>
        </motion.div>
    );
}
