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
import { formatDateToDDMMYYYY } from '@/services/formattedDateService';
import { getColorStatus, getLabelStatus } from '@/services/badgeService';
import { Worksite } from '@/types/worksiteType';

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
                        className="w-[20%]"
                    >
                        NOM DU PROJET
                    </TableHead>
                    <TableHead
                        sortable
                        sortDirection={sortColumn === 'address' ? sortDirection : null}
                        onClick={() => onSort('address')}
                        className="w-[30%]"
                    >
                        ADRESSE
                    </TableHead>
                    <TableHead
                        sortable
                        sortDirection={sortColumn === 'startDate' ? sortDirection : null}
                        onClick={() => onSort('startDate')}
                        className="w-[15%]"
                    >
                        DATE DE DÉBUT
                    </TableHead>
                    <TableHead
                        sortable
                        sortDirection={sortColumn === 'endDate' ? sortDirection : null}
                        onClick={() => onSort('endDate')}
                        className="w-[15%]"
                    >
                        DATE DE FIN
                    </TableHead>
                    <TableHead
                        sortable
                        sortDirection={sortColumn === 'status' ? sortDirection : null}
                        onClick={() => onSort('status')}
                        className="w-[10%]"
                    >
                        STATUS
                    </TableHead>
                    <TableHead className='w-[10%]'>ACTIONS</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((worksite) => (
                    <TableRow key={worksite.id} hover>
                        <TableCell>{worksite.name}</TableCell>
                        <TableCell>{worksite.address}</TableCell>
                        <TableCell>{formatDateToDDMMYYYY(worksite.startDate)}</TableCell>
                        <TableCell>{formatDateToDDMMYYYY(worksite.endDate)}</TableCell>
                        <TableCell>
                            <span
                                className={`px-4 py-1 rounded-full text-sm ${getColorStatus(
                                    worksite.status
                                )}`}
                            >
                                {getLabelStatus(worksite.status)}
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
