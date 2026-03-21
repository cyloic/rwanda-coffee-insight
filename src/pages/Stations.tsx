import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { WASHING_STATIONS, WashingStation } from "@/data/washingStations";
import { X, ExternalLink, Award, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

const DISTRICTS = ["All", "Huye", "Nyamasheke", "Rusizi", "Karongi", "Nyaruguru"] as const;
const DISTRICT_COLORS: Record<string, string> = {
  Huye: "#00A859", Nyamasheke: "#D4AF37", Rusizi: "#e67e22", Karongi: "#9b59b6", Nyaruguru: "#e74c3c",
};

function CertBadge({ cert }: { cert: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-data">
      {cert}
    </span>
  );
}

function StationDetail({ station, onClose }: { station: WashingStation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="rounded-lg border border-border bg-card w-full max-w-lg shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white font-data"
                style={{ background: DISTRICT_COLORS[station.district] }}>
                {station.district}
              </span>
              {station.coeResults?.length ? (
                <span className="flex items-center gap-1 text-[10px] text-gold font-semibold">
                  <Award className="h-3 w-3" /> CoE Winner
                </span>
              ) : null}
            </div>
            <h2 className="text-lg font-bold text-foreground leading-tight">{station.name}</h2>
            {station.cooperative && (
              <p className="text-xs text-muted-foreground mt-0.5">{station.cooperative}</p>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors ml-4 flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Key stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Altitude", value: `${station.altitudeStationM.toLocaleString()} m` },
              { label: "Farm Range", value: `${station.altitudeFarmsM} m` },
              { label: "Farmers", value: station.farmerCount ? station.farmerCount.toLocaleString() : "—" },
              { label: "Established", value: station.established ? String(station.established) : "—" },
            ].map(m => (
              <div key={m.label} className="rounded bg-secondary p-3">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="font-data text-base font-bold text-foreground mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Processing & varietals */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">Varietals</span>
              {station.varietals.map(v => <CertBadge key={v} cert={v} />)}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">Processing</span>
              {station.processing.map(p => <CertBadge key={p} cert={p} />)}
            </div>
            {station.certifications.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">Certified</span>
                {station.certifications.map(c => (
                  <span key={c} className="text-[10px] px-1.5 py-0.5 rounded border border-rwandaGreen/50 text-rwandaGreen font-data">{c}</span>
                ))}
              </div>
            )}
          </div>

          {/* CoE results */}
          {station.coeResults?.length ? (
            <div className="rounded border border-gold/30 bg-gold/5 p-3">
              <p className="text-xs font-semibold text-gold mb-2 flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> Cup of Excellence Results
              </p>
              {station.coeResults.map((r, i) => (
                <div key={i} className="text-xs text-muted-foreground font-data">
                  {r.year} · {r.competition}{r.rank > 0 ? ` · Rank #${r.rank}` : ""}{r.score > 0 ? ` · Score ${r.score}` : ""}
                </div>
              ))}
            </div>
          ) : null}

          {/* Notable info */}
          <p className="text-sm text-muted-foreground leading-relaxed">{station.notableInfo}</p>

          {/* Location & contact */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
            <a href={`https://www.google.com/maps?q=${station.lat},${station.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <MapPin className="h-3.5 w-3.5" />
              View on Maps
            </a>
            {station.contactUrl && (
              <a href={station.contactUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-rwandaGreen hover:opacity-80 transition-opacity">
                <ExternalLink className="h-3.5 w-3.5" />
                Profile / Contact
              </a>
            )}
          </div>

          {/* Coordinate note */}
          <p className="text-[10px] text-muted-foreground/60">{station.coordinateNote}</p>
        </div>
      </div>
    </div>
  );
}

function StationsMap({ stations, selected, onSelect }: {
  stations: WashingStation[];
  selected: WashingStation | null;
  onSelect: (s: WashingStation) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return;
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(mapRef.current!, {
        center: [-2.5, 29.4],
        zoom: 9,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
      }).addTo(map);

      instanceRef.current = map;
    });
  }, []);

  // Re-render markers when stations or selection changes
  useEffect(() => {
    if (!instanceRef.current) return;
    import("leaflet").then((L) => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      stations.forEach(station => {
        const color = DISTRICT_COLORS[station.district];
        const isSelected = selected?.id === station.id;
        const hasCoe = !!station.coeResults?.length;

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:${isSelected ? 16 : hasCoe ? 13 : 10}px;
            height:${isSelected ? 16 : hasCoe ? 13 : 10}px;
            background:${color};
            border:${isSelected ? "3px solid white" : hasCoe ? "2px solid #D4AF37" : "2px solid rgba(255,255,255,0.4)"};
            border-radius:50%;
            box-shadow:${isSelected ? "0 0 0 3px rgba(255,255,255,0.3)" : "0 1px 4px rgba(0,0,0,0.5)"};
            transition:all 0.2s;
          "></div>`,
          iconSize: [isSelected ? 16 : hasCoe ? 13 : 10, isSelected ? 16 : hasCoe ? 13 : 10],
          iconAnchor: [isSelected ? 8 : hasCoe ? 6.5 : 5, isSelected ? 8 : hasCoe ? 6.5 : 5],
        });

        const marker = L.marker([station.lat, station.lng], { icon })
          .addTo(instanceRef.current)
          .bindTooltip(`<div style="font-size:11px;font-family:monospace">${station.name}<br/><span style="color:#888">${station.district} · ${station.altitudeStationM}m</span></div>`, {
            direction: "top", offset: [0, -6], className: "leaflet-tooltip-dark",
          })
          .on("click", () => onSelect(station));

        markersRef.current.push(marker);
      });
    });
  }, [stations, selected]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
}

