"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  onChange: (lat: number, lng: number) => void;
}

function MapEvents({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
  // Ensure we have numbers to render the map
  const latNum = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lngNum = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

  const [center, setCenter] = useState<[number, number]>(
    latNum && lngNum && !isNaN(latNum) && !isNaN(lngNum) 
      ? [latNum, lngNum] 
      : [51.505, -0.09] // Default to London
  );

  useEffect(() => {
    if (latNum && lngNum && !isNaN(latNum) && !isNaN(lngNum)) {
      setCenter([latNum, lngNum]);
    }
  }, [latNum, lngNum]);

  const hasValidPoint = latNum !== undefined && latNum !== null && !isNaN(latNum) &&
                        lngNum !== undefined && lngNum !== null && !isNaN(lngNum);

  return (
    <div style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)', position: 'relative', zIndex: 1 }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onChange={onChange} />
        {hasValidPoint && (
          <Marker position={[latNum, lngNum]} />
        )}
      </MapContainer>
    </div>
  );
}
