import { Polyline, Marker, Popup, Tooltip } from "react-leaflet";
import { STATIONS, TRACK_POLYLINE } from "../data/stations";
import L from "leaflet";

// Fix deafult leaflet icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Station Icon
const stationIcon = L.divIcon({
    className: "custom-div-icon",
    html: "<div style='background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;'></div>",
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

export default function TrackLayer() {
    return (
        <>
            {/* Main Track Line */}
            <Polyline
                positions={TRACK_POLYLINE}
                pathOptions={{ color: "#60a5fa", weight: 4, opacity: 0.7, dashArray: '10, 10' }}
            />

            {/* Stations */}
            {STATIONS.map((station) => (
                <Marker key={station.id} position={[station.lat, station.lng]} icon={stationIcon}>
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                        <span className="font-bold text-sm">{station.name} ({station.code})</span>
                    </Tooltip>
                </Marker>
            ))}
        </>
    );
}
