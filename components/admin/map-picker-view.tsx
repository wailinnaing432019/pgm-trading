"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  MapPin,
  X,
  Navigation,
  Compass,
  Loader2,
  LocateFixed,
  Layers,
  ExternalLink,
} from "lucide-react";

interface MapPickerViewProps {
  initialLat?: number | null;
  initialLng?: number | null;
}

type MapLayerType = "google-hybrid" | "google-roads" | "osm";

const TILE_LAYERS: Record<
  MapLayerType,
  { label: string; url: string; maxZoom: number; attribution: string }
> = {
  "google-hybrid": {
    label: "Google Hybrid (Satellite)",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    maxZoom: 20,
    attribution: "&copy; Google Maps",
  },
  "google-roads": {
    label: "Google Roads",
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    maxZoom: 20,
    attribution: "&copy; Google Maps",
  },
  osm: {
    label: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
  },
};

// Preset locations in Myanmar for quick access
const PRESETS = [
  { label: "Yangon Downtown", lat: 16.7753, lng: 96.1595 },
  { label: "Bayintnaung Market (Agro Hub)", lat: 16.8586, lng: 96.1158 },
  { label: "Thilawa Port (Shipping)", lat: 16.6575, lng: 96.2625 },
  { label: "Mandalay", lat: 21.975, lng: 96.0836 },
];

const DEFAULT_CENTER: [number, number] = [16.8661, 96.1951]; // Yangon
const DEFAULT_ZOOM = 13;

