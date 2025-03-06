import { Button } from '@/components/ui/Button';
import Searchbar from '@/components/ui/Searchbar';
import { ArtisanFormData, ArtisanUser, ChefUser } from '@/types/userType';
import { AnimatePresence, motion } from 'framer-motion';
import { HardHat, Pickaxe, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AddArtisan from './components/AddArtisan';
import ArtisansList from './components/ArtisansList';
import ChefsList from './components/ChefsList';
import EditArtisan from './components/EditArtisan';

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
    const [artisans, setArtisans] = useState<ArtisanUser[]>([]);
    const [chefs, setChefs] = useState<ChefUser[]>([]);
    const [deleteModalUser, setDeleteModalUser] = useState<UserWithRole | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<ArtisanUser | ChefUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [artisansResponse, chefsResponse] = await Promise.all([
                    fetch('http://localhost:3000/api/artisans'),
                    fetch('http://localhost:3000/api/chefs')
                ]);

                if (!artisansResponse.ok || !chefsResponse.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }

                const [artisansData, chefsData] = await Promise.all([
                    artisansResponse.json(),
                    chefsResponse.json()
                ]);

                // Transformer les données des artisans
                const formattedArtisans = artisansData.map((item: any) => ({
                    user: {
                        id: item.user_id,
                        firstName: item.firstName,
                        lastName: item.lastName,
                        email: item.email,
                        role: item.role,
                        date_creation: item.date_creation
                    },
                    user_id: item.user_id,
                    disponible: item.disponible,
                    specialites: Array.isArray(item.specialites) 
                        ? item.specialites 
                        : (item.specialites ? item.specialites.split(',') : []),
                    note_moyenne: item.note_moyenne,
                    current_worksite: item.current_worksite,
                    history_worksite: item.history_worksite || [],
                    all_worksites: Array.isArray(item.history_worksite) 
                        ? item.history_worksite.length + (item.current_worksite ? 1 : 0)
                        : 0
                }));

                // Transformer les données des chefs
                const formattedChefs = chefsData.map((item: any) => ({
                    user: {
                        id: item.user_id,
                        firstName: item.firstName,
                        lastName: item.lastName,
                        email: item.email,
                        role: item.role,
                        date_creation: item.date_creation
                    },
                    user_id: item.user_id,
                    disponible: item.disponible,
                    specialites: ['Chef de chantier'],
                    years_experience: item.years_experience,
                    note_moyenne: item.note_moyenne,
                    current_worksite: item.current_worksite,
                    history_worksite: item.history_worksite || [],
                    all_worksites: Array.isArray(item.history_worksite) 
                        ? item.history_worksite.length + (item.current_worksite ? 1 : 0)
                        : 0
                }));

                setArtisans(formattedArtisans);
                setChefs(formattedChefs);
            } catch (err) {
                console.error('Erreur:', err);
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

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
        try {
            const endpoint = view === 'artisans' 
                ? 'http://localhost:3000/api/artisans'
                : 'http://localhost:3000/api/chefs';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: `${data.lastName}.${data.firstName}`,
                    specialites: view === 'artisans' ? data.specialites : undefined,
                    years_experience: view === 'chefs' ? data.years_experience : undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur lors de la création ${view === 'artisans' ? "de l'artisan" : 'du chef'}`);
            }

            const result = await response.json();
            
            const newUser = {
                user: {
                    id: result[view === 'artisans' ? 'artisan' : 'chef'].user_id,
                    firstName: result[view === 'artisans' ? 'artisan' : 'chef'].firstName,
                    lastName: result[view === 'artisans' ? 'artisan' : 'chef'].lastName,
                    email: result[view === 'artisans' ? 'artisan' : 'chef'].email,
                    role: result[view === 'artisans' ? 'artisan' : 'chef'].role,
                    date_creation: result[view === 'artisans' ? 'artisan' : 'chef'].date_creation,
                },
                user_id: result[view === 'artisans' ? 'artisan' : 'chef'].user_id,
                disponible: result[view === 'artisans' ? 'artisan' : 'chef'].disponible,
                specialites: view === 'artisans' 
                    ? result.artisan.specialites
                    : ['Chef de chantier'],
                years_experience: view === 'chefs' ? result.chef.years_experience : undefined,
                note_moyenne: result[view === 'artisans' ? 'artisan' : 'chef'].note_moyenne,
                current_worksite: result[view === 'artisans' ? 'artisan' : 'chef'].current_worksite,
                history_worksite: result[view === 'artisans' ? 'artisan' : 'chef'].history_worksite || [],
                all_worksites: Array.isArray(result[view === 'artisans' ? 'artisan' : 'chef'].history_worksite) 
                    ? result[view === 'artisans' ? 'artisan' : 'chef'].history_worksite.length + 
                      (result[view === 'artisans' ? 'artisan' : 'chef'].current_worksite ? 1 : 0)
                    : 0
            };

            if (view === 'artisans') {
                setArtisans(prev => [...prev, newUser]);
            } else {
                setChefs(prev => [...prev, newUser]);
            }
            setIsAddModalOpen(false);

        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    };

    const handleEdit = async (formData: ArtisanFormData) => {
        if (!editingUser) return;

        // Vérifier si l'email existe déjà (sauf pour l'utilisateur en cours d'édition)
        const emailExists = view === 'artisans' 
            ? artisans.some(user => user.user.email === formData.email && user.user.id !== editingUser.user.id)
            : chefs.some(user => user.user.email === formData.email && user.user.id !== editingUser.user.id);

        if (emailExists) {
            throw new Error('Cette adresse email est déjà utilisée');
        }

        try {
            const endpoint = view === 'artisans'
                ? `http://localhost:3000/api/artisans/${editingUser.user_id}`
                : `http://localhost:3000/api/chefs/${editingUser.user_id}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    specialites: view === 'artisans' ? formData.specialites : undefined,
                    years_experience: view === 'chefs' ? formData.years_experience : undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur lors de la mise à jour ${view === 'artisans' ? "de l'artisan" : 'du chef'}`);
            }

            const result = await response.json();
            
            const updatedUser = {
                user: {
                    id: result[view === 'artisans' ? 'artisan' : 'chef'].user_id,
                    firstName: result[view === 'artisans' ? 'artisan' : 'chef'].firstName,
                    lastName: result[view === 'artisans' ? 'artisan' : 'chef'].lastName,
                    email: result[view === 'artisans' ? 'artisan' : 'chef'].email,
                    role: result[view === 'artisans' ? 'artisan' : 'chef'].role,
                    date_creation: result[view === 'artisans' ? 'artisan' : 'chef'].date_creation,
                },
                user_id: result[view === 'artisans' ? 'artisan' : 'chef'].user_id,
                disponible: result[view === 'artisans' ? 'artisan' : 'chef'].disponible,
                specialites: view === 'artisans' 
                    ? result.artisan.specialites
                    : ['Chef de chantier'],
                years_experience: view === 'chefs' ? result.chef.years_experience : undefined,
                note_moyenne: result[view === 'artisans' ? 'artisan' : 'chef'].note_moyenne,
                current_worksite: result[view === 'artisans' ? 'artisan' : 'chef'].current_worksite,
                history_worksite: result[view === 'artisans' ? 'artisan' : 'chef'].history_worksite || [],
                all_worksites: Array.isArray(result[view === 'artisans' ? 'artisan' : 'chef'].history_worksite) 
                    ? result[view === 'artisans' ? 'artisan' : 'chef'].history_worksite.length + 
                      (result[view === 'artisans' ? 'artisan' : 'chef'].current_worksite ? 1 : 0)
                    : 0
            };

            if (view === 'artisans') {
                setArtisans(prev => prev.map(item => item.user_id === editingUser.user_id ? updatedUser : item));
            } else {
                setChefs(prev => prev.map(item => item.user_id === editingUser.user_id ? updatedUser : item));
            }
            setEditingUser(null);

        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    };

    const handleDeleteClick = (user: UserWithRole) => {
        setDeleteModalUser(user);
    };

    const handleDeleteConfirm = async () => {
        if (deleteModalUser) {
            try {
                const endpoint = view === 'artisans' 
                    ? `http://localhost:3000/api/artisans/${deleteModalUser.user_id}`
                    : `http://localhost:3000/api/chefs/${deleteModalUser.user_id}`;

                const response = await fetch(endpoint, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erreur lors de la suppression de ${view === 'artisans' ? "l'artisan" : 'du chef'}`);
                }

                if (view === 'artisans') {
                    setArtisans(prev => prev.filter(artisan => artisan.user_id !== deleteModalUser.user_id));
                } else {
                    setChefs(prev => prev.filter(chef => chef.user_id !== deleteModalUser.user_id));
                }
                setDeleteModalUser(null);

            } catch (error) {
                console.error('Erreur:', error);
                throw error;
            }
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

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div>Erreur: {error}</div>;
    }

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
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2" size={16} />
                        Ajouter {view === 'artisans' ? "un artisan" : 'un chef'}
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
                            <Pickaxe size={20} strokeWidth={1.7} />
                            <span className="text-sm font-medium">Artisans</span>
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
                            <HardHat size={20} strokeWidth={1.7} />
                            <span className="font-medium text-sm">Chefs</span>
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
                    onEdit={setEditingUser}
                />
            ) : (
                <ChefsList
                    data={filteredData as ChefUser[]}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onDelete={handleDeleteClick}
                    onEdit={setEditingUser}
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

            {editingUser && (
                <EditArtisan
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    onEdit={handleEdit}
                    artisan={editingUser}
                    view={view}
                />
            )}
        </div>
    );
}
