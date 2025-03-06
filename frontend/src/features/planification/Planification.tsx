import CustomToolbar from '@/components/ui/CustomToolbar';
import { Calendar } from 'lucide-react';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('fr');
const localizer = momentLocalizer(moment);

// Fonction pour formater la date et l'heure en français
const formatEventTime = ({ start, end }: { start: Date; end: Date }) => {
    const startDate = moment(start).locale('fr').format('dddd D MMMM YYYY');
    const startTime = moment(start).locale('fr').format('HH:mm');
    const endDate = moment(end).locale('fr').format('dddd D MMMM YYYY');
    const endTime = moment(end).locale('fr').format('HH:mm');

    // Si même jour
    if (moment(start).isSame(end, 'day')) {
        return `${startDate} de ${startTime} à ${endTime}`;
    }
    return `Du ${startDate} à ${startTime} au ${endDate} à ${endTime}`;
};

interface ConstructionEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    description: string;
    location: string;
    category: string;
    status: 'en_cours' | 'planifie' | 'termine';
    budget: string;
}

export default function Planification() {
    const [view, setView] = useState<View>('month');
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState<ConstructionEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorksites = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/worksites');
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des chantiers');
                }
                const data = await response.json();

                // Transformer les données pour correspondre à la structure ConstructionEvent
                const formattedEvents: ConstructionEvent[] = data.map((worksite: any) => ({
                    id: worksite.id,
                    title: worksite.name,
                    start: new Date(worksite.startDate),
                    end: new Date(worksite.endDate),
                    description: worksite.description || '',
                    location: worksite.address,
                    category: worksite.type,
                    status: worksite.status as 'en_cours' | 'planifie' | 'termine',
                    budget: `${worksite.budget}€`
                }));

                setEvents(formattedEvents);
            } catch (err) {
                console.error('Erreur:', err);
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorksites();
    }, []);

    const handleViewChange = (newView: View) => {
        setView(newView);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const filteredEvents = useMemo(() => {
        const searchLower = searchQuery.toLowerCase().trim();
        if (!searchLower) return events;

        return events.filter((event) =>
            event.title.toLowerCase().includes(searchLower) ||
            event.location.toLowerCase().includes(searchLower)
        );
    }, [searchQuery, events]);

    const eventStyleGetter = () => ({
        style: {
            backgroundColor: '#5D6ABD',
            borderRadius: '4px',
            opacity: 0.8,
            color: 'white',
            border: 'none',
            display: 'block',
            fontSize: '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '2px 4px'
        }
    });

    if (isLoading) {
        return <div className="p-6">Chargement...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">Erreur: {error}</div>;
    }

    return (
        <div className='p-6'>
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Calendar size={24} strokeWidth={1.7} />
                    <span className="text-xl font-semibold">Planification</span>
                </div>
            </div>
            <div className="h-[calc(100vh-200px)]">
                <BigCalendar<ConstructionEvent>
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100' }}
                    views={['month', 'week', 'day']}
                    view={view}
                    onView={handleViewChange}
                    formats={{
                        timeGutterFormat: (date: Date) => moment(date).format('HH:mm'),
                        eventTimeRangeFormat: formatEventTime,
                        dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
                            return `${moment(start).format('D MMMM')} - ${moment(end).format('D MMMM YYYY')}`;
                        }
                    }}
                    messages={{
                        next: 'Suivant',
                        previous: 'Précédent',
                        today: 'Aujourd\'hui',
                        month: 'Mois',
                        week: 'Semaine',
                        day: 'Jour',
                        agenda: 'Agenda',
                        date: 'Date',
                        time: 'Heure',
                        event: 'Événement',
                        noEventsInRange: 'Aucun chantier sur cette période'
                    }}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        toolbar: (toolbarProps) => (
                            <CustomToolbar 
                                {...toolbarProps} 
                                onSearch={handleSearch}
                                searchValue={searchQuery}
                            />
                        )
                    }}
                />
            </div>
        </div>
    );
}