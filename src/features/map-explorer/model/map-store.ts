'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { ProvinceId } from '@/entities/province';

interface MapState {
  readonly selectedId: ProvinceId | null;
  readonly hoveredId: ProvinceId | null;
  readonly select: (id: ProvinceId | null) => void;
  readonly hover: (id: ProvinceId | null) => void;
}

/**
 * Client-side UI state for the map. Kept in a store (not component state) so
 * other features — a future game HUD, a 3D scene, analytics — can subscribe
 * to selection changes without prop drilling.
 */
export const useMapStore = create<MapState>()(
  subscribeWithSelector((set) => ({
    selectedId: null,
    hoveredId: null,
    select: (id) => {
      set({ selectedId: id });
    },
    hover: (id) => {
      set({ hoveredId: id });
    },
  })),
);
