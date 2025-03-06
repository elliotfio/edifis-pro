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
    years_experience?: number;
};

export default function Admin() {
    const [sortColumn, setSortColumn] = useState<string>('nom');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
                    specialites: [] 
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

    const handleAddUser = async (data: UserFormData) => {
        try {
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'ajout de l\'utilisateur');
            }

            const result = await response.json();
            
            const newUser: UserWithRole = {
                user: {
                    id: result.userId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                    date_creation: new Date().toISOString(),
                },
                user_id: result.userId,
                specialites: data.specialites || [],
            };

            setUsers((currentUsers) => [...currentUsers, newUser]);
            setIsAddModalOpen(false);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erreur lors de l\'ajout de l\'utilisateur');
        }
    };

    const handleEditUser = async (data: UserFormData) => {
        if (!editingUser) return;

        try {
            console.log('Sending data:', {
                ...data,
                oldRole: editingUser.user.role,
            });

            const response = await fetch(`http://localhost:3000/api/users/${editingUser.user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    oldRole: editingUser.user.role,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la modification de l\'utilisateur');
            }

            // Mettre à jour l'état local
            setUsers((currentUsers) =>
                currentUsers.map((user) => {
                    if (user.user.id === editingUser.user.id) {
                        const updatedUser = {
                            user: {
                                ...user.user,
                                id: editingUser.user.id,
                                firstName: data.firstName,
                                lastName: data.lastName,
                                email: data.email,
                                role: data.role,
                            },
                            user_id: editingUser.user.id,
                            specialites: data.role === 'artisan' ? data.specialites || [] : [],
                            years_experience: data.role === 'chef' ? data.years_experience || 0 : undefined,
                        };
                        console.log('Updated user:', updatedUser);
                        return updatedUser;
                    }
                    return user;
                })
            );
            setEditingUser(null);
        } catch (error) {
            console.error('Error editing user:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erreur lors de la modification de l\'utilisateur');
        }
    };

    const handleDeleteUser = (userId: number) => {
        setUsers(currentUsers => currentUsers.filter(user => user.user.id !== userId));
    };

    const filteredData = useMemo(() => {
        let data = [...users];

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

            <UsersList
                users={filteredData}
                onSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onDelete={handleDeleteUser}
                onEditClick={setEditingUser}
                isLoading={isLoading}
            />

            {isAddModalOpen && (
                <AddUser
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddUser}
                />
            )}

            {editingUser && (
                <EditUser
                    user={editingUser}
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    onSubmit={handleEditUser}
                />
            )}
        </div>
    );
}
