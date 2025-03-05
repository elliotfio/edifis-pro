import { Button } from '@/components/ui/Button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import { formatRole, getRoleColor } from '@/services/badgeService';
import { formatDateToDDMMYYYY } from '@/services/formattedDateService';
import { Eye, Pencil, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    data: UserWithRole[];
    sortColumn: string;
    sortDirection: 'asc' | 'desc' | null;
    onSort: (column: string) => void;
    onDelete: (user: UserWithRole) => void;
}

export default function UsersList({
    data,
    sortColumn,
    sortDirection,
    onSort,
    onDelete,
}: UsersListProps) {
    const navigate = useNavigate();
    return (
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
                        sortDirection={sortColumn === 'date' ? sortDirection : null}
                        onClick={() => onSort('date')}
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
                {data.map((item) => (
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
                                }}
                            >
                                <Pencil size={16} />
                            </Button>
                            <Button
                                variant="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item);
                                }}
                            >
                                <Trash size={16} />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
