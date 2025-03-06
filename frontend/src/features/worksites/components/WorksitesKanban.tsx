import { Worksite } from '@/types/worksiteType';
import { useState, useRef, useEffect } from 'react';
import ContactCard from './ContactCard';
import { Ban, ChevronLeft, ChevronRight } from 'lucide-react';

interface WorksitesKanbanProps {
    data: Worksite[];
}

// Mapping des statuts aux colonnes
const STATUS_MAPPING = {
    'no_attributed': 'Non Attribué',
    'attributed': 'Attribué',
    'planned': 'Planifié',
    'in_progress': 'En cours',
    'completed': 'Terminé',
    'archived': 'Archivé',
    'cancelled': 'Annulé',
    'blocked': 'Bloqué'
} as const;

// Couleurs pour chaque colonne
const columnColors: { [key: string]: string } = {
    'Non Attribué': '#f3f4f6',
    'Attribué': '#FFF8E1',
    'Planifié': '#F3E5F5',
    'En cours': '#E3F2FD',
    'Terminé': '#E0F2F1',
    'Archivé': '#FFEBEE',
    'Annulé': '#FCE4EC',
    'Bloqué': '#fef9c2' 
};

export default function Kanban({ data }: WorksitesKanbanProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            }
        };
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = direction === 'left' 
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;
            
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

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
                address: worksite.address,
                date: worksite.startDate
            }));
        return acc;
    }, {} as { [key: string]: { id: number; name: string; address: string; date: string; }[] });

    const [sortedData] = useState(initialKanbanData);
    const columnEntries = Object.entries(sortedData);

    return (
        <div className="relative">
            {canScrollLeft && (
                <button 
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-primary rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
                >
                    <ChevronLeft size={24} color='white' />
                </button>
            )}

            <div 
                ref={scrollContainerRef}
                className="flex gap-0 overflow-x-auto pt-0 max-w-[80vw] scroll-smooth"
            >
                {columnEntries.map(([status, worksite], index) => (
                    <div
                        key={status}
                        className={`w-full min-w-[300px] ${
                            index === 0 ? 'pr-2' : 
                            index === columnEntries.length - 1 ? 'pl-2' : 'px-2'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-3 px-4 py-2 rounded-md" style={{ backgroundColor: columnColors[status] }}>
                            <h3 className="font-semibold text-gray-800">{status}</h3>
                            <div className="w-8 h-4 rounded-full border border-black text-[.5rem] relative font-medium">
                                <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>{worksite.length}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {worksite.length > 0 ? (
                                worksite.map((worksite) => (
                                    <div key={worksite.id.toString()} className="transition-transform">
                                        <ContactCard
                                            name={worksite.name}
                                            address={worksite.address}
                                            date={worksite.date}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-sm text-center py-4 border border-dashed border-gray-400 rounded-md flex items-center justify-center gap-2">
                                    <Ban size={16} />
                                    Pas de projet
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {canScrollRight && (
                <button 
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-primary rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
                >
                    <ChevronRight size={24} color='white' />
                </button>
            )}
        </div>
    );
}