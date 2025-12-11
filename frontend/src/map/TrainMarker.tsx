import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

// Custom Train Icon
// Custom Train Icon with Pulse Effect for Delayed/Stopped
const createTrainIcon = (status: string) => {
    const color = status === "on-time" ? "#22c55e" : status === "delayed" ? "#ef4444" : "#eab308";
    const pulseClass = status === "delayed" ? "animate-pulse" : "";

    return L.divIcon({
        className: "train-marker-icon",
        html: `
            <div class="relative w-6 h-6 flex items-center justify-center">
                <div class="absolute inset-0 bg-white rounded-full opacity-50 ${pulseClass}"></div>
                <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg transform transition-transform duration-500 hover:scale-125" style="background-color: ${color}; box-shadow: 0 0 8px ${color};"></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
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
