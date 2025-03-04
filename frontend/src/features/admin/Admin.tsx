import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import Searchbar from '@/components/ui/Searchbar';
import { Plus, ShieldBan } from 'lucide-react';
import mockData from '@/mocks/userMock.json';
import UsersList from './components/UsersList';

type SortDirection = 'asc' | 'desc' | null;

export default function Admin() {
    const [sortColumn, setSortColumn] = useState<string>('nom');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredData = useMemo(() => {
        let data = [...mockData.users];
        
        // Appliquer le tri
        if (sortColumn && sortDirection) {
            data.sort((a, b) => {
                let compareA, compareB;
                
                switch (sortColumn) {
                    case 'nom':
                        compareA = `${a.firstName} ${a.lastName}`.toLowerCase();
                        compareB = `${b.firstName} ${b.lastName}`.toLowerCase();
                        break;
                    case 'email':
                        compareA = a.email.toLowerCase();
                        compareB = b.email.toLowerCase();
                        break;
                    case 'date':
                        compareA = new Date(a.date_creation).getTime();
                        compareB = new Date(b.date_creation).getTime();
                        break;
                    case 'role':
                        compareA = a.role.toLowerCase();
                        compareB = b.role.toLowerCase();
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
            data = data.filter((user) =>
                `${user.firstName} ${user.lastName}`
                    .toLowerCase()
                    .includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.role.toLowerCase().includes(searchLower)
            );
        }

        return data;
    }, [searchQuery, sortColumn, sortDirection]);

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6 ">
                <div className="flex items-center gap-2">
                    <ShieldBan size={24} />
                    <span className="text-xl font-semibold">Panneau d'administration</span>
                </div>
            </div>
            <div className="flex items-center gap-4 mb-6 w-1/2">
                <Searchbar
                    onSearch={handleSearch}
                    className='flex-1'
                />
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
            />
        </div>
    );
}