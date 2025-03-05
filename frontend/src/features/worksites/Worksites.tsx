import { Button } from '@/components/ui/Button';
import Searchbar from '@/components/ui/Searchbar';
import { Worksite } from '@/types/worksiteType';
import { AnimatePresence, motion } from 'framer-motion';
import { List, MapPin, Plus, LayoutGrid } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import AddWorksite from './components/AddWorksite';
import WorksitesKanban from './components/WorksitesKanban';
import WorksitesList from './components/WorksitesList';
import WorksitesMap from './components/WorksitesMap';

export default function Worksites() {
    const [view, setView] = useState<'list' | 'kanban' | 'map'>('list');
    const [sortColumn, setSortColumn] = useState<keyof Worksite>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [worksites, setWorksites] = useState<Worksite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModalWorksite, setDeleteModalWorksite] = useState<Worksite | null>(null);

    useEffect(() => {
        const fetchWorksites = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/worksites');
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des chantiers');
                }
                const data = await response.json();
                setWorksites(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorksites();
    }, []);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const handleAddWorksite = (newWorksite: Partial<Worksite>) => {
        setWorksites(prev => [...prev, newWorksite as Worksite]);
    };

    const handleUpdateWorksite = (updatedWorksite: Worksite) => {
        setWorksites(currentWorksites => 
            currentWorksites.map(worksite => 
                worksite.id === updatedWorksite.id ? updatedWorksite : worksite
            )
        );
    };

    const handleDeleteClick = (worksite: Worksite) => {
        setDeleteModalWorksite(worksite);
    };

    const handleDeleteConfirm = () => {
        if (deleteModalWorksite) {
            setWorksites(currentWorksites => 
                currentWorksites.filter(worksite => worksite.id !== deleteModalWorksite.id)
            );
            setDeleteModalWorksite(null);
        }
    };

    const handleSort = (column: keyof Worksite) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        let filtered = [...worksites];
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            filtered = filtered.filter(
                worksite =>
                    worksite.name.toLowerCase().includes(searchLower) ||
                    worksite.address.toLowerCase().includes(searchLower)
            );
        }

        return filtered.sort((a, b) => {
            if (sortDirection === 'asc') {
                return a[sortColumn] > b[sortColumn] ? 1 : -1;
            }
            return a[sortColumn] < b[sortColumn] ? 1 : -1;
        });
    }, [worksites, searchQuery, sortColumn, sortDirection]);

    const renderView = () => {
        if (isLoading) {
            return <div className="text-center py-8">Chargement...</div>;
        }

        if (error) {
            return <div className="text-center py-8 text-red-600">{error}</div>;
        }

        switch (view) {
            case 'list':
                return (
                    <WorksitesList
                        data={sortedData}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        onUpdate={handleUpdateWorksite}
                        onDelete={handleDeleteClick}
                        onAddWorksite={handleAddWorksite}
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
                    <MapPin size={24} strokeWidth={1.7} />
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
                                    x:
                                        view === 'list'
                                            ? '0%'
                                            : view === 'kanban'
                                            ? '100%'
                                            : '200%',
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
                            <List size={20} strokeWidth={1.7} />
                            <span className="text-sm font-medium">Liste</span>
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
                            <LayoutGrid size={20} strokeWidth={1.7} />
                            <span className="text-sm font-medium">Kanban</span>
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
                            <span className="text-sm font-medium">Carte</span>
                        </motion.div>
                    </button>
                </div>
            </div>

            {renderView()}

            <AddWorksite
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddWorksite={handleAddWorksite}
            />

            {/* Modal de confirmation de suppression */}
            {deleteModalWorksite && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[400px]">
                        <h3 className="text-lg font-semibold mb-2">Supprimer le chantier</h3>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer le chantier "{deleteModalWorksite.name}" ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                className="px-4 py-2 rounded hover:bg-gray-100"
                                onClick={() => setDeleteModalWorksite(null)}
                            >
                                Annuler
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={handleDeleteConfirm}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
