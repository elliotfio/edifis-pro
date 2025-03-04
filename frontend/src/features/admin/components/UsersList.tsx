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
import { getRoleColor, formatRole } from '@/services/badgeService';
import { Eye, Pencil, Trash } from 'lucide-react';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    date_creation: string;
}

interface UsersListProps {
    data: User[];
    sortColumn: string;
    sortDirection: 'asc' | 'desc' | null;
    onSort: (column: string) => void;
}

export default function UsersList({ data, sortColumn, sortDirection, onSort }: UsersListProps) {
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
                    <TableHead
                        className="cursor-pointer w-[30%]"
                    >
                        Email
                    </TableHead>
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
                {data.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{formatDateToDDMMYYYY(user.date_creation)}</TableCell>
                        <TableCell>
                            <span
                                className={`px-4 py-1 rounded-full text-sm ${getRoleColor(
                                    user.role
                                )}`}
                            >
                                {formatRole(user.role)}
                            </span>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                            <Button
                                variant="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
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
