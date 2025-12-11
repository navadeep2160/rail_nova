export interface Station {
    id: string;
    name: string;
    code: string;
    lat: number;
    lng: number;
    type: "function" | "terminus" | "halt";
}

export const STATIONS: Station[] = [
    { id: "SC", name: "Secunderabad Jn", code: "SC", lat: 17.4334, lng: 78.5044, type: "terminus" },
    { id: "MJF", name: "Malkajgiri", code: "MJF", lat: 17.4497, lng: 78.5262, type: "function" },
    { id: "CHZ", name: "Charlapalli", code: "CHZ", lat: 17.4721, lng: 78.5910, type: "halt" },
    { id: "GT", name: "Ghatkesar", code: "GT", lat: 17.4589, lng: 78.6823, type: "halt" },
    { id: "BN", name: "Bibinagar", code: "BN", lat: 17.4744, lng: 78.7902, type: "function" },
    { id: "BG", name: "Bhongir", code: "BG", lat: 17.5134, lng: 78.8920, type: "function" },
    { id: "ZN", name: "Jangaon", code: "ZN", lat: 17.7244, lng: 79.1620, type: "function" },
    { id: "ALER", name: "Aler", code: "ALER", lat: 17.6534, lng: 79.0520, type: "halt" }, // Corrected approx pos based on route
    { id: "KZJ", name: "Kazipet Jn", code: "KZJ", lat: 17.9784, lng: 79.4890, type: "terminus" },
];

export const TRACK_POLYLINE: [number, number][] = STATIONS.map(s => [s.lat, s.lng]);
