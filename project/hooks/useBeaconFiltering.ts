import { useMemo, useState, useCallback } from "react";
import { Beacon, Motorcycle } from "@/types";

type ZoneType = "A" | "B" | "C" | "D" | "E";

type BeaconPosition = {
  [key: string]: { 
    top: string; 
    left: string; 
    zone: ZoneType;
  }
};

export function useBeaconFiltering(
  beacons: Beacon[],
  motorcycles: Motorcycle[],
  beaconPositions: BeaconPosition,
  initialSearchQuery: string = "",
  initialZone: ZoneType | null = null
) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(initialZone);

  // Filter beacons based on criteria
  const filteredBeacons = useMemo(() => {
    let filtered = [...beacons];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((beacon) => {
        // Match beacon ID
        if (beacon.id.toLowerCase().includes(query)) {
          return true;
        }
        
        // Match motorcycle details if linked
        if (beacon.motoId) {
          const moto = motorcycles.find((m) => m.id === beacon.motoId);
          if (moto && (
            moto.model.toLowerCase().includes(query) || 
            moto.licensePlate.toLowerCase().includes(query)
          )) {
            return true;
          }
        }
        
        return false;
      });
    }

    // Filter by zone
    if (selectedZone) {
      filtered = filtered.filter((beacon) => {
        const position = beaconPositions[beacon.id];
        return position && position.zone === selectedZone;
      });
    }

    return filtered;
  }, [beacons, motorcycles, beaconPositions, searchQuery, selectedZone]);

  // Get stats about filtered beacons
  const stats = useMemo(() => {
    const totalBeacons = filteredBeacons.length;
    const activeBeacons = filteredBeacons.filter(b => b.status === "active").length;
    const linkedBeacons = filteredBeacons.filter(b => b.motoId !== null).length;

    return {
      total: totalBeacons,
      active: activeBeacons,
      inactive: totalBeacons - activeBeacons,
      linked: linkedBeacons,
    };
  }, [filteredBeacons]);

  return {
    searchQuery,
    setSearchQuery,
    selectedZone,
    setSelectedZone,
    filteredBeacons,
    stats
  };
}