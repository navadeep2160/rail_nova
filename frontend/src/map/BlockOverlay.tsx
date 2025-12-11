import { Polyline } from "react-leaflet";
import { STATIONS } from "../data/stations";

// Generate mock blocks between stations
const BLOCKS = STATIONS.slice(0, -1).map((station, i) => {
    const nextStation = STATIONS[i + 1];
    return {
        id: `BLK-${station.code}-${nextStation.code}`,
        positions: [
            [station.lat, station.lng],
            [nextStation.lat, nextStation.lng]
        ] as [number, number][],
        status: Math.random() > 0.7 ? "occupied" : "free" // Mock status
    };
});

export default function BlockOverlay() {
    return (
        <>
            {BLOCKS.map((block) => (
                <Polyline
                    key={block.id}
                    positions={block.positions}
                    pathOptions={{
                        color: block.status === "occupied" ? "#ef4444" : "#22c55e",
                        weight: 6,
                        opacity: 0.4,
                        lineCap: 'butt'
                    }}
                />
            ))}
        </>
    );
}
