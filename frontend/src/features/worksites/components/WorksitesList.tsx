import { Button } from '@/components/ui/Button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import { Eye, Pencil, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Worksite {
    id: string;
    name: string;
    address: string;
    startDate: string;
    endDate: string;
    status: string;
}

interface WorksitesListProps {
    data: Worksite[];
    sortColumn: keyof Worksite | null;
    sortDirection: 'asc' | 'desc' | null;
    onSort: (column: keyof Worksite) => void;
}

export default function WorksitesList({
    data,
    sortColumn,
    sortDirection,
    onSort,
}: WorksitesListProps) {
    const navigate = useNavigate();

    return (
        <Table variant="default" className="rounded-md cursor-default">
            <TableHeader sticky>
                <TableRow>
                    <TableHead
                        sortable
                        sortDirection={sortColumn === 'name' ? sortDirection : null}
                        onClick={() => onSort('name')}
                    >
                        NOM DU PROJET
                    </TableHead>
                    <TableHead
                        sortable
                        sortDirection={sortColumn === 'address' ? sortDirection : null}
                        onClick={() => onSort('address')}
                    >
                        ADRESSE
                    </TableHead>
                    <TableHead
                        sortable
                        sortDirection={sortColumn === 'startDate' ? sortDirection : null}
                        onClick={() => onSort('startDate')}
                    >
                        DATE DE DÉBUT
                    </TableHead>
                    <TableHead
                        sortable
                        sortDirection={sortColumn === 'endDate' ? sortDirection : null}
                        onClick={() => onSort('endDate')}
                    >
                        DATE DE FIN
                    </TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>ACTIONS</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((worksite) => (
                    <TableRow key={worksite.id} hover>
                        <TableCell>{worksite.name}</TableCell>
                        <TableCell>{worksite.address}</TableCell>
                        <TableCell>{worksite.startDate}</TableCell>
                        <TableCell>{worksite.endDate}</TableCell>
                        <TableCell>
                            <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                {worksite.status}
                            </span>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                            <Button
                                variant="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/worksite/${worksite.id}`);
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
