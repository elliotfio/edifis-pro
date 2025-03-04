import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import Searchbar from '@/components/ui/Searchbar';
import { Plus, Pickaxe, HardHat } from 'lucide-react';
import ArtisansList from './components/ArtisansList';
import mockData from '@/mocks/userMock.json';
import { AnimatePresence, motion } from 'framer-motion';
import ChefsList from './components/ChefsList';

type SortDirection = 'asc' | 'desc' | null;


// Combine users and artisans data
const artisansData = mockData.artisans.map((artisan) => ({
    ...artisan,
    user: mockData.users.find((user) => user.id === artisan.user_id)!,
}));

const chefsData = mockData.chefs.map((chef) => ({
    ...chef,
    user: mockData.users.find((user) => user.id === chef.user_id)!,
}));

export default function Artisans() {
    const [view, setView] = useState<'artisans' | 'chefs'>('artisans');
    const [sortColumn, setSortColumn] = useState<string>('nom');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection((prev) => {
                if (prev === 'asc') return 'desc';
                if (prev === 'desc') return null;
                return 'asc';
            });
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const filteredData = useMemo(() => {
        const data = view === 'artisans' ? artisansData : chefsData;
        
        if (!searchQuery) return data;
        
        const searchLower = searchQuery.toLowerCase();
        return data.filter((item) =>
            `${item.user.firstName} ${item.user.lastName}`
                .toLowerCase()
                .includes(searchLower) ||
            item.user.email.toLowerCase().includes(searchLower) ||
            item.specialites.some((spec) => spec.toLowerCase().includes(searchLower))
        );
    }, [searchQuery, view]);


    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Pickaxe size={24} strokeWidth={1.7} />
                    <span className="text-xl font-semibold">Artisans</span>
                </div>
            </div>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex gap-4 w-1/2">
                    <Searchbar onSearch={handleSearch} className="flex-1" />
                    <Button variant="primary" className="w-auto gap-2">
                        <Plus size={16} />
                        <span>Ajouter un artisan</span>
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
                                    width: '50%',
                                    x: view === 'artisans' ? '0%' : '100%'
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setView('artisans')}
                        className="flex-1 p-2 px-6 rounded-lg flex gap-2 items-center justify-center relative z-10"
                    >
                        <motion.div
                            animate={{ color: view === 'artisans' ? '#fff' : '#4B5563' }}
                            className="flex gap-2 items-center"
                            transition={{ duration: 0.2, delay: view === 'artisans' ? 0.1 : 0 }}
                        >
                            <Pickaxe size={22} strokeWidth={1.7} />
                            <span className="font-medium">Artisans</span>
                        </motion.div>
                    </button>
                    <button
                        onClick={() => setView('chefs')}
                        className="flex-1 p-2 px-6 rounded-lg flex gap-2 items-center justify-center relative z-10"
                    >
                        <motion.div
                            animate={{ color: view === 'chefs' ? '#fff' : '#4B5563' }}
                            className="flex gap-2 items-center"
                            transition={{ duration: 0.2, delay: view === 'chefs' ? 0.1 : 0 }}
                        >
                            <HardHat size={22} strokeWidth={1.7} />
                            <span className="font-medium">Chefs</span>
                        </motion.div>
                    </button>
                </div>
            </div>

            {view === 'artisans' ? (
                <ArtisansList
                    data={filteredData as typeof artisansData}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />
            ) : (
                <ChefsList
                    data={filteredData as typeof chefsData}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />
            )}
        </div>
    );
}
