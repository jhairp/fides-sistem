import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ExternalLink, Layers, Crosshair, RotateCcw } from 'lucide-react';

// Centro por defecto: La Paz, Bolivia
const DEFAULT_CENTER: [number, number] = [-16.5000, -68.1500];

// Proveedores de capas tipo Google Maps y satélite
const TILE_LAYERS = {
  google_roadmap: {
    url: 'https://mt1.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}',
    name: 'Google Calles',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  google_hybrid: {
    url: 'https://mt1.google.com/vt/lyrs=y&hl=es&x={x}&y={y}&z={z}',
    name: 'Google Satélite',
    attribution: '&copy; Google Maps Imágenes',
    maxZoom: 20,
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    name: 'OpenStreetMap',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
};

type LayerType = keyof typeof TILE_LAYERS;

// Icono personalizado para el marcador con estilo de pin FidesSystem
const createPinIcon = () => {
  return L.divIcon({
    className: 'fides-map-marker',
    html: `
      <div style="transform: translate(-50%, -100%); cursor: grab;">
        <div style="
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: white;
          border-radius: 9999px;
          padding: 7px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
          border: 2px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #1D4ED8;
          margin: -2px auto 0;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export function parseCoordinates(coordStr?: string): [number, number] | null {
  if (!coordStr || typeof coordStr !== 'string') return null;

  // Caso 1: Enlace de Google Maps con coordenadas (@lat,lng o q=lat,lng)
  const urlMatch =
    coordStr.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
    coordStr.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
    coordStr.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);

  if (urlMatch) {
    const lat = parseFloat(urlMatch[1]);
    const lng = parseFloat(urlMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  // Caso 2: Texto plano con coordenadas: "-16.5000, -68.1500" o "-16.5000 -68.1500"
  const cleaned = coordStr.replace(/[^\d.-]/g, ' ').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return [lat, lng];
    }
  }

  return null;
}

interface GoogleMapPickerProps {
  value?: string;
  onChange: (coords: string) => void;
  className?: string;
  height?: string;
}

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  value = '',
  onChange,
  className = '',
  height = 'h-64',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<LayerType>('google_roadmap');
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(() => parseCoordinates(value));
  const [isLocating, setIsLocating] = useState(false);
  const [pasteInput, setPasteInput] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);

  // Sincronizar coordenadas cuando cambie la prop externa
  useEffect(() => {
    const parsed = parseCoordinates(value);
    setCurrentCoords(parsed);

    if (mapRef.current) {
      if (parsed) {
        if (!markerRef.current) {
          const marker = L.marker(parsed, {
            icon: createPinIcon(),
            draggable: true,
          }).addTo(mapRef.current);

          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            const formatted = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
            onChange(formatted);
          });

          markerRef.current = marker;
        } else {
          markerRef.current.setLatLng(parsed);
        }
      } else if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }
  }, [value, onChange]);

  // Inicializar mapa de Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const initialPos = parseCoordinates(value) || DEFAULT_CENTER;
    const initialZoom = parseCoordinates(value) ? 16 : 14;

    const map = L.map(mapContainerRef.current, {
      center: initialPos,
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: false,
    });

    const layerConfig = TILE_LAYERS[activeLayer];
    const tileLayer = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Si ya hay coordenadas iniciales, colocar marcador
    if (initialPos && parseCoordinates(value)) {
      const marker = L.marker(initialPos, {
        icon: createPinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const formatted = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
        onChange(formatted);
      });

      markerRef.current = marker;
    }

    // Evento de clic en el mapa para posicionar el marcador
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const formatted = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onChange(formatted);

      if (!markerRef.current) {
        const marker = L.marker([lat, lng], {
          icon: createPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          const updated = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
          onChange(updated);
        });

        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
    });

    mapRef.current = map;

    // Redimensionar automáticamente tras renderizado
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(mapContainerRef.current);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Cambiar capa de mapa (Calles vs Satélite)
  const switchLayer = useCallback((layerKey: LayerType) => {
    setActiveLayer(layerKey);
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const config = TILE_LAYERS[layerKey];
    const newTileLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(mapRef.current);

    tileLayerRef.current = newTileLayer;
  }, []);

  // Centrar en ubicación del usuario (GPS del navegador)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const formatted = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        onChange(formatted);

        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 17);
          if (!markerRef.current) {
            const marker = L.marker([lat, lng], {
              icon: createPinIcon(),
              draggable: true,
            }).addTo(mapRef.current);

            marker.on('dragend', () => {
              const p = marker.getLatLng();
              onChange(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`);
            });

            markerRef.current = marker;
          } else {
            markerRef.current.setLatLng([lat, lng]);
          }
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn('Error al obtener geolocalización:', err);
        setIsLocating(false);
        alert('No se pudo obtener la ubicación actual. Asegúrate de otorgar permisos.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Centrar en La Paz
  const handleResetToLaPaz = () => {
    if (mapRef.current) {
      mapRef.current.setView(DEFAULT_CENTER, 14);
    }
  };

  // Aplicar enlace o texto pegado desde Google Maps
  const handleApplyPasted = () => {
    const parsed = parseCoordinates(pasteInput);
    if (parsed) {
      const formatted = `${parsed[0].toFixed(6)}, ${parsed[1].toFixed(6)}`;
      onChange(formatted);
      if (mapRef.current) {
        mapRef.current.setView(parsed, 17);
      }
      setShowPasteModal(false);
      setPasteInput('');
    } else {
      alert('No se pudieron extraer coordenadas válidas del texto pegado.');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Barra de herramientas superior del mapa */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
        {/* Selector de capas: Calles / Satélite */}
        <div className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-[10px] font-bold uppercase text-slate-500 mr-1 hidden sm:inline">Modo:</span>
          <button
            type="button"
            onClick={() => switchLayer('google_roadmap')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeLayer === 'google_roadmap'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Google Mapa
          </button>
          <button
            type="button"
            onClick={() => switchLayer('google_hybrid')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeLayer === 'google_hybrid'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Satélite
          </button>
        </div>

        {/* Acciones auxiliares */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            title="Usar mi ubicación GPS actual"
            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer"
          >
            <Navigation className={`w-3 h-3 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>Mi Ubicación</span>
          </button>

          <button
            type="button"
            onClick={handleResetToLaPaz}
            title="Centrar mapa en La Paz"
            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span className="hidden sm:inline">La Paz</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPasteModal(!showPasteModal)}
            title="Pegar enlace o coordenadas de Google Maps"
            className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer"
          >
            <Crosshair className="w-3 h-3 text-blue-600" />
            <span>Pegar Coords</span>
          </button>

          {currentCoords && (
            <a
              href={`https://www.google.com/maps?q=${currentCoords[0]},${currentCoords[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir este punto en Google Maps oficial"
              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-[10px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-emerald-600" />
              <span className="hidden md:inline">Google Maps</span>
            </a>
          )}
        </div>
      </div>

      {/* Input modal desplegable para pegar link o coordenadas */}
      {showPasteModal && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 space-y-2 animate-fadeIn">
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
            Pega aquí el enlace de Google Maps o las coordenadas (ej. -16.4965, -68.1328):
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder="https://maps.google.com/... o -16.5000, -68.1500"
              className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleApplyPasted}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase cursor-pointer"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={() => setShowPasteModal(false)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold uppercase cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Contenedor del Mapa interactivo */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-200 dark:border-slate-700 shadow-inner">
        <div ref={mapContainerRef} className={`w-full ${height} z-0`} />

        {/* Indicador de ayuda superpuesto */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold uppercase flex items-center gap-1.5 shadow-md">
            <MapPin className="w-3 h-3 text-blue-400" />
            <span>Haz clic o arrastra el pin para fijar las coordenadas</span>
          </div>
        </div>

        {/* Badge con coordenadas actuales */}
        {currentCoords && (
          <div className="absolute top-2 right-2 z-10">
            <div className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-800 dark:text-slate-100 text-[10px] font-bold border border-blue-100 dark:border-slate-700 shadow-md">
              GPS: {currentCoords[0].toFixed(6)}, {currentCoords[1].toFixed(6)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
