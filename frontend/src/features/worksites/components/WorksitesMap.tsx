import { Worksite } from '@/types/worksiteType';
import { LatLngExpression, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRight, Building2, MapPin, Pickaxe } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';

interface MapComponentProps {
    data: Worksite[];
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

const MapComponent = ({ data }: MapComponentProps) => {
    const defaultCenter: LatLngExpression = [48.8566, 2.3522]; // Coordonnées de Paris par défaut

    return (
        <div>
            <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: '74vh', width: '100%', borderRadius: '8px' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                {data.map((worksite) => (
                    <Marker
                        key={worksite.id}
                        position={worksite.coordinates as LatLngExpression}
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="p-2 min-w-[250px]">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={16} className="text-primary" />
                                        <span className="font-medium">{worksite.name}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="text-primary flex-shrink-0" />
                                        <span className="text-gray-600 text-sm">
                                            {worksite.address}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/worksites/${worksite.id}`}
                                        className="flex items-center justify-center gap-2 w-full bg-primary py-2 px-4 rounded-md group"
                                    >
                                        <span className="text-white">Voir le chantier</span>
                                        <ArrowRight size={16} color='white' className='group-hover:translate-x-1 transition-all duration-300' />
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
