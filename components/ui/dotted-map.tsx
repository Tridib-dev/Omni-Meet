import * as React from "react"
import { createMap } from "svg-dotted-map"

import { cn } from "@/lib/utils"

export interface Marker {
  lat: number
  lng: number
  size?: number
  pulse?: boolean
}

/** addMarkers returns markers with lat/lng removed; only x, y and other props (e.g. size) remain */
type MapMarker<M extends Marker> = Omit<M, "lat" | "lng"> & {
  x: number
  y: number
}

export interface DottedMapProps<
  M extends Marker = Marker,
> extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  mapSamples?: number
  markers?: M[]
  dotColor?: string
  markerColor?: string
  dotRadius?: number
  stagger?: boolean
  pulse?: boolean

  renderMarkerOverlay?: (args: {
    marker: MapMarker<M>
    index: number
    x: number
    y: number
    r: number
  }) => React.ReactNode
}
export function DottedMap<M extends Marker = Marker>({
  width = 520,
  height = 260,
  mapSamples = 4800,
  markers = [],
  dotColor = "#e2e8f0",
  markerColor = "#67e8f9",
  dotRadius = 1.1,           // Bigger dots
  stagger = true,
  pulse = true,
  className,
  style,
  ...svgProps
}: DottedMapProps<M>) {
  const { points, addMarkers } = createMap({
    width,
    height,
    mapSamples,
  });
  const processedMarkers = addMarkers(markers);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-slate-200", className)}
      style={{ width: "100%", height: "100%", ...style }}
      {...svgProps}
    >
      {/* Bigger, whiter dots */}
      {points.map((point: any, index: number) => {
        const rowIndex = Math.floor(point.y / 5); // simple row calculation
        const offsetX = stagger && rowIndex % 2 === 1 ? 1.2 : 0;
        return (
          <circle
            cx={point.x + offsetX}
            cy={point.y}
            r={dotRadius}
            fill={dotColor}
            opacity={0.85 + Math.random() * 0.15}
            key={index}
          />
        );
      })}

      {/* Markers */}
      {processedMarkers.map((marker: any, index: number) => {
        const x = marker.x;
        const y = marker.y;
        const r = marker.size ?? dotRadius * 10.5;
        const shouldPulse = pulse && marker.pulse !== false;

        return (
          <g key={index}>
            <circle cx={x} cy={y} r={r} fill={markerColor} />
            {shouldPulse && (
              <g pointerEvents="none">
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill="none"
                  stroke={markerColor}
                  strokeOpacity="0.7"
                  strokeWidth="1.2"
                >
                  <animate attributeName="r" values={`${r};${r * 3.5}`} dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0" dur="1.6s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}