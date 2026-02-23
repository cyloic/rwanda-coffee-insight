import { useEffect, useRef } from "react";
import { Region } from "@/data/sampleData";

interface RwandaMapProps {
  regions: Region[];
  onRegionClick: (region: Region) => void;
  selectedRegion: Region | null;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#00A859"; // Rwanda green
  if (score >= 60) return "#D4AF37"; // Gold
  return "#c0392b"; // Red
}

function getScoreColorFill(score: number): string {
  if (score >= 80) return "rgba(0, 168, 89, 0.35)";
  if (score >= 60) return "rgba(212, 175, 55, 0.35)";
  return "rgba(192, 57, 43, 0.35)";
}

export default function RwandaMap({ regions, onRegionClick, selectedRegion }: RwandaMapProps) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [-2.0, 29.4],
        zoom: 8,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Dark tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);

      // Draw region polygons
      regions.forEach((region) => {
        const polygon = L.polygon(region.coordinates as any, {
          color: getScoreColor(region.score),
          weight: 2,
          fillColor: getScoreColorFill(region.score),
          fillOpacity: 0.55,
        }).addTo(map);

        const popupContent = `
          <div style="min-width:180px;font-family:system-ui,sans-serif;">
            <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:#D4AF37;">${region.name}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;">
              <span style="color:#888;">Score</span>
              <span style="font-weight:600;font-family:monospace;color:${getScoreColor(region.score)};">${region.score}/100</span>
              <span style="color:#888;">ROI</span>
              <span style="font-weight:600;font-family:monospace;">${region.roi}%</span>
              <span style="color:#888;">Risk</span>
              <span style="font-weight:600;font-family:monospace;">${region.riskPercent}%</span>
              <span style="color:#888;">Farmers</span>
              <span style="font-weight:600;font-family:monospace;">${region.farmerCount.toLocaleString()}</span>
            </div>
            <div style="margin-top:8px;font-size:11px;color:#aaa;line-height:1.4;">${region.description}</div>
          </div>
        `;

        polygon.bindPopup(popupContent);
        polygon.on("click", () => {
          onRegionClick(region);
          polygon.openPopup();
        });
        polygon.on("mouseover", () => {
          polygon.setStyle({ fillOpacity: 0.75, weight: 3 });
        });
        polygon.on("mouseout", () => {
          polygon.setStyle({ fillOpacity: 0.55, weight: 2 });
        });

        // Label marker
        const center = polygon.getBounds().getCenter();
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            background:rgba(15,10,8,0.85);
            border:1px solid ${getScoreColor(region.score)};
            border-radius:4px;
            padding:2px 6px;
            font-size:11px;
            font-weight:700;
            color:${getScoreColor(region.score)};
            white-space:nowrap;
            font-family:system-ui,sans-serif;
          ">${region.name} <span style="color:#e0d9d0;">${region.score}</span></div>`,
          iconAnchor: [40, 12],
        });
        L.marker([center.lat, center.lng], { icon }).addTo(map);

        layersRef.current.push(polygon);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded border border-border bg-card/95 p-3 text-xs space-y-1.5">
        <div className="section-heading mb-2">Investment Score</div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: "#00A859" }} />
          <span className="text-muted-foreground">High (≥80)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: "#D4AF37" }} />
          <span className="text-muted-foreground">Medium (60–79)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: "#c0392b" }} />
          <span className="text-muted-foreground">Low (&lt;60)</span>
        </div>
      </div>
    </div>
  );
}
