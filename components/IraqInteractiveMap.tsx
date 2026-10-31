"use client";

import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import { Expand, Minus, Plus, RotateCcw } from "lucide-react";
import { useAtharTheme } from "@/components/ThemeProvider";

const IRAQ_BOUNDS: LatLngBoundsExpression = [
  [29.05, 38.77],
  [37.38, 48.56]
];
const MAX_BOUNDS: LatLngBoundsExpression = [[28.65, 38.25], [37.8, 49.15]];

const cities = [
  { id: "baghdad", name: "بغداد", position: [33.3152, 44.3661] as [number, number], tone: "gold", direction: "top" as const, offset: [0, -9] as [number, number] },
  { id: "karbala", name: "كربلاء", position: [32.6160, 44.0249] as [number, number], tone: "teal", direction: "left" as const, offset: [-12, 0] as [number, number] },
  { id: "najaf", name: "النجف", position: [32.0003, 44.3354] as [number, number], tone: "teal", direction: "right" as const, offset: [12, 0] as [number, number] },
  { id: "samarra", name: "سامراء", position: [34.1978, 43.8748] as [number, number], tone: "teal", direction: "top" as const, offset: [0, -9] as [number, number] },
  { id: "basra", name: "البصرة", position: [30.5085, 47.7804] as [number, number], tone: "teal", direction: "top" as const, offset: [0, -9] as [number, number] }
] as const;

function MapControls() {
  const map = useMap();
  return (
    <div className="athar-map-controls" dir="ltr" aria-label="أدوات الخريطة">
      <button type="button" onClick={() => map.zoomIn()} aria-label="تكبير الخريطة" title="تكبير"><Plus size={17} /></button>
      <button type="button" onClick={() => map.zoomOut()} aria-label="تصغير الخريطة" title="تصغير"><Minus size={17} /></button>
      <button type="button" onClick={() => map.fitBounds(IRAQ_BOUNDS, { padding: [24, 24], animate: true })} aria-label="إظهار العراق بالكامل" title="إظهار العراق بالكامل"><Expand size={15} /></button>
      <button type="button" onClick={() => map.setView([33.22, 43.9], 5, { animate: true })} aria-label="إعادة ضبط الخريطة" title="إعادة الضبط"><RotateCcw size={14} /></button>
    </div>
  );
}

export default function IraqInteractiveMap() {
  const { theme } = useAtharTheme();
  return (
    <div className={theme === "dark" ? "iraq-map-shell iraq-map-dark" : "iraq-map-shell iraq-map-light"}>
      <MapContainer
        className="iraq-leaflet-map"
        bounds={IRAQ_BOUNDS}
        boundsOptions={{ padding: [26, 26] }}
        minZoom={4}
        maxZoom={12}
        maxBounds={MAX_BOUNDS}
        maxBoundsViscosity={0.72}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={true}
        preferCanvas={true}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>'
          minZoom={4}
          maxZoom={19}
          keepBuffer={2}
        />

        {cities.map((city) => (
          <Fragment key={city.id}>
            <CircleMarker
              center={city.position}
              radius={22}
              pathOptions={{
                stroke: false,
                fillColor: city.tone === "gold" ? "#f7b942" : "#24d9c4",
                fillOpacity: 0.2
              }}
              interactive={false}
            />
            <CircleMarker
              center={city.position}
              radius={8}
              pathOptions={{
                color: city.tone === "gold" ? "#fff0bd" : "#b4fff3",
                weight: 2,
                fillColor: city.tone === "gold" ? "#ffbd46" : "#20d9bf",
                fillOpacity: 1
              }}
            >
              <Tooltip permanent direction={city.direction} offset={city.offset} opacity={1} className="athar-map-city-tooltip">
                <span>{city.name}</span>
              </Tooltip>
              <Popup>
                <div className="athar-map-popup" dir="rtl">
                  <strong>{city.name}</strong>
                  <small>مدينة ضمن نطاق خريطة أثر معروف</small>
                </div>
              </Popup>
            </CircleMarker>
          </Fragment>
        ))}
        <MapControls />
      </MapContainer>
      <a className="iraq-map-issue" href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer">الإبلاغ عن خطأ بالخريطة</a>
      <div className="iraq-map-top-label" aria-hidden="true">
        <span>خريطة العراق</span>
        <small>مواقع المدن الخمس المحددة</small>
      </div>
    </div>
  );
}
