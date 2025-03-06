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
import { ArtisanUser } from '@/types/userType';
import { Eye, Pencil, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ArtisansListProps {
    data: ArtisanUser[];
    sortColumn: string;
    sortDirection: 'asc' | 'desc' | null;
    onSort: (column: string) => void;
    onDelete: (artisan: ArtisanUser) => void;
    onEdit: (artisan: ArtisanUser) => void;
}

const truncateText = (text: string, maxLength: number = 32) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

export default function ArtisansList({
    data,
    sortColumn,
    sortDirection,
    onSort,
    onDelete,
    onEdit,
}: ArtisansListProps) {
    const navigate = useNavigate();

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
                            sortDirection={sortColumn === 'specialisation' ? sortDirection : null}
                            onClick={() => onSort('specialisation')}
                            className="w-[15%]"
                        >
                            SPÉCIALISATION
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
                    {data.map((artisan) => (
                        <TableRow key={artisan.user_id} hover>
                            <TableCell>
                                {truncateText(`${artisan.user.firstName} ${artisan.user.lastName}`)}
                            </TableCell>
                            <TableCell>{truncateText(artisan.user.email, 40)}</TableCell>
                            <TableCell>
                                {formatDateToDDMMYYYY(artisan.user.date_creation)}
                            </TableCell>
                            <TableCell>
                                {artisan.specialites && artisan.specialites.length > 0 ? (
                                    <>
                                        {Array.isArray(artisan.specialites)
                                            ? artisan.specialites
                                                  .slice(0, 2) // Limiter à 2 spécialités maximum
                                                  .map((spec) => {
                                                      // Nettoyer la chaîne en retirant les guillemets et autres caractères
                                                      const cleanSpec = spec.replace(
                                                          /["\[\]]/g,
                                                          ''
                                                      );
                                                      return (
                                                          cleanSpec.charAt(0).toUpperCase() +
                                                          cleanSpec.slice(1)
                                                      );
                                                  })
                                                  .join(', ')
                                            : JSON.stringify(artisan.specialites).replace(
                                                  /["\[\]]/g,
                                                  ''
                                              )}
                                    </>
                                ) : (
                                    '-'
                                )}
                            </TableCell>
                            <TableCell>
                                <span
                                    className={`px-4 py-1 rounded-full text-sm ${
                                        artisan.disponible
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {artisan.disponible ? 'Disponible' : 'Indisponible'}
                                </span>
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/user/${artisan.user_id}`);
                                    }}
                                >
                                    <Eye size={16} />
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(artisan);
                                    }}
                                >
                                    <Pencil size={16} />
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(artisan);
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
