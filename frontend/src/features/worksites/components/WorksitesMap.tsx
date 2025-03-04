import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Worksite } from '@/types/worksiteType';
import { LatLngExpression } from 'leaflet';

interface MapComponentProps {
    data: Worksite[];
}

const MapComponent = ({ data }: MapComponentProps) => {
    console.log(data)
    const defaultCenter: LatLngExpression = [48.8566, 2.3522]; // Coordonnées de Paris par défaut

    return (
        <div>
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '74vh', width: '100%', borderRadius: '8px' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer 
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
            </MapContainer>
        </div>
    );
};

export default MapComponent;

