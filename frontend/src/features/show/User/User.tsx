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
import { useState, useEffect } from 'react';
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
    years_experience?: string;
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
    const [user, setUser] = useState<User | null>(null);
    const [artisanData, setArtisanData] = useState<ArtisanData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserAndData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Récupérer les infos de l'utilisateur
                const userResponse = await fetch(`http://localhost:3000/api/users/${id}`);
                if (!userResponse.ok) {
                    throw new Error('Erreur lors de la récupération des données utilisateur');
                }
                const userData = await userResponse.json();
                const formattedUser: User = {
                    id: userData.id,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    role: userData.role,
                    date_creation: userData.date_creation,
                };
                setUser(formattedUser);

                // Si c'est un artisan ou un chef, récupérer ses données spécifiques
                if (userData.role === 'artisan') {
                    const artisanResponse = await fetch(
                        `http://localhost:3000/api/artisans/${userData.id}`
                    );
                    if (!artisanResponse.ok) {
                        throw new Error('Erreur lors de la récupération des données artisan');
                    }
                    const artisanData = await artisanResponse.json();
                    setArtisanData({
                        user_id: artisanData.user_id,
                        specialites: artisanData.specialites || [],
                        disponible: artisanData.disponible || false,
                        note_moyenne: artisanData.note_moyenne || 0,
                        current_worksite: artisanData.current_worksite || null,
                        history_worksite: artisanData.history_worksite || [],
                    });
                } else if (userData.role === 'chef') {
                    const chefResponse = await fetch(
                        `http://localhost:3000/api/chefs/${userData.id}`
                    );
                    if (!chefResponse.ok) {
                        throw new Error('Erreur lors de la récupération des données chef');
                    }
                    const chefData = await chefResponse.json();
                    setArtisanData({
                        user_id: chefData.user_id,
                        specialites: chefData.specialites || [],
                        disponible: chefData.disponible || false,
                        note_moyenne: 0,
                        current_worksite: chefData.current_worksite || null,
                        history_worksite: chefData.history_worksite || [],
                        years_experience: chefData.years_experience || 'Junior',
                    });
                }
            } catch (error) {
                console.error('Erreur:', error);
                setError(error instanceof Error ? error.message : 'Une erreur est survenue');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserAndData();
    }, [id]);

    if (isLoading) return <div>Chargement...</div>;
    if (error) return <div>Erreur: {error}</div>;
    if (!user) return <div>Utilisateur non trouvé</div>;

    // Si c'est un artisan mais qu'on n'a pas ses données
    if (user.role === 'artisan' && !artisanData) {
        return <div className="p-6">Données de l'artisan non trouvées</div>;
    }

    // Utiliser artisanData au lieu de la donnée mockée
    const currentArtisanData = user.role === 'artisan' || user.role === 'chef' ? artisanData : null;

    // Find current worksite data if exists
    const currentWorksite =
        currentArtisanData && currentArtisanData.current_worksite
            ? (worksiteMockData.worksites as unknown as Worksite[]).find(
                  (w) => w.id === currentArtisanData.current_worksite
              )
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
                            currentArtisanData && currentArtisanData.disponible
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {currentArtisanData && currentArtisanData.disponible
                            ? 'Disponible'
                            : 'Indisponible'}
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
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4">
                    <div className="flex gap-2 items-center mb-4">
                        <Glasses size={20} />
                        <h2 className="font-medium">Spécialités</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {currentArtisanData?.specialites &&
                        currentArtisanData?.specialites.length > 0 ? (
                            Array.isArray(currentArtisanData.specialites) ? (
                                currentArtisanData.specialites.map((specialite) => {
                                    const cleanSpec = specialite.replace(/["\[\]]/g, '');
                                    return (
                                        <span
                                            key={cleanSpec}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {cleanSpec.charAt(0).toUpperCase() + cleanSpec.slice(1)}
                                        </span>
                                    );
                                })
                            ) : (
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    {JSON.stringify(currentArtisanData.specialites).replace(
                                        /["\[\]]/g,
                                        ''
                                    )}
                                </span>
                            )
                        ) : (
                            <span className="text-gray-600">Non renseigné</span>
                        )}
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
                                        {currentArtisanData && currentArtisanData.note_moyenne}
                                        <Star
                                            size={20}
                                            className="text-yellow-200 fill-yellow-200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Chantiers terminés</div>
                                    <div className="text-2xl font-bold">
                                        {currentArtisanData &&
                                            currentArtisanData.history_worksite.length}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="text-sm text-gray-600">Niveau d'expérience</div>
                                    <div className="text-2xl font-bold">
                                        {currentArtisanData?.years_experience || 'Non renseigné'}{' '}
                                        ans
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Chantiers terminés</div>
                                    <div className="text-2xl font-bold">
                                        {currentArtisanData &&
                                            currentArtisanData.history_worksite.length}
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
                            <span className="text-gray-600 text-sm">{currentWorksite.address}</span>
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
                                                    <span className="font-medium">
                                                        {currentWorksite.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <MapPin
                                                        size={16}
                                                        className="text-primary flex-shrink-0"
                                                    />
                                                    <span className="text-gray-600 text-sm">
                                                        {currentWorksite.address}
                                                    </span>
                                                </div>
                                                <Link
                                                    to={`/worksite/${currentWorksite.id}`}
                                                    className="flex items-center justify-center gap-2 w-full bg-primary py-2 px-4 rounded-md group"
                                                >
                                                    <span className="text-white">
                                                        Voir le chantier
                                                    </span>
                                                    <ArrowRight
                                                        size={16}
                                                        color="white"
                                                        className="group-hover:translate-x-1 transition-all duration-300"
                                                    />
                                                </Link>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-600">Aucun chantier en cours</div>
                )}
            </div>
        </div>
    );
}
