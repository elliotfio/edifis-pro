import { Button } from '@/components/ui/Button';
import Searchbar from '@/components/ui/Searchbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, MapPin, Pause, Pencil, Plus, TrafficCone, Trash } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Worksite {
    id: string;
    projectName: string;
    address: string;
    startDate: string;
    endDate: string;
    status: string;
}

const mockData: Worksite[] = Array(10).fill(null).map((_, i) => ({
    id: i.toString(),
    projectName: "Emmanuel Macron",
    address: "13 Rue Jean Macé, Marseille 13010",
    startDate: "03/03/2024",
    endDate: "03/03/2024",
    status: "En cours"
}));


export default function Worksites() {
    const navigate = useNavigate();
    const [view, setView] = useState<'list' | 'kanban' | 'map'>('list');
    const [sortColumn, setSortColumn] = useState<keyof Worksite | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (value: string) => {
        setSearchQuery(value);
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
        if (!searchQuery) return mockData;

        const searchLower = searchQuery.toLowerCase();
        return mockData.filter((worksite) => 
            worksite.projectName.toLowerCase().includes(searchLower) ||
            worksite.address.toLowerCase().includes(searchLower)
        );
    }, [searchQuery]);

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
                    <Button
                        variant="primary"
                        className="w-auto"
                        >
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
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                animate={{
                                    width: "33.333333%",
                                    left: view === 'list' ? '0%' : view === 'kanban' ? '33.333333%' : '66.666667%'
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

            <Table variant="default" className="rounded-md cursor-default">
                <TableHeader sticky>
                    <TableRow>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'projectName' ? sortDirection : null}
                            onClick={() => handleSort('projectName')}
                        >
                            NOM DU PROJET
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'address' ? sortDirection : null}
                            onClick={() => handleSort('address')}
                        >
                            ADRESSE
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'startDate' ? sortDirection : null}
                            onClick={() => handleSort('startDate')}
                        >
                            DATE DE DÉBUT
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'endDate' ? sortDirection : null}
                            onClick={() => handleSort('endDate')}
                        >
                            DATE DE FIN
                        </TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map((worksite) => (
                        <TableRow key={worksite.id} hover>
                            <TableCell>{worksite.projectName}</TableCell>
                            <TableCell>{worksite.address}</TableCell>
                            <TableCell>{worksite.startDate}</TableCell>
                            <TableCell>{worksite.endDate}</TableCell>
                            <TableCell>
                                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                    {worksite.status}
                                </span>
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                                <Button variant="primary" onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/worksite/${worksite.id}`);
                                }}>
                                    <Eye size={16} />
                                </Button>
                                <Button variant="primary" onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle edit
                                }}>
                                    <Pencil size={16} />
                                </Button>
                                <Button variant="primary" onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle delete
                                }}>
                                    <Trash size={16} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}