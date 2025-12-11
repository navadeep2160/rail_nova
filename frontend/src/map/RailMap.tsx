import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface RailMapProps {
    children?: React.ReactNode;
}

// Center around Bibinagar for view of full stretch
const CENTER: [number, number] = [17.6, 79.0];
const ZOOM = 10;

export default function RailMap({ children }: RailMapProps) {
    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-border shadow-md">
            <MapContainer center={CENTER} zoom={ZOOM} className="h-full w-full" style={{ background: "#242424" }}>
                {/* Dark Matter based tiles for 'Hackathon' vibe */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {/* OpenRailwayMap overlay can be added as second layer if needed */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
                    url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                    opacity={0.6}
                />
                {children}
            </MapContainer>
        </div>
    );
}
