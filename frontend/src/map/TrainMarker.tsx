import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

// Custom Train Icon
// Custom Train Icon with Pulse Effect for Delayed/Stopped
const createTrainIcon = (status: string) => {
    const color = status === "on-time" ? "#22c55e" : status === "delayed" ? "#ef4444" : "#eab308";
    const pulseClass = status === "delayed" ? "animate-pulse" : "";

    return L.divIcon({
        className: "train-marker-icon bg-transparent border-none",
        html: `
            <div class="relative w-8 h-8 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 bg-slate-900 rounded-full p-1 shadow-lg shadow-black/50 ${pulseClass} border border-slate-600">
                    <path d="M3 13v6h2" fill="${color}" stroke="none"></path>
                    <path d="M19 13v6h2" fill="${color}" stroke="none"></path>
                    <path d="M2 13h20" stroke="${color}"></path>
                    <path d="M4 3h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#1e293b"></path>
                    <path d="M8 8h.01" stroke="white" stroke-width="3"></path>
                    <path d="M16 8h.01" stroke="white" stroke-width="3"></path>
                    <path d="M12 17v-4" stroke="${color}"></path>
                </svg>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16] // Center the icon
    });
};

interface TrainMarkerProps {
    id: string;
    lat: number;
    lng: number;
    name: string;
    speed: number;
    status: "on-time" | "delayed";
}

export default function TrainMarker({ lat, lng, name, speed, status }: TrainMarkerProps) {
    // markerRef removed as logic was unused


    // Framer Motion isn't directly compatible with Leaflet's render loop for position updates in the same way as DOM elements.
    // However, for simplified "animation" in this phase, we rely on Leaflet's internal transition if we were to update props frequently,
    // OR we use a custom hook for interpolation.
    // For now, we will just render the marker at the props location. The parent is responsible for updating lat/lng smoothly.
    // To truly animate 'between' updates, we would need a requestAnimationFrame loop or use simple css transitions on the marker icon if possible.
    // BUT the user asked for Framer Motion. We can wrap the inner div in the icon? No, Leaflet renders HTML strings.

    // STRATEGY: We don't animate the Leaflet Marker component directly with Framer Motion props.
    // Instead, we just rely on React updates. If high-freq updates come in via WebSocket, it looks smooth.
    // For low-freq, we'd need client-side interpolation.

    return (
        <Marker
            position={[lat, lng]}
            icon={createTrainIcon(status)}
        >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-sm">
                    <p className="font-bold">{name}</p>
                    <p className="text-xs">{speed} km/h • {status}</p>
                </div>
            </Tooltip>
        </Marker>
    );
}
