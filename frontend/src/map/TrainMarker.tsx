import { useRef, useEffect } from "react";
import { Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";

// Custom Train Icon
const createTrainIcon = (color: string) => L.divIcon({
    className: "train-marker-icon",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border: 2px solid white; border-radius: 4px; transform: rotate(45deg); box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

interface TrainMarkerProps {
    id: string;
    lat: number;
    lng: number;
    name: string;
    speed: number;
    status: "on-time" | "delayed";
}

export default function TrainMarker({ id, lat, lng, name, speed, status }: TrainMarkerProps) {
    const markerRef = useRef<L.Marker>(null);

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
            ref={markerRef}
            position={[lat, lng]}
            icon={createTrainIcon(status === "on-time" ? "#22c55e" : "#ef4444")}
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
