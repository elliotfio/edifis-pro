import { useParams } from 'react-router-dom';
import { Worksite as WorksiteType } from '@/types/worksiteType';
import { formatDateToDDMMYYYY } from '@/services/formattedDateService';
import { getColorStatus, getLabelStatus } from '@/services/badgeService';
import worksiteMockData from '@/mocks/worksiteMock.json';
import userMockData from '@/mocks/userMock.json';
import { LatLngExpression, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
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

export default function Worksite() {
    const { id } = useParams();

    // In a real app, you would fetch this from an API
    const worksite = (worksiteMockData.worksites as WorksiteType[]).find((w) => w.id === id);

    if (!worksite) {
        return <div className="p-6">Chantier non trouvé</div>;
    }

    const statusColor = getColorStatus(worksite.status);
    const statusLabel = getLabelStatus(worksite.status);

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
                        {worksite.specialities_needed.map((speciality) => (
                            <span
                                key={speciality}
                                className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm"
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
                    center={worksite.coordinates as LatLngExpression}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    <Marker position={worksite.coordinates as LatLngExpression} icon={customIcon} />
                </MapContainer>
            </div>

            {/* Équipe */}
            <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4 mb-8">
                <div className="flex gap-2 items-center mb-4">
                    <Users size={20} />
                    <h2 className="font-medium">Équipe sur le chantier</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Chefs */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">Chefs de chantier</h3>
                        <div className="space-y-3">
                            {userMockData.chefs
                                .filter((chef) => chef.current_worksite === id)
                                .map((chef) => {
                                    const user = userMockData.users.find(
                                        (u) => u.id === chef.user_id
                                    );
                                    if (!user) return null;

                                    return (
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
                                                        {chef.years_experience} ans d'expérience
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`px-2 py-1 rounded-full text-xs ${
                                                            chef.disponible
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {chef.disponible
                                                            ? 'Disponible'
                                                            : 'Indisponible'}
                                                    </div>
                                                    <ArrowRight
                                                        size={16}
                                                        className="text-primary"
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            {userMockData.chefs.filter((chef) => chef.current_worksite === id)
                                .length === 0 && (
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
                            {userMockData.artisans
                                .filter((artisan) => artisan.current_worksite === id)
                                .map((artisan) => {
                                    const user = userMockData.users.find(
                                        (u) => u.id === artisan.user_id
                                    );
                                    if (!user) return null;

                                    return (
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
                                                        {artisan.specialites.join(', ')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`px-2 py-1 rounded-full text-xs ${
                                                            artisan.disponible
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {artisan.disponible
                                                            ? 'Disponible'
                                                            : 'Indisponible'}
                                                    </div>
                                                    <ArrowRight
                                                        size={16}
                                                        className="text-primary"
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            {userMockData.artisans.filter(
                                (artisan) => artisan.current_worksite === id
                            ).length === 0 && (
                                <div className="text-gray-600 text-sm">Aucun ouvrier assigné</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
