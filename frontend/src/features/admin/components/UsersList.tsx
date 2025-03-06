import { Button } from '@/components/ui/Button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import { formatDateToDDMMYYYY } from '@/services/formattedDateService';
import { Eye, Pencil, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getRoleColor, formatRole } from '@/services/badgeService';

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

interface UsersListProps {
    users: UserWithRole[];
    onSort: (column: string) => void;
    sortColumn: string;
    sortDirection: 'asc' | 'desc' | null;
    onEditClick: (user: UserWithRole) => void;
    onDelete: (userId: number) => void;
    isLoading: boolean;
}

export default function UsersList({
    users,
    onSort,
    sortColumn,
    sortDirection,
    onEditClick,
    onDelete,
    isLoading,
}: UsersListProps) {
    const navigate = useNavigate();
    const [deleteModalUser, setDeleteModalUser] = useState<UserWithRole | null>(null);

    const handleDelete = async (userId: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la suppression');
            }

            // Mettre à jour l'état via le callback
            onDelete(userId);
        } catch (error) {
            console.error('Erreur:', error);
            alert(error instanceof Error ? error.message : 'Erreur lors de la suppression');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div>Chargement...</div>
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'nom' ? sortDirection : null}
                            onClick={() => onSort('nom')}
                            className="cursor-pointer w-[25%]"
                        >
                            Nom
                        </TableHead>
                        <TableHead className="cursor-pointer w-[30%]">Email</TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'date_creation' ? sortDirection : null}
                            onClick={() => onSort('date_creation')}
                            className="cursor-pointer w-[15%]"
                        >
                            Date d'arrivée
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'role' ? sortDirection : null}
                            onClick={() => onSort('role')}
                            className="cursor-pointer w-[15%]"
                        >
                            Rôle
                        </TableHead>
                        <TableHead className="w-[15%]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((item) => (
                        <TableRow key={item.user.id}>
                            <TableCell>
                                {item.user.firstName} {item.user.lastName}
                            </TableCell>
                            <TableCell>{item.user.email}</TableCell>
                            <TableCell>{formatDateToDDMMYYYY(item.user.date_creation)}</TableCell>
                            <TableCell>
                                <span
                                    className={`px-4 py-1 rounded-full text-sm ${getRoleColor(
                                        item.user.role
                                    )}`}
                                >
                                    {formatRole(item.user.role)}
                                </span>
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/user/${item.user.id}`);
                                    }}
                                >
                                    <Eye size={16} />
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditClick(item);
                                    }}
                                >
                                    <Pencil size={16} />
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteModalUser(item);
                                    }}
                                >
                                    <Trash size={16} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {deleteModalUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
                        <p className="mb-6">
                            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
                            {deleteModalUser.user.firstName} {deleteModalUser.user.lastName} ? Cette
                            action est irréversible.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-2 rounded hover:bg-gray-100"
                                onClick={() => setDeleteModalUser(null)}
                            >
                                Annuler
                            </button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    handleDelete(deleteModalUser.user.id);
                                    setDeleteModalUser(null);
                                }}
                            >
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
