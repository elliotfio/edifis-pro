import { Button } from '@/components/ui/Button';
import Searchbar from '@/components/ui/Searchbar';
import mockData from '@/mocks/userMock.json';
import { Plus, ShieldBan } from 'lucide-react';
import { useMemo, useState } from 'react';
import UsersList from './components/UsersList';

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
    const [users, setUsers] = useState(
        mockData.users.map((user) => ({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                date_creation: user.date_creation,
            },
            user_id: user.id,
            specialites:
                user.role === 'artisan'
                    ? mockData.artisans.find((a) => a.user_id === user.id)?.specialites || []
                    : mockData.chefs.find((c) => c.user_id === user.id)?.specialites || [],
        }))
    );
    const [deleteModalUser, setDeleteModalUser] = useState<UserWithRole | null>(null);

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

    const handleDeleteConfirm = () => {
        if (deleteModalUser) {
            setUsers((currentUsers) =>
                currentUsers.filter((user) => user.user_id !== deleteModalUser.user_id)
            );
            setDeleteModalUser(null);
        }
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
                <Button className="shrink-0">
                    <Plus size={20} className="mr-2" />
                    Ajouter un utilisateur
                </Button>
            </div>

            <UsersList
                data={filteredData}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onDelete={handleDeleteClick}
            />

            {deleteModalUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[400px]">
                        <h3 className="text-lg font-semibold mb-2">Supprimer le chantier</h3>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer le chantier "
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
