// src/components/ReportMap.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue with Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function ReportMap({ reports, center, zoom = 13 }) {
  // Use a default center for the map (e.g., your location: Mysore)
  const mapCenter = center || [12.3138, 76.6133]; 

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return '#ffc107';
      case 'WORKING': return '#0d6efd';
      case 'CLEARED': return '#198754';
      case 'REJECTED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Loop through all reports and create a Marker for each */}
        {reports && reports.length > 0 && reports.map((report) => {
          if (!report.location || !report.location.coordinates || report.location.coordinates.length < 2) {
            return null;
          }
          
          return (
            <Marker
              key={report._id}
              // IMPORTANT: Leaflet uses [Latitude, Longitude]
              position={[
                report.location.coordinates[1], 
                report.location.coordinates[0] 
              ]}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  {report.media_urls && report.media_urls.length > 0 && (
                    <img
                      src={report.media_urls[0]}
                      alt={report.title}
                      style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <h6 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{report.title}</h6>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{report.description}</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: getStatusColor(report.status),
                        color: 'white',
                        padding: '4px 8px'
                      }}
                    >
                      {report.status}
                    </span>
                    {report.report_type && (
                      <span className="badge bg-secondary">{report.report_type}</span>
                    )}
                  </div>
                  {report.likes && report.likes.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      👍 {report.likes.length} likes
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default ReportMap;