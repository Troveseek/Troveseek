"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Phone, Mail } from 'lucide-react';

// Fix for default marker icons in React-Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  email?: string | null;
}

export default function MapComponent() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/locations');
        if (!res.ok) {
          console.warn('Failed to load locations:', res.status);
          setIsLoading(false);
          return;
        }
        const json = await res.json();
        setLocations(json.data || []);
      } catch (err) {
        console.error('Failed to load locations', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  if (isLoading) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-surface-2)', borderRadius: '16px' }}>
        <div style={{ color: 'var(--clr-text-muted)' }}>Loading Map...</div>
      </div>
    );
  }

  // Default to global HQ view if no locations exist
  const defaultCenter: [number, number] = locations.length > 0 
    ? [locations[0].latitude, locations[0].longitude] 
    : [36.752887, 3.042048];
  const defaultZoom = locations.length > 0 ? 13 : 4;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '340px', borderRadius: '16px', overflow: 'hidden', position: 'relative', zIndex: 0 }}>
      <MapContainer center={defaultCenter} zoom={defaultZoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%', minHeight: '340px' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.length > 0 ? (
          locations.map((loc) => (
            <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
              <Popup>
                <div style={{ padding: '4px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>{loc.name}</h3>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#555', lineHeight: 1.4 }}>{loc.address}</p>
                  {loc.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#444', marginBottom: '4px' }}>
                      <Phone size={12} /> {loc.phone}
                    </div>
                  )}
                  {loc.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#444' }}>
                      <Mail size={12} /> {loc.email}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))
        ) : (
          <Marker position={defaultCenter}>
            <Popup>
              <div style={{ padding: '4px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>TroveSeek HQ</h3>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#555', lineHeight: 1.4 }}>123 Innovation Drive, Tech City</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#444' }}>
                  <Mail size={12} /> contact@troveseek.com
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
