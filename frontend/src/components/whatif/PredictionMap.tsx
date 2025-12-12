import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Use a simple map for now, can be enhanced with RailMap logic later
export function PredictionMap() {
    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner border border-border">
            <MapContainer center={[17.6, 79.0]} zoom={10} className="h-full w-full" style={{ background: "#0f172a" }}>
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
            </MapContainer>

            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-xs text-white z-[1000] border border-white/10">
                Prediction View
            </div>
        </div>
    );
}
