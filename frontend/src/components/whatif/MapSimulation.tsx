import { MapContainer, TileLayer, Marker, Popup, LayersControl, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Train } from "../../types"; // Assume types exists or define inline

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Train Icon Generator
const createTrainIcon = (status: string, rotation: number = 0) => {
    const color = status === "on-time" ? "#22c55e" : status === "delayed" ? "#ef4444" : "#eab308";
    return L.divIcon({
        className: "custom-train-icon",
        html: `
            <div style="
                background-color: ${color};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 10px ${color};
                display: flex;
                align-items: center;
                justify-content: center;
                transform: rotate(${rotation}deg);
            ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2L12 22M12 2L18 8M12 2L6 8" /> {/* Arrow pointing up */}
                </svg>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

interface MapSimulationProps {
    trains: any[]; // Replace with Train type
}

export default function MapSimulation({ trains }: MapSimulationProps) {
    const [mapStyle, setMapStyle] = useState("dark_all");

    return (
        <div className="relative h-full w-full rounded-lg overflow-hidden border border-border shadow-2xl">
            <MapContainer
                center={[17.5, 78.9]}
                zoom={10}
                className="h-full w-full"
                zoomControl={false}
                style={{ background: "#0f172a" }}
            >
                {/* Layer Control */}
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Dark Mode">
                        <TileLayer
                            attribution='&copy; CARTO'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satellite">
                        <TileLayer
                            attribution='&copy; Esri'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Street">
                        <TileLayer
                            attribution='&copy; OSM'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* Custom Zoom Control */}
                <ZoomControl position="bottomright" />

                {/* Trains */}
                {trains.map((train) => (
                    <Marker
                        key={train.id}
                        position={[train.lat, train.lng]}
                        icon={createTrainIcon(train.status, 90)} // 90 deg rotation for Eastward movement
                    >
                        <Popup className="custom-popup">
                            <div className="p-2 min-w-[150px]">
                                <h3 className="font-bold text-lg mb-1">{train.name} ({train.id})</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Speed:</span>
                                        <span className="font-medium">{train.speed.toFixed(1)} km/h</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status:</span>
                                        <span className={`font-medium uppercase text-xs px-1 rounded ${train.status === 'on-time' ? 'bg-green-100 text-green-700' :
                                                train.status === 'delayed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {train.status}
                                        </span>
                                    </div>
                                    {train.distance && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Dist:</span>
                                            <span className="font-medium">{train.distance.toFixed(1)} km</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

            </MapContainer>

            {/* Timeline UI (Visual Only) */}
            <div className="absolute bottom-6 left-6 right-16 bg-card/90 backdrop-blur p-3 rounded-xl border border-border flex items-center gap-4 z-[1000]">
                <button className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </button>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3 animate-pulse"></div>
                </div>
                <span className="text-xs font-mono text-muted-foreground">12:45 PM</span>
            </div>
        </div>
    );
}
