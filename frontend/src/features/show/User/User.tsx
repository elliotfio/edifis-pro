import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Calendar,
    ChartSpline,
    Glasses,
    HardHat,
    Mail,
    MapPin,
    Phone,
    Pickaxe,
    Star,
    User,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import userMockData from '@/mocks/userMock.json';
import worksiteMockData from '@/mocks/worksiteMock.json';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { LatLngExpression, divIcon } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import 'leaflet/dist/leaflet.css';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    date_creation: string;
}

interface ArtisanData {
    user_id: number;
    specialites: string[];
    disponible: boolean;
    note_moyenne: number;
    current_worksite: string | null;
    history_worksite: string[];
}

interface ChefData {
    user_id: number;
    years_experience: number;
    current_worksite: string | null;
    history_worksite: string[];
    specialites: string[];
    disponible: boolean;
}

interface Worksite {
    id: string;
    name: string;
    address: string;
    coordinates: [number, number];
}

// Custom marker icon
const customIcon = divIcon({
    className: '',
    html: ReactDOMServer.renderToString(
        <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center text-white">
            <Pickaxe size={20} />
        </div>
    ),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

export default function UserShow() {
    const { id } = useParams();

    // Find the user
    const user = (userMockData.users as User[]).find(
        (u) => u.id.toString() === id && (u.role === 'artisan' || u.role === 'chef')
    );

    if (!user) {
        return <div className="p-6">Artisan non trouvé</div>;
    }

    // Find artisan or chef data
    const artisanData = user.role === 'artisan' 
        ? (userMockData.artisans as ArtisanData[]).find(a => a.user_id === user.id)
        : (userMockData.chefs as ChefData[]).find(c => c.user_id === user.id);

    if (!artisanData) {
        return <div className="p-6">Données de l'artisan non trouvées</div>;
    }

    // Find current worksite data if exists
    const currentWorksite = artisanData.current_worksite 
        ? (worksiteMockData.worksites as unknown as Worksite[]).find(w => w.id === artisanData.current_worksite)
        : null;

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2 group">
                    <ArrowLeft
                        onClick={() => window.history.back()}
                        className="group-hover:-translate-x-1 transition-transform duration-200 ease-in-out cursor-pointer"
                    />
                    <h1 className="text-2xl font-semibold">
                        {user.firstName} {user.lastName}
                    </h1>
                    <div
                        className={`px-3 py-1 rounded-full text-sm ${
                            artisanData.disponible
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {artisanData.disponible ? 'Disponible' : 'Indisponible'}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        <HardHat size={16} />
                        <span>{user.role === 'chef' ? 'Chef de chantier' : 'Ouvrier'}</span>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4">
                    <div className="flex gap-2 items-center mb-4">
                        <User size={20} />
                        <h2 className="font-medium">Informations personnelles</h2>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={16} />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={16} />
                            <span>Non renseigné</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={16} />
                            <span>
                                Inscrit le{' '}
                                {new Date(user.date_creation).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                        {user.role === 'chef' && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Star size={16} />
                                <span>{(artisanData as ChefData).years_experience} ans d'expérience</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4">
                    <div className="flex gap-2 items-center mb-4">
                        <Glasses size={20} />
                        <h2 className="font-medium">Spécialités</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {artisanData.specialites.map((specialite) => (
                            <span
                                key={specialite}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                                {specialite}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4">
                    <div className="flex gap-2 items-center mb-4">
                        <ChartSpline size={20} />
                        <h2 className="font-medium">Statistiques</h2>
                    </div>
                    <div className="space-y-3">
                        {user.role === 'artisan' ? (
                            <>
                                <div>
                                    <div className="text-sm text-gray-600">Note moyenne</div>
                                    <div className="text-2xl font-bold flex items-center gap-1">
                                        {(artisanData as ArtisanData).note_moyenne}
                                        <Star size={20} className="text-yellow-200 fill-yellow-200" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Chantiers terminés</div>
                                    <div className="text-2xl font-bold">
                                        {(artisanData as ArtisanData).history_worksite.length}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="text-sm text-gray-600">Années d'expérience</div>
                                    <div className="text-2xl font-bold">
                                        {(artisanData as ChefData).years_experience} ans
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Chantiers terminés</div>
                                    <div className="text-2xl font-bold">
                                        {(artisanData as ChefData).history_worksite.length}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Chantier en cours */}
            <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4 mb-8">
                <div className="flex gap-2 items-center mb-4">
                    <MapPin size={20} />
                    <h2 className="font-medium">Chantier en cours</h2>
                </div>
                {currentWorksite ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-primary" />
                            <span className="font-medium">{currentWorksite.name}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin size={16} className="text-primary flex-shrink-0" />
                            <span className="text-gray-600 text-sm">
                                {currentWorksite.address}
                            </span>
                        </div>
                        <div className="h-[300px] w-full rounded-lg overflow-hidden">
                            <MapContainer
                                center={currentWorksite.coordinates as LatLngExpression}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                                attributionControl={false}
                            >
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                <Marker
                                    position={currentWorksite.coordinates as LatLngExpression}
                                    icon={customIcon}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[250px]">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={16} className="text-primary" />
                                                    <span className="font-medium">{currentWorksite.name}</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <MapPin size={16} className="text-primary flex-shrink-0" />
                                                    <span className="text-gray-600 text-sm">
                                                        {currentWorksite.address}
                                                    </span>
                                                </div>
                                                <Link
                                                    to={`/worksite/${currentWorksite.id}`}
                                                    className="flex items-center justify-center gap-2 w-full bg-primary py-2 px-4 rounded-md group"
                                                >
                                                    <span className="text-white">Voir le chantier</span>
                                                    <ArrowRight size={16} color='white' className='group-hover:translate-x-1 transition-all duration-300' />
                                                </Link>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-600">
                        Aucun chantier en cours
                    </div>
                )}
            </div>
        </div>
    );
}
