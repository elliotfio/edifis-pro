import { Button } from '@/components/ui/Button';
import Searchbar from '@/components/ui/Searchbar';
import { Plus, ShieldBan } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import UsersList from './components/UsersList';
import AddUser from './components/AddUser';
import EditUser from './components/EditUser';
import { UserFormData } from '@/validators/userValidator';

type SortDirection = 'asc' | 'desc' | null;

type UserWithRole = {
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        date_creation: string;
    };
    user_id: number;
    specialites: string[];
};

export default function Admin() {
    const [sortColumn, setSortColumn] = useState<string>('nom');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModalUser, setDeleteModalUser] = useState<UserWithRole | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('http://localhost:3000/api/users');
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des utilisateurs');
                }
                const data = await response.json();
                
                // Transformation des données pour correspondre à la structure UserWithRole
                const formattedUsers: UserWithRole[] = data.map((user: any) => ({
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        date_creation: user.date_creation || new Date().toISOString()
                    },
                    user_id: user.id,
                    specialites: [] // À implémenter quand les spécialités seront disponibles
                }));

                setUsers(formattedUsers);
            } catch (error) {
                console.error('Erreur:', error);
                setError(error instanceof Error ? error.message : 'Une erreur est survenue');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
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

    const handleDeleteClick = (user: UserWithRole) => {
        setDeleteModalUser(user);
    };

    const handleEditClick = (user: UserWithRole) => {
        setEditingUser(user);
    };

    const handleDeleteConfirm = () => {
        if (deleteModalUser) {
            setUsers((currentUsers) =>
                currentUsers.filter((user) => user.user_id !== deleteModalUser.user_id)
            );
            setDeleteModalUser(null);
        }
    };

    const handleAddUser = async (data: UserFormData) => {
        const newUser: UserWithRole = {
            user: {
                id: users.length + 1, // Pour le mock, en production ce serait géré par le backend
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                role: data.role,
                date_creation: new Date().toISOString(),
            },
            user_id: users.length + 1,
            specialites: data.specialites || [],
        };

        setUsers((currentUsers) => [...currentUsers, newUser]);
    };

    const handleEditUser = async (data: UserFormData) => {
        if (!editingUser) return;

        setUsers((currentUsers) =>
            currentUsers.map((user) => {
                if (user.user_id === editingUser.user_id) {
                    return {
                        user: {
                            ...user.user,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            email: data.email,
                            role: data.role,
                        },
                        user_id: user.user_id,
                        specialites: data.specialites || [],
                    };
                }
                return user;
            })
        );
        setEditingUser(null);
    };

    const filteredData = useMemo(() => {
        let data = [...users];

        // Appliquer le tri
        if (sortColumn && sortDirection) {
            data.sort((a, b) => {
                let compareA, compareB;

                switch (sortColumn) {
                    case 'nom':
                        compareA = `${a.user.firstName} ${a.user.lastName}`.toLowerCase();
                        compareB = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
                        break;
                    case 'email':
                        compareA = a.user.email.toLowerCase();
                        compareB = b.user.email.toLowerCase();
                        break;
                    default:
                        return 0;
                }

                if (sortDirection === 'asc') {
                    return compareA > compareB ? 1 : -1;
                } else {
                    return compareA < compareB ? 1 : -1;
                }
            });
        }

        // Appliquer le filtre de recherche
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            data = data.filter(
                (user) =>
                    `${user.user.firstName} ${user.user.lastName}`
                        .toLowerCase()
                        .includes(searchLower) ||
                    user.user.email.toLowerCase().includes(searchLower) ||
                    user.specialites.some((spec) => spec.toLowerCase().includes(searchLower))
            );
        }

        return data;
    }, [users, searchQuery, sortColumn, sortDirection]);

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6 ">
                <div className="flex items-center gap-2">
                    <ShieldBan size={24} />
                    <span className="text-xl font-semibold">Panneau d'administration</span>
                </div>
            </div>
            <div className="flex items-center gap-4 mb-6 w-1/2">
                <Searchbar onSearch={handleSearch} className="flex-1" />
                <Button className="shrink-0" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={20} className="mr-2" />
                    Ajouter un utilisateur
                </Button>
            </div>

            {error ? (
                <div className="text-red-500 p-4 rounded-lg bg-red-50">
                    {error}
                </div>
            ) : isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <UsersList
                    data={filteredData}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onDelete={handleDeleteClick}
                    onEdit={handleEditClick}
                />
            )}

            <AddUser 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            {editingUser && (
                <EditUser
                    isOpen={true}
                    onClose={() => setEditingUser(null)}
                    onEdit={handleEditUser}
                    initialData={{
                        firstName: editingUser.user.firstName,
                        lastName: editingUser.user.lastName,
                        email: editingUser.user.email,
                        role: editingUser.user.role as UserFormData['role'],
                        specialites: editingUser.specialites,
                        years_experience: undefined, // You might want to add this to your UserWithRole type if needed
                    }}
                />
            )}

            {deleteModalUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[400px]">
                        <h3 className="text-lg font-semibold mb-2">Supprimer l'utilisateur</h3>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer l'utilisateur "
                            {deleteModalUser.user.firstName} {deleteModalUser.user.lastName}" ? Cette action est irréversible.
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
        </div>
    );
}
