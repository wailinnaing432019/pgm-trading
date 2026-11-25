"use client";

import dynamic from "next/dynamic";
import { Loader2, MapPin } from "lucide-react";

interface MapPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
}

const DynamicMapPicker = dynamic(() => import("./map-picker-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full flex-col items-center justify-center rounded-2xl border border-sand-300 bg-sand-50/50 p-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
        <MapPin className="h-5 w-5" aria-hidden />
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-forest-800">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-forest-600" />
        Loading interactive map…
      </div>
    </div>
  ),
});

export function MapPicker(props: MapPickerProps) {
  return <DynamicMapPicker {...props} />;
}

