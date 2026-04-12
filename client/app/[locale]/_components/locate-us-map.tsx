"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const POSITION: [number, number] = [
  52.2065986, 0.1300951,
];
const NAME = "Cambridge Hot Sausage";
const ADDRESS = "Pitch 14, Fitzroy Street, Cambridge CB1 1EW";

// Custom maroon pin built from inline HTML so it picks up brand colors
const pinIcon = L.divIcon({
  className: "chs-pin",
  html: `
    <div style="position:relative;width:40px;height:50px;filter:drop-shadow(0 6px 10px rgba(43,43,43,0.35));">
      <svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0 C9 0 0 9 0 20 c0 14 20 30 20 30 s20 -16 20 -30 C40 9 31 0 20 0 z"
              fill="#5A1F1F" stroke="#ECD691" stroke-width="2.5" />
        <circle cx="20" cy="20" r="7" fill="#ECD691" />
      </svg>
    </div>
  `,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -44],
});

export default function LocateUsMap() {
  return (
    <MapContainer
      center={POSITION}
      zoom={17}
      scrollWheelZoom={false}
      zoomControl={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <Marker position={POSITION} icon={pinIcon}>
        <Popup>
          <div style={{ fontFamily: "system-ui, sans-serif" }}>
            <strong style={{ display: "block", marginBottom: 4, color: "#5A1F1F" }}>
              {NAME}
            </strong>
            <span style={{ color: "#2B2B2B" }}>{ADDRESS}</span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