function createPinIcon() {
  return L.divIcon({
    className: "pgm-map-marker",
    html: `
      <div style="position: relative; width: 34px; height: 42px; transform: translate(-17px, -42px); pointer-events: auto; cursor: grab;">
        <svg viewBox="0 0 24 32" width="34" height="42" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.45));">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20C24 5.373 18.627 0 12 0z" fill="#1b4332" stroke="#ffffff" stroke-width="1.8" />
          <circle cx="12" cy="11.5" r="4.5" fill="#d4af37" />
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function MapPickerView({ initialLat, initialLng }: MapPickerViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>("google-hybrid");

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (
      typeof initialLat === "number" &&
      !isNaN(initialLat) &&
      typeof initialLng === "number" &&
      !isNaN(initialLng)
    ) {
      return { lat: initialLat, lng: initialLng };
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const updateLocation = useCallback((lat: number, lng: number, zoom?: number) => {
    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));
    setCoords({ lat: roundedLat, lng: roundedLng });

    if (mapRef.current) {
      if (zoom) {
        mapRef.current.setView([roundedLat, roundedLng], zoom, { animate: true });
      } else {
        mapRef.current.panTo([roundedLat, roundedLng], { animate: true });
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([roundedLat, roundedLng]);
      } else {
        const marker = L.marker([roundedLat, roundedLng], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(mapRef.current);

        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          setCoords({
            lat: parseFloat(pos.lat.toFixed(6)),
            lng: parseFloat(pos.lng.toFixed(6)),
          });
        });

        markerRef.current = marker;
      }
    }
  }, []);

  const clearLocation = useCallback(() => {
    setCoords(null);
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    setStatusMessage(null);
  }, []);

  // Switch Tile Layer (Google Hybrid, Google Roads, OSM)
  const changeTileLayer = (layerType: MapLayerType) => {
    setActiveLayer(layerType);
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const config = TILE_LAYERS[layerType];
    const newLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      attribution: config.attribution,
    }).addTo(mapRef.current);

    tileLayerRef.current = newLayer;
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = coords
      ? [coords.lat, coords.lng]
      : DEFAULT_CENTER;
    const initialZoom = coords ? 16 : DEFAULT_ZOOM;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    const initialConfig = TILE_LAYERS[activeLayer];
    const tileLayer = L.tileLayer(initialConfig.url, {
      maxZoom: initialConfig.maxZoom,
      attribution: initialConfig.attribution,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    if (coords) {
      const marker = L.marker([coords.lat, coords.lng], {
        icon: createPinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setCoords({
          lat: parseFloat(pos.lat.toFixed(6)),
          lng: parseFloat(pos.lng.toFixed(6)),
        });
      });

      markerRef.current = marker;
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      updateLocation(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
    };
  }, [coords, updateLocation, activeLayer]);

  // Handle GPS "Locate Me"
  const handleLocateMe = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatusMessage({
        type: "error",
        text: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setIsLocating(true);
    setStatusMessage({
      type: "info",
      text: "Requesting your device GPS location… (please allow browser permission)",
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateLocation(lat, lng, 17);
        const accuracy = Math.round(pos.coords.accuracy);
        setStatusMessage({
          type: "success",
          text: `Found your current location (accurate to ±${accuracy}m). Pin dropped!`,
        });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setStatusMessage({
            type: "error",
            text: "Location permission denied. Please allow location access in your browser address bar.",
          });
        } else {
          setStatusMessage({
            type: "error",
            text: "Could not detect location. You can search, paste coordinates, or click the map.",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Smart Search: Handles Google Maps URLs, Coordinates (e.g. "16.8661, 96.1951"), or place names
  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const query = searchQuery.trim();
    if (!query) return;

    setStatusMessage(null);

    // 1. Check if user pasted a Google Maps URL with @lat,lng or ?q=lat,lng or ?ll=lat,lng
    const gmapsUrlMatch =
      query.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      query.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      query.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (gmapsUrlMatch) {
      const lat = parseFloat(gmapsUrlMatch[1]);
      const lng = parseFloat(gmapsUrlMatch[2]);
      updateLocation(lat, lng, 17);
      setStatusMessage({
        type: "success",
        text: `Extracted coordinates (${lat}, ${lng}) from Google Maps link!`,
      });
      return;
    }

    // 2. Check if user pasted an embed snippet or pb parameter (!2d(lng)!3d(lat))
    const embedMatch = query.match(/!2d(-?\d+(?:\.\d+)?)[^!]*!3d(-?\d+(?:\.\d+)?)/);
    if (embedMatch) {
      const lng = parseFloat(embedMatch[1]);
      const lat = parseFloat(embedMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        updateLocation(lat, lng, 17);
        setStatusMessage({
          type: "success",
          text: `Extracted coordinates (${lat}, ${lng}) from Google Maps embed code!`,
        });
        return;
      }
    }

    // 3. Check for DMS coordinates (e.g. 16°51'58.0"N 96°11'42.4"E)
    const dmsMatch = query.match(
      /(\d+)[°\s]+(\d+)['\s]+([\d.]+)?["\s]*([NSns])[,\s]+(\d+)[°\s]+(\d+)['\s]+([\d.]+)?["\s]*([EWew])/
    );
    if (dmsMatch) {
      const latDeg = parseFloat(dmsMatch[1]);
      const latMin = parseFloat(dmsMatch[2]);
      const latSec = dmsMatch[3] ? parseFloat(dmsMatch[3]) : 0;
      const latDir = dmsMatch[4].toUpperCase();

      const lngDeg = parseFloat(dmsMatch[5]);
      const lngMin = parseFloat(dmsMatch[6]);
      const lngSec = dmsMatch[7] ? parseFloat(dmsMatch[7]) : 0;
      const lngDir = dmsMatch[8].toUpperCase();

      let lat = latDeg + latMin / 60 + latSec / 3600;
      if (latDir === "S") lat = -lat;

      let lng = lngDeg + lngMin / 60 + lngSec / 3600;
      if (lngDir === "W") lng = -lng;

      updateLocation(lat, lng, 17);
      setStatusMessage({
        type: "success",
        text: `Converted DMS coordinates to (${lat.toFixed(6)}, ${lng.toFixed(6)})!`,
      });
      return;
    }

    // 4. Check if user pasted raw coordinates (e.g. "16.7725, 96.1612" or "16.7725 96.1612")
    const coordMatch = query.match(/(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        updateLocation(lat, lng, 17);
        setStatusMessage({
          type: "success",
          text: `Jumped to coordinates: ${lat}, ${lng}`,
        });
        return;
      }
    }

    // 3. Otherwise geocode with Nominatim
    setIsSearching(true);
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=mm&limit=1`;

      const res = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Search service unavailable");

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        updateLocation(lat, lng, 16);
        setStatusMessage({
          type: "success",
          text: `Found: ${data[0].display_name.split(",").slice(0, 3).join(",")}`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: "No matching location found in Myanmar. Try clicking on the map or pasting coordinates.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Could not perform search. Please click directly on the map or paste coordinates.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const googleMapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : null;

  return (
    <div className="space-y-3 rounded-2xl border border-sand-300 bg-sand-50/80 p-4">
      {/* Header with Title and Clear Pin */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-forest-950">
          <MapPin className="h-4 w-4 text-forest-700" aria-hidden />
          <span>Interactive Office Map Pin</span>
          <span className="rounded bg-forest-100 px-1.5 py-0.5 text-[10px] font-medium text-forest-800">
            Click map or drag pin
          </span>
        </label>

        <div className="flex items-center gap-2">
          {googleMapsUrl ? (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-forest-700 hover:text-forest-950 underline underline-offset-2"
            >
              <span>View in Google Maps</span>
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          ) : null}

          {coords ? (
            <button
              type="button"
              onClick={clearLocation}
              className="inline-flex items-center gap-1 text-xs font-medium text-soil-700 hover:text-soil-900 ml-2"
            >
              <X className="h-3.5 w-3.5" aria-hidden /> Clear pin
            </button>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-forest-700/80">
        Click anywhere on the map or click <strong>“Find My Location”</strong> to drop the pin at your
        current office building. You can also paste Google Maps coordinates or links.
      </p>

      {/* Action Toolbar: Search + Find My Location */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-forest-600/60" aria-hidden />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearch();
                }
              }}
              placeholder="Search township, paste lat,lng (16.86, 96.19) or Google Maps link…"
              className="w-full rounded-xl border border-sand-300 bg-white py-1.5 pl-9 pr-3 text-xs text-forest-950 placeholder:text-forest-600/50 focus:border-forest-700 focus:outline-none focus:ring-1 focus:ring-forest-700"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest-900 px-3.5 py-1.5 text-xs font-medium text-cream hover:bg-forest-800 disabled:opacity-50 shrink-0"
          >
            {isSearching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Navigation className="h-3.5 w-3.5" aria-hidden />
            )}
            Search
          </button>

          {/* Current Location GPS Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gold-600/40 bg-gold-50 px-3.5 py-1.5 text-xs font-semibold text-gold-950 hover:bg-gold-100 transition-colors disabled:opacity-50 shrink-0 shadow-xs"
            title="Detect GPS location of your current device"
          >
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold-800" aria-hidden />
            ) : (
              <LocateFixed className="h-3.5 w-3.5 text-gold-800" aria-hidden />
            )}
            <span>Find My Location</span>
          </button>
        </div>

        {/* Status / Feedback message */}
        {statusMessage ? (
          <div
            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
              statusMessage.type === "error"
                ? "bg-soil-100 text-soil-800"
                : statusMessage.type === "success"
                  ? "bg-forest-100 text-forest-800"
                  : "bg-sand-200 text-forest-900"
            }`}
          >
            {statusMessage.text}
          </div>
        ) : null}

        {/* Map Layer Switcher & Quick Myanmar Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-sand-200/80">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-forest-700/70">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => updateLocation(p.lat, p.lng, 15)}
                className="inline-flex items-center gap-1 rounded-full border border-sand-300 bg-white px-2.5 py-0.5 text-[11px] font-medium text-forest-900 transition-colors hover:border-forest-600 hover:bg-forest-50"
              >
                <Compass className="h-3 w-3 text-gold-600" aria-hidden />
                {p.label}
              </button>
            ))}
          </div>

          {/* Map Layer Toggle (Google Hybrid vs Google Roads vs OSM) */}
          <div className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-forest-600 mr-0.5" aria-hidden />
            <span className="text-[11px] font-medium text-forest-700/70 mr-1">Layer:</span>
            {(["google-hybrid", "google-roads", "osm"] as MapLayerType[]).map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => changeTileLayer(layer)}
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  activeLayer === layer
                    ? "bg-forest-900 text-cream"
                    : "border border-sand-300 bg-white text-forest-800 hover:bg-forest-50"
                }`}
              >
                {layer === "google-hybrid"
                  ? "Google Satellite"
                  : layer === "google-roads"
                    ? "Google Roads"
                    : "OSM"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative h-72 w-full overflow-hidden rounded-xl border border-sand-300 shadow-inner sm:h-80">
        <div ref={containerRef} className="h-full w-full z-0" />
      </div>

      {/* Lat & Lng Input Details & Hidden Form Inputs */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-semibold text-forest-800">
            Latitude (e.g. 16.866100)
          </label>
          <input
            type="number"
            step="any"
            value={coords?.lat ?? ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) {
                updateLocation(val, coords?.lng ?? DEFAULT_CENTER[1]);
              } else if (e.target.value === "") {
                clearLocation();
              }
            }}
            placeholder="e.g. 16.866100"
            className="mt-1 w-full rounded-lg border border-sand-300 bg-white px-2.5 py-1 text-xs font-mono text-forest-950 focus:border-forest-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-forest-800">
            Longitude (e.g. 96.195100)
          </label>
          <input
            type="number"
            step="any"
            value={coords?.lng ?? ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) {
                updateLocation(coords?.lat ?? DEFAULT_CENTER[0], val);
              } else if (e.target.value === "") {
                clearLocation();
              }
            }}
            placeholder="e.g. 96.195100"
            className="mt-1 w-full rounded-lg border border-sand-300 bg-white px-2.5 py-1 text-xs font-mono text-forest-950 focus:border-forest-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Form Submission inputs - picked up by FormData in saveOffice */}
      <input
        type="hidden"
        name="latitude"
        value={coords?.lat !== undefined ? String(coords.lat) : ""}
      />
      <input
        type="hidden"
        name="longitude"
        value={coords?.lng !== undefined ? String(coords.lng) : ""}
      />
    </div>
  );
}
