import { Button } from '@/components/ui/Button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import { getColorStatus, getLabelStatus } from '@/services/badgeService';
import { formatDateToDDMMYYYY } from '@/services/formattedDateService';
import { Worksite } from '@/types/worksiteType';
import { Eye, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditWorksite from './EditWorksite';

interface WorksitesListProps {
    data: Worksite[];
    sortColumn: keyof Worksite | null;
    sortDirection: 'asc' | 'desc' | null;
    onSort: (column: keyof Worksite) => void;
    onUpdate: (worksite: Worksite) => void;
    onDelete: (worksite: Worksite) => void;
    onAddWorksite: (newWorksite: Partial<Worksite>) => void;
}

const truncateText = (text: string, maxLength: number = 32) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

export default function WorksitesList({
    data,
    sortColumn,
    sortDirection,
    onSort,
    onUpdate,
    onDelete,
}: WorksitesListProps) {
    const navigate = useNavigate();
    const [selectedWorksite, setSelectedWorksite] = useState<Worksite | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEditClick = (worksite: Worksite) => {
        setSelectedWorksite(worksite);
        setIsEditModalOpen(true);
    };

    const handleEditWorksite = (updatedWorksite: Worksite) => {
        onUpdate(updatedWorksite);
        setIsEditModalOpen(false);
        setSelectedWorksite(null);
    };

    const handleDelete = async (worksite: Worksite) => {
        try {
            const response = await fetch(`http://localhost:3000/api/worksites/${worksite.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                onDelete(worksite);
            } else {
                const error = await response.json();
                console.error('Erreur lors de la suppression:', error);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    return (
        <>
            <div className="max-w-[80vw]">
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
                                className="w-[25%]"
                            >
                                ADRESSE
                            </TableHead>
                            <TableHead
                                sortable
                                sortDirection={sortColumn === 'startDate' ? sortDirection : null}
                                onClick={() => onSort('startDate')}
                                className="w-[14%]"
                            >
                                DATE DE DÉBUT
                            </TableHead>
                            <TableHead
                                sortable
                                sortDirection={sortColumn === 'endDate' ? sortDirection : null}
                                onClick={() => onSort('endDate')}
                                className="w-[12%]"
                            >
                                DATE DE FIN
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
                        {data.map((worksite) => (
                            <TableRow key={worksite.id} hover>
                                <TableCell>{truncateText(worksite.name, 25)}</TableCell>
                                <TableCell>{truncateText(worksite.address, 36)}</TableCell>
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
                                        className="text-gray-600"
                                        onClick={() => handleEditClick(worksite)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(worksite);
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
            {selectedWorksite && (
                <EditWorksite
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedWorksite(null);
                    }}
                    onEditWorksite={handleEditWorksite}
                    worksite={selectedWorksite}
                />
            )}
        </>
    );
}
