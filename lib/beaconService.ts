// lib/beaconService.ts
import api from "./api";

export interface Beacon {
  id?: number;
  uuid: string;
  // adicione outros campos conforme seu DTO
}

export async function getBeacons(page = 0, size = 10) {
  try {
    const res = await api.get("/api/beacons", { params: { page, size } });
    return res.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Erro ao listar beacons");
  }
}

export async function getBeaconById(id: number) {
  try {
    const res = await api.get(`/api/beacons/${id}`);
    return res.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Erro ao buscar beacon");
  }
}

export async function createBeacon(beacon: Omit<Beacon, "id">) {
  try {
    const res = await api.post("/api/beacons", beacon);
    return res.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Erro ao criar beacon");
  }
}

export async function updateBeacon(id: number, beacon: Partial<Beacon>) {
  try {
    const res = await api.put(`/api/beacons/${id}`, beacon);
    return res.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Erro ao atualizar beacon");
  }
}

export async function deleteBeacon(id: number) {
  try {
    await api.delete(`/api/beacons/${id}`);
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Erro ao deletar beacon");
  }
}
