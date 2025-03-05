import { Button } from '@/components/ui/Button';
import Searchbar from '@/components/ui/Searchbar';
import mockData from '@/mocks/userMock.json';
import { ArtisanUser, ChefUser, ArtisanFormData } from '@/types/userType';
import { AnimatePresence, motion } from 'framer-motion';
import { HardHat, Pickaxe, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import ArtisansList from './components/ArtisansList';
import ChefsList from './components/ChefsList';
import AddArtisan from './components/AddArtisan';

type SortDirection = 'asc' | 'desc' | null;

type UserWithRole = {
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    user_id: number;
    specialites: string[];
};

export default function Artisans() {
    const [view, setView] = useState<'artisans' | 'chefs'>('artisans');
    const [sortColumn, setSortColumn] = useState<string>('nom');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [artisans, setArtisans] = useState(
        mockData.artisans.map((artisan) => ({
            ...artisan,
            user: mockData.users.find((user) => user.id === artisan.user_id)!,
            nombre_chantiers: artisan.history_worksite.length + (artisan.current_worksite ? 1 : 0),
        }))
    );
    const [chefs, setChefs] = useState(
        mockData.chefs.map((chef) => ({
            ...chef,
            user: mockData.users.find((user) => user.id === chef.user_id)!,
        }))
    );
    const [deleteModalUser, setDeleteModalUser] = useState<UserWithRole | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    const handleAdd = async (data: ArtisanFormData) => {
        // Vérifier si l'email existe déjà
        const emailExists = mockData.users.some(user => user.email === data.email);
        if (emailExists) {
            throw new Error("Cette adresse email est déjà utilisée");
        }

        const baseUser = {
            user: {
                id: mockData.users.length + 1,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: "password", 
                role: view === 'artisans' ? 'artisan' : 'chef',
                date_creation: new Date().toISOString().split('T')[0],
            },
            user_id: mockData.users.length + 1,
            disponible: true,
            specialites: data.specialites || [],
            current_worksite: '',
            history_worksite: [],
        };

        const newUser = view === 'artisans' 
            ? {
                ...baseUser,
                note_moyenne: 0,
                nombre_chantiers: 0
              }
            : {
                ...baseUser,
                note_moyenne: 0,
                years_experience: data.years_experience || 0,
                chantiers_en_cours: 0,
                chantiers_termines: 0
              };

              console.log(newUser);
        
        if (view === 'artisans') {
            setArtisans(prev => [...prev, newUser as any]);
        } else {
            setChefs(prev => [...prev, newUser as any]);
        }
        setIsAddModalOpen(false);
    };

    const handleDeleteClick = (user: UserWithRole) => {
        setDeleteModalUser(user);
    };

    const handleDeleteConfirm = () => {
        if (deleteModalUser) {
            if (view === 'artisans') {
                setArtisans((currentArtisans) =>
                    currentArtisans.filter((artisan) => artisan.user_id !== deleteModalUser.user_id)
                );
            } else {
                setChefs((currentChefs) =>
                    currentChefs.filter((chef) => chef.user_id !== deleteModalUser.user_id)
                );
            }
            setDeleteModalUser(null);
        }
    };

    const filteredData = useMemo(() => {
        const data = view === 'artisans' ? artisans : chefs;

        if (!searchQuery) return data;

        const searchLower = searchQuery.toLowerCase();
        return data.filter(
            (item) =>
                `${item.user.firstName} ${item.user.lastName}`
                    .toLowerCase()
                    .includes(searchLower) ||
                item.user.email.toLowerCase().includes(searchLower) ||
                item.specialites.some((spec) => spec.toLowerCase().includes(searchLower))
        );
    }, [searchQuery, view, artisans, chefs]);

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
                    <Button
                        variant="primary"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus className="mr-2" size={16} />
                        Ajouter {view === 'artisans' ? 'un artisan' : 'un chef'}
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
                                    x: view === 'artisans' ? '0%' : '100%',
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
                    data={filteredData as ArtisanUser[]}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onDelete={handleDeleteClick}
                />
            ) : (
                <ChefsList
                    data={filteredData as ChefUser[]}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onDelete={handleDeleteClick}
                />
            )}

            {/* Modal de confirmation de suppression */}
            {deleteModalUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[400px]">
                        <h3 className="text-lg font-semibold mb-2">
                            Supprimer {view === 'artisans' ? "l'artisan" : 'le chef'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer{' '}
                            {view === 'artisans' ? "l'artisan" : 'le chef'}{' '}
                            {deleteModalUser?.user.firstName} {deleteModalUser?.user.lastName} ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded hover:bg-gray-100"
                                onClick={() => setDeleteModalUser(null)}
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

            {isAddModalOpen && (
                <AddArtisan
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAdd}
                    view={view}
                />
            )}
        </div>
    );
}
