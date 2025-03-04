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
}: ChefsListProps) {
    const navigate = useNavigate();

    console.log(data);

    return (
        <div className="max-w-[80vw]">
            <Table variant="default" className="rounded-md cursor-default">
                <TableHeader sticky>
                    <TableRow>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'nom' ? sortDirection : null}
                            onClick={() => onSort('nom')}
                            className="w-[20%]"
                        >
                            NOM
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'adresse' ? sortDirection : null}
                            onClick={() => onSort('adresse')}
                            className="w-[25%]"
                        >
                            ADRESSE
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'date_arrivee' ? sortDirection : null}
                            onClick={() => onSort('date_arrivee')}
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
                            sortDirection={sortColumn === 'status' ? sortDirection : null}
                            onClick={() => onSort('status')}
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
                                {`${chef.years_experience} ans - ${
                                    chef.specialites[0].charAt(0).toUpperCase() +
                                    chef.specialites[0].slice(1)
                                }`}
                            </TableCell>
                            <TableCell>
                                <span
                                    className={`px-4 py-1 rounded-full text-sm ${
                                        chef.chantiers_en_cours < 4
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'
                                    }`}
                                >
                                    {chef.chantiers_en_cours < 4 ? 'Disponible' : 'Occupé'}
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
