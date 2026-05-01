"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import polyline from "@mapbox/polyline";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface ActivityMapProps {
  summaryPolyline: string;
}

export function ActivityMap({ summaryPolyline }: ActivityMapProps) {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    // Dynamically load leaflet CSS only when component mounts on client
    // @ts-expect-error - CSS imports don't have types
    import("leaflet/dist/leaflet.css");
    
    if (summaryPolyline) {
      try {
        const decoded = polyline.decode(summaryPolyline);
        setPositions(decoded);
      } catch (error) {
        console.error("Failed to decode polyline", error);
      }
    }
  }, [summaryPolyline]);

  if (!positions.length) {
    return (
      <div className="w-full h-32 bg-muted/50 rounded-md flex items-center justify-center">
        <span className="text-muted-foreground text-sm">No GPS data</span>
      </div>
    );
  }

  // Calculate bounds to auto-fit the map
  const lats = positions.map((p) => p[0]);
  const lngs = positions.map((p) => p[1]);
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];

  return (
    <div className="w-full h-32 rounded-md overflow-hidden relative z-0">
      <MapContainer
        bounds={bounds}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Polyline positions={positions} color="#fc4c02" weight={3} opacity={0.8} />
      </MapContainer>
    </div>
  );
}
