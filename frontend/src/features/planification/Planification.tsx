import CustomToolbar from '@/components/ui/CustomToolbar';
import { Calendar } from 'lucide-react';
import moment from 'moment';
import { useMemo, useState } from 'react';
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
    equipe: string[];
    budget: string;
}

// Données fictives des chantiers
const sampleConstructionEvents: ConstructionEvent[] = [
    {
        id: 1,
        title: 'Rénovation appartement Haussmann',
        start: new Date(2024, 2, 4, 8, 0),
        end: new Date(2024, 2, 15, 18, 0),
        description: 'Rénovation complète d\'un appartement haussmannien de 120m²',
        location: '75008 Paris',
        category: 'renovation',
        status: 'en_cours',
        equipe: ['Jean D.', 'Michel L.', 'Sophie M.'],
        budget: '85000€'
    },
    {
        id: 2,
        title: 'Construction maison individuelle',
        start: new Date(2024, 2, 4, 9, 0),
        end: new Date(2024, 5, 30, 17, 0),
        description: 'Construction d\'une maison moderne de 180m² avec piscine',
        location: '92500 Rueil-Malmaison',
        category: 'construction',
        status: 'planifie',
        equipe: ['Pierre B.', 'Laurent K.', 'Marie F.'],
        budget: '450000€'
    },
    {
        id: 3,
        title: 'Réfection toiture immeuble',
        start: new Date(2024, 2, 6, 8, 0),
        end: new Date(2024, 2, 16, 17, 0),
        description: 'Rénovation complète de la toiture d\'un immeuble de 5 étages',
        location: '75011 Paris',
        category: 'toiture',
        status: 'en_cours',
        equipe: ['Marc V.', 'Thomas R.'],
        budget: '65000€'
    },
    {
        id: 4,
        title: 'Installation système domotique',
        start: new Date(2024, 2, 7, 10, 0),
        end: new Date(2024, 2, 9, 16, 0),
        description: 'Installation complète système domotique villa de luxe',
        location: '06600 Antibes',
        category: 'domotique',
        status: 'planifie',
        equipe: ['Alex M.', 'Julie P.'],
        budget: '25000€'
    },
    {
        id: 5,
        title: 'Aménagement bureaux open-space',
        start: new Date(2024, 2, 11, 9, 0),
        end: new Date(2024, 2, 22, 18, 0),
        description: 'Réaménagement complet d\'un plateau de bureaux de 300m²',
        location: '92100 Boulogne-Billancourt',
        category: 'amenagement',
        status: 'planifie',
        equipe: ['David L.', 'Sarah B.', 'Kevin M.'],
        budget: '120000€'
    },
    {
        id: 6,
        title: 'Rénovation énergétique copropriété',
        start: new Date(2024, 2, 18, 8, 0),
        end: new Date(2024, 4, 30, 17, 0),
        description: 'Isolation thermique et remplacement des fenêtres',
        location: '94200 Ivry-sur-Seine',
        category: 'renovation_energetique',
        status: 'planifie',
        equipe: ['Philippe D.', 'Anne S.', 'Nicolas P.'],
        budget: '280000€'
    },
    {
        id: 7,
        title: 'Installation panneaux solaires',
        start: new Date(2024, 2, 4, 8, 0),
        end: new Date(2024, 2, 8, 17, 0),
        description: 'Installation de 40 panneaux solaires sur toiture industrielle',
        location: '93300 Aubervilliers',
        category: 'energie_renouvelable',
        status: 'en_cours',
        equipe: ['Mathieu B.', 'Claire V.'],
        budget: '75000€'
    },
    {
        id: 8,
        title: 'Création espace bien-être',
        start: new Date(2024, 2, 25, 9, 0),
        end: new Date(2024, 3, 15, 18, 0),
        description: 'Aménagement d\'un spa avec sauna et hammam',
        location: '75016 Paris',
        category: 'amenagement_special',
        status: 'planifie',
        equipe: ['Lucas M.', 'Emma R.', 'Hugo D.'],
        budget: '95000€'
    }
];

export default function Planification() {
    const [view, setView] = useState<View>('month');
    const [searchQuery, setSearchQuery] = useState('');

    const handleViewChange = (newView: View) => {
        setView(newView);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const filteredEvents = useMemo(() => {
        const searchLower = searchQuery.toLowerCase().trim();
        if (!searchLower) return sampleConstructionEvents;

        return sampleConstructionEvents.filter((event) =>
            event.title.toLowerCase().includes(searchLower) ||
            event.location.toLowerCase().includes(searchLower)
        );
    }, [searchQuery]);

    const eventStyleGetter = (event: ConstructionEvent) => {
        let backgroundColor = '#3B82F6'; // Bleu par défaut

        switch (event.status) {
            case 'en_cours':
                backgroundColor = '#059669'; // Vert
                break;
            case 'planifie':
                backgroundColor = '#6366F1'; // Indigo
                break;
            case 'termine':
                backgroundColor = '#9CA3AF'; // Gris
                break;
        }

        return {
            style: {
                backgroundColor,
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
        };
    };

    return (
        <div className='p-6'>
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Calendar size={24} strokeWidth={1.7} />
                    <span className="text-xl font-semibold">Planification</span>
                </div>
            </div>
            <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm p-4">
                <BigCalendar<ConstructionEvent>
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="month"
                    view={view}
                    onView={handleViewChange}
                    views={['month', 'week', 'day']}
                    defaultDate={new Date(2024, 2, 4)}
                    selectable
                    popup
                    eventPropGetter={eventStyleGetter}
                    formats={{
                        eventTimeRangeFormat: formatEventTime
                    }}
                    components={{
                        toolbar: (props) => <CustomToolbar {...props} onSearch={handleSearch} searchValue={searchQuery} />
                    }}
                    messages={{
                        next: "Suivant",
                        previous: "Précédent",
                        today: "Aujourd'hui",
                        month: "Mois",
                        week: "Semaine",
                        day: "Jour",
                        agenda: "Agenda",
                        date: "Date",
                        time: "Heure",
                        event: "Événement",
                        noEventsInRange: "Aucun événement dans cette période",
                        showMore: (total) => `+${total} autres`
                    }}
                    tooltipAccessor={(event) => `${event.description}\nLieu: ${event.location}\nBudget: ${event.budget}`}
                />
            </div>
        </div>
    );
}