import { Worksite } from '@/types/worksiteType';
import { useState } from 'react';
import ContactCard from './ContactCard';

interface WorksitesKanbanProps {
    data: Worksite[];
}

// Mapping des statuts aux colonnes
const STATUS_MAPPING = {
    'attributed': 'Attribué',
    'planned': 'Planifié',
    'in_progress': 'En cours',
    'completed': 'Terminé',
    'archived': 'Archivé'
} as const;

// Couleurs pour chaque colonne
const columnColors: { [key: string]: string } = {
    'Attribué': '#FFF8E1',
    'Planifié': '#F3E5F5',
    'En cours': '#E3F2FD',
    'Terminé': '#E0F2F1',
    'Archivé': '#FFEBEE'
};

export default function Kanban({ data }: WorksitesKanbanProps) {
    // Grouper les worksites par statut
    const initialKanbanData = Object.values(STATUS_MAPPING).reduce((acc, columnName) => {
        acc[columnName] = data
            .filter(worksite => {
                const statusInFrench = STATUS_MAPPING[worksite.status as keyof typeof STATUS_MAPPING];
                return statusInFrench === columnName;
            })
            .map(worksite => ({
                id: parseInt(worksite.id),
                name: worksite.name,
                email: worksite.address,
                date: worksite.startDate
            }));
        return acc;
    }, {} as { [key: string]: { id: number; name: string; email: string; date: string; }[] });

    const [sortedData] = useState(initialKanbanData);
    const columnEntries = Object.entries(sortedData);

    return (
        <div className="flex gap-0 overflow-x-auto pt-0">
            {columnEntries.map(([status, contacts], index) => (
                <div
                    key={status}
                    className={`w-full ${
                        index === 0 ? 'pr-2' : 
                        index === columnEntries.length - 1 ? 'pl-2' : 'px-2'
                    }`}
                >
                    <div className="flex justify-between items-center mb-3 px-4 py-2 rounded-md" style={{ backgroundColor: columnColors[status] }}>
                        <h3 className="font-semibold text-gray-800">{status}</h3>
                        <div className="w-8 h-4 rounded-full border border-black text-[.5rem] relative font-medium">
                            <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>{contacts.length}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {contacts.map((contact) => (
                            <div key={contact.id.toString()} className="transition-transform">
                                <ContactCard
                                    name={contact.name}
                                    email={contact.email}
                                    date={contact.date}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}