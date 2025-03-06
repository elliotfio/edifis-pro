import { useParams } from 'react-router-dom';
import { Worksite as WorksiteType } from '@/types/worksiteType';
import { formatDateToDDMMYYYY } from '@/services/formattedDateService';
import { getColorStatus, getLabelStatus } from '@/services/badgeService';
import { LatLngExpression, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    CreditCard,
    Glasses,
    Pickaxe,
    PiggyBank,
    Users,
} from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import { Link } from 'react-router-dom';

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
});

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    date_creation: string;
}

interface WorksiteUser {
    user: User;
    years_experience?: string;
    disponible?: boolean;
    specialites?: string[];
    note_moyenne?: number;
}

export default function Worksite() {
    const { id } = useParams();
    const [worksite, setWorksite] = useState<WorksiteType | null>(null);
    const [worksiteUsers, setWorksiteUsers] = useState<WorksiteUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorksite = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Récupérer les données du chantier
                const response = await fetch(`http://localhost:3000/api/worksites/${id}`);
                if (!response.ok) {
                    throw new Error('Worksite not found');
                }
                const data = await response.json();
                setWorksite(data);

                // Récupérer tous les utilisateurs du chantier
                const [chefsResponse, artisansResponse] = await Promise.all([
                    fetch('http://localhost:3000/api/chefs'),
                    fetch('http://localhost:3000/api/artisans'),
                ]);

                const [chefsData, artisansData] = await Promise.all([
                    chefsResponse.json(),
                    artisansResponse.json(),
                ]);

                // Filtrer les chefs et artisans selon le statut du chantier
                let worksiteChefs, worksiteArtisans;

                if (data.status === 'completed') {
                    // Pour les chantiers terminés, chercher dans l'historique
                    worksiteChefs = chefsData.filter(
                        (chef: any) => chef.worksite_history && chef.worksite_history.includes(id)
                    );
                    worksiteArtisans = artisansData.filter(
                        (artisan: any) =>
                            artisan.worksite_history && artisan.worksite_history.includes(id)
                    );
                } else {
                    // Pour les chantiers en cours, chercher dans current_worksite
                    worksiteChefs = chefsData.filter((chef: any) => chef.current_worksite === id);
                    worksiteArtisans = artisansData.filter(
                        (artisan: any) => artisan.current_worksite === id
                    );
                }

                // Récupérer les données utilisateur pour chaque personne
                const userPromises = [...worksiteChefs, ...worksiteArtisans].map((person: any) =>
                    fetch(`http://localhost:3000/api/users/${person.user_id}`).then((res) =>
                        res.json()
                    )
                );

                const users = await Promise.all(userPromises);

                // Combiner les données utilisateur avec leurs rôles spécifiques
                const formattedUsers: WorksiteUser[] = [];

                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    const chef = worksiteChefs.find((c: any) => c.user_id === user.id);
                    const artisan = worksiteArtisans.find((a: any) => a.user_id === user.id);

                    if (chef) {
                        formattedUsers.push({
                            user,
                            years_experience: chef.years_experience,
                            disponible: chef.disponible,
                        });
                    } else if (artisan) {
                        formattedUsers.push({
                            user,
                            specialites: artisan.specialites,
                            note_moyenne: artisan.note_moyenne,
                            disponible: artisan.disponible,
                        });
                    }
                }

                setWorksiteUsers(formattedUsers);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Erreur lors du chargement des données');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorksite();
    }, [id]);

    if (isLoading) return <div>Chargement...</div>;
    if (error) return <div>Erreur: {error}</div>;
    if (!worksite) return <div>Chantier non trouvé</div>;

    const statusColor = getColorStatus(worksite.status);
    const statusLabel = getLabelStatus(worksite.status);

    const chefs = worksiteUsers.filter((u) => u.user.role === 'chef');
    const artisans = worksiteUsers.filter((u) => u.user.role === 'artisan');

    const cleanedString = String(worksite.specialities_needed)
        .replace(/^\[|\]$/g, '') // Enlever les crochets au début et à la fin
        .replace(/['"]|"/g, ''); // Enlever les apostrophes et guillemets doubles

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2 group">
                    <ArrowLeft
                        onClick={() => window.history.back()}
                        className="group-hover:-translate-x-1 transition-transform duration-200 ease-in-out cursor-pointer"
                    />
                    <h1 className="text-2xl font-semibold">{worksite.name}</h1>
                    <div className={`px-3 py-1 rounded-full text-sm ${statusColor}`}>
                        {statusLabel}
                    </div>
                </div>
                <p className="text-gray-600">{worksite.address}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
                <div className="col-span-2 bg-white rounded-lg border border-gray-400 shadow-sm p-4 flex flex-col justify-between">
                    <div className="flex gap-2 items-center mb-2">
                        <Calendar />
                        <h2 className="font-semibold text-lg">Dates</h2>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p className="text-2xl text-gray-700 font-bold">
                            {formatDateToDDMMYYYY(worksite.startDate)} -{' '}
                            {formatDateToDDMMYYYY(worksite.endDate)}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4 flex flex-col justify-between">
                    <div className="flex gap-2 items-center mb-2">
                        <PiggyBank size={28} strokeWidth={1.7} />
                        <h2 className="font-medium">Budget</h2>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p className="text-2xl text-gray-700 font-bold">
                            {worksite.budget.toLocaleString('fr-FR')} €
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4 flex flex-col justify-between">
                    <div className="flex gap-2 items-center mb-2">
                        <CreditCard size={28} strokeWidth={1.7} />
                        <h2 className="font-medium">Coût</h2>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p className="text-2xl text-gray-700 font-bold">
                            {worksite.cost.toLocaleString('fr-FR')} €
                        </p>
                    </div>
                </div>

                <div className="col-span-2 bg-white rounded-lg border border-gray-400 shadow-sm p-4 flex flex-col justify-between">
                    <div className="flex gap-2 items-center mb-2">
                        <Glasses size={28} strokeWidth={1.7} />
                        <h2 className="font-medium">Spécialités</h2>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {cleanedString.split(',').map((speciality) => (
                            <span
                                key={speciality}
                                className="bg-blue-100 text-blue-800 px-3 py-0.5 rounded-full text-sm"
                            >
                                {speciality}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="h-[500px] rounded-lg overflow-hidden mb-8">
                <MapContainer
                    center={[worksite.coordinates.x, worksite.coordinates.y] as LatLngExpression}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    <Marker
                        position={
                            [worksite.coordinates.x, worksite.coordinates.y] as LatLngExpression
                        }
                        icon={customIcon}
                    />
                </MapContainer>
            </div>

            {/* Équipe */}
            <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4 mb-8">
                <div className="flex gap-2 items-center mb-4">
                    <Users size={20} />
                    <h2 className="font-medium">
                        {worksite.status === 'completed'
                            ? 'Équipe ayant travaillé sur ce chantier'
                            : 'Équipe sur le chantier'}
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Chefs */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">Chefs de chantier</h3>
                        <div className="space-y-3">
                            {chefs.map(({ user, years_experience, disponible }) => (
                                <Link
                                    to={`/user/${user.id}`}
                                    key={user.id}
                                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {years_experience} ans d'expérience
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                    disponible
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {disponible ? 'Disponible' : 'Indisponible'}
                                            </div>
                                            <ArrowRight size={16} className="text-primary" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {chefs.length === 0 && (
                                <div className="text-gray-600 text-sm">
                                    Aucun chef de chantier assigné
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Artisans */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">Ouvriers</h3>
                        <div className="space-y-3">
                            {artisans.map(({ user, specialites, note_moyenne, disponible }) => (
                                <Link
                                    to={`/user/${user.id}`}
                                    key={user.id}
                                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {specialites
                                                    ? specialites
                                                          .map((spec) =>
                                                              spec.replace(/['"[\]]/g, '')
                                                          )
                                                          .join(', ')
                                                    : ''}
                                            </div>
                                            {note_moyenne && (
                                                <div className="text-sm text-gray-600">
                                                    Note: {note_moyenne}/5
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                    disponible
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {disponible ? 'Disponible' : 'Indisponible'}
                                            </div>
                                            <ArrowRight size={16} className="text-primary" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {artisans.length === 0 && (
                                <div className="text-gray-600 text-sm">Aucun ouvrier assigné</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