export default function Stations() {
  const [searchParams] = useSearchParams();
  const initialDistrict = searchParams.get("district") ?? "All";

  const [district, setDistrict] = useState<string>(initialDistrict);
  const [coeOnly, setCoeOnly]   = useState(false);
  const [selected, setSelected] = useState<WashingStation | null>(null);

  const filtered = WASHING_STATIONS.filter(s => {
    if (district !== "All" && s.district !== district) return false;
    if (coeOnly && !s.coeResults?.length) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <p className="section-heading mb-1">On-Ground Infrastructure</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Coffee Washing Stations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {WASHING_STATIONS.length} verified stations across 5 districts · Sources: NAEB, Cup of Excellence, specialty importers
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {DISTRICTS.map(d => (
          <button key={d} onClick={() => setDistrict(d)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
              district === d
                ? d === "All" ? "bg-gold text-gold-foreground border-gold"
                  : "text-white border-transparent"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
            style={district === d && d !== "All" ? { background: DISTRICT_COLORS[d], borderColor: DISTRICT_COLORS[d] } : {}}>
            {d}
          </button>
        ))}
        <div className="ml-auto">
          <button onClick={() => setCoeOnly(!coeOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
              coeOnly ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:text-foreground"
            }`}>
            <Award className="h-3.5 w-3.5" /> CoE Winners Only
          </button>
        </div>
      </div>

      {/* Map + list */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 rounded-lg border border-border bg-card overflow-hidden" style={{ height: 480 }}>
          <StationsMap stations={filtered} selected={selected} onSelect={setSelected} />
        </div>

        {/* Station list */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="section-heading">{filtered.length} stations</p>
            <div className="flex gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rwandaGreen inline-block" /> Huye</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gold inline-block" /> Nyamasheke</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{background:"#e67e22"}} /> Rusizi</span>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map(s => (
              <button key={s.id} onClick={() => setSelected(s)}
                className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-secondary/50 ${selected?.id === s.id ? "bg-secondary" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: DISTRICT_COLORS[s.district] }} />
                      <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.district} · {s.altitudeStationM}m · {s.farmerCount ? `${s.farmerCount.toLocaleString()} farmers` : "—"}</p>
                    {s.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.certifications.map(c => <CertBadge key={c} cert={c} />)}
                      </div>
                    )}
                  </div>
                  {s.coeResults?.length ? <Award className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" /> : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-gold bg-transparent inline-block" /> CoE winner</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border border-white/40 bg-rwandaGreen inline-block" /> Standard station</span>
        <span className="ml-auto">Sources: NAEB · Alliance for Coffee Excellence · Specialty importers · March 2026</span>
      </div>

      {/* Detail modal */}
      {selected && <StationDetail station={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
