import { Button } from '@/components/ui/Button';
import Searchbar from '@/components/ui/Searchbar';
import worksiteMockData from '@/mocks/worksiteMock.json';
import { Worksite } from '@/types/worksiteType';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Pause, Plus, TrafficCone } from 'lucide-react';
import { useMemo, useState } from 'react';
import WorksitesKanban from './components/WorksitesKanban';
import WorksitesList from './components/WorksitesList';
import WorksitesMap from './components/WorksitesMap';
import AddWorksite from './components/AddWorksite';

export default function Worksites() {
    const [view, setView] = useState<'list' | 'kanban' | 'map'>('list');
    const [sortColumn, setSortColumn] = useState<keyof Worksite | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [worksites, setWorksites] = useState<Worksite[]>(worksiteMockData.worksites as Worksite[]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const handleAddWorksite = (newWorksite: Partial<Worksite>) => {
        setWorksites(prev => [...prev, newWorksite as Worksite]);
    };

    const handleSort = (column: keyof Worksite) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const filteredData = useMemo(() => {
        if (!searchQuery) return worksites;

        const searchLower = searchQuery.toLowerCase();
        return worksites.filter(
            (worksite) =>
                worksite.name.toLowerCase().includes(searchLower) ||
                worksite.address.toLowerCase().includes(searchLower)
        );
    }, [searchQuery, worksites]);

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [filteredData, sortColumn, sortDirection]);

    const renderView = () => {
        switch (view) {
            case 'list':
                return (
                    <WorksitesList
                        data={sortedData}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                );
            case 'kanban':
                return <WorksitesKanban data={sortedData} />;
            case 'map':
                return <WorksitesMap data={sortedData} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <TrafficCone size={24} strokeWidth={1.7} />
                    <span className="text-xl font-semibold">Chantiers</span>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex gap-4 w-1/2">
                    <Searchbar onSearch={handleSearch} className="flex-1" />
                    <Button variant="primary" className="w-auto gap-2" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={16} />
                        <span>Ajouter un chantier</span>
                    </Button>
                </div>

                <div className="flex p-1 relative">
                    <AnimatePresence>
                        {view && (
                            <motion.div
                                layoutId="activeViewBackground"
                                className="absolute inset-y-1 bg-primary rounded-lg"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                animate={{
                                    width: '33.333333%',
                                    left:
                                        view === 'list'
                                            ? '0%'
                                            : view === 'kanban'
                                            ? '33.333333%'
                                            : '66.666667%',
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setView('list')}
                        className="flex-1 p-2 px-6 rounded-lg flex gap-2 items-center justify-center relative z-10"
                    >
                        <motion.div
                            animate={{ color: view === 'list' ? '#fff' : '#4B5563' }}
                            className="flex gap-2 items-center"
                            transition={{ duration: 0.2, delay: view === 'list' ? 0.1 : 0 }}
                        >
                            <Pause size={22} className="rotate-90" strokeWidth={1.7} />
                            <span className="font-medium">Liste</span>
                        </motion.div>
                    </button>
                    <button
                        onClick={() => setView('kanban')}
                        className="flex-1 p-2 px-6 rounded-lg flex gap-2 items-center justify-center relative z-10"
                    >
                        <motion.div
                            animate={{ color: view === 'kanban' ? '#fff' : '#4B5563' }}
                            className="flex gap-2 items-center"
                            transition={{ duration: 0.2, delay: view === 'kanban' ? 0.1 : 0 }}
                        >
                            <Pause size={22} strokeWidth={1.7} />
                            <span className="font-medium">Kanban</span>
                        </motion.div>
                    </button>
                    <button
                        onClick={() => setView('map')}
                        className="flex-1 p-2 px-6 rounded-lg flex gap-2 items-center justify-center relative z-10"
                    >
                        <motion.div
                            animate={{ color: view === 'map' ? '#fff' : '#4B5563' }}
                            className="flex gap-2 items-center"
                            transition={{ duration: 0.2, delay: view === 'map' ? 0.1 : 0 }}
                        >
                            <MapPin size={20} strokeWidth={1.7} />
                            <span className="font-medium">Carte</span>
                        </motion.div>
                    </button>
                </div>
            </div>

            {renderView()}

            <AddWorksite isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddWorksite={handleAddWorksite} />
        </div>
    );
}
