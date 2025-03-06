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
import { ChefUser } from '@/types/userType';
import { Eye, Pencil, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChefsListProps {
    data: ChefUser[];
    sortColumn: string;
    sortDirection: 'asc' | 'desc' | null;
    onSort: (column: string) => void;
    onDelete: (chef: ChefUser) => void;
    onEdit: (chef: ChefUser) => void;
}

const truncateText = (text: string, maxLength: number = 32) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

export default function ChefsList({
    data,
    sortColumn,
    sortDirection,
    onSort,
    onDelete,
    onEdit,
}: ChefsListProps) {
    const navigate = useNavigate();

    return (
        <div className="max-w-[80vw]">
            <Table variant="default" className="rounded-md cursor-default">
                <TableHeader sticky>
                    <TableRow>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'firstName' ? sortDirection : null}
                            onClick={() => onSort('firstName')}
                            className="w-[20%]"
                        >
                            NOM
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'email' ? sortDirection : null}
                            onClick={() => onSort('email')}
                            className="w-[25%]"
                        >
                            ADRESSE
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'date_creation' ? sortDirection : null}
                            onClick={() => onSort('date_creation')}
                            className="w-[14%]"
                        >
                            DATE D'ARRIVÉE
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'years_experience' ? sortDirection : null}
                            onClick={() => onSort('years_experience')}
                            className="w-[15%]"
                        >
                            EXPÉRIENCE
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'disponible' ? sortDirection : null}
                            onClick={() => onSort('disponible')}
                            className="w-[15%]"
                        >
                            STATUS
                        </TableHead>
                        <TableHead className="w-[23%]">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((chef) => (
                        <TableRow key={chef.user_id} hover>
                            <TableCell>
                                {truncateText(`${chef.user.firstName} ${chef.user.lastName}`, 25)}
                            </TableCell>
                            <TableCell>{truncateText(chef.user.email, 36)}</TableCell>
                            <TableCell>{formatDateToDDMMYYYY(chef.user.date_creation)}</TableCell>
                            <TableCell>
                                {chef.years_experience}
                            </TableCell>
                            <TableCell>
                                <span
                                    className={`px-4 py-1 rounded-full text-sm ${
                                        !chef.current_worksite
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {!chef.current_worksite ? 'Disponible' : 'Indisponible'}
                                </span>
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/user/${chef.user_id}`);
                                    }}
                                >
                                    <Eye size={16} />
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(chef);
                                    }}
                                >
                                    <Pencil size={16} />
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(chef);
                                    }}
                                >
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
