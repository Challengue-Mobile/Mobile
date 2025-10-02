// lib/motoService.ts
import api from "./api";

export interface Moto {
  id?: number;
  placa: string;
  modelo: string;
  // adicione outros campos conforme seu DTO
}

export async function getMotos(page = 0, size = 10) {
  try {
    const res = await api.get("/api/motos", { params: { page, size } });
    return res.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Erro ao listar motos");
  }
}

export async function getMotoById(id: number) {
  try {
    const res = await api.get(`/api/motos/${id}`);
    return res.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Erro ao buscar moto");
  }
}

export async function createMoto(moto: Omit<Moto, "id">) {
  try {
    const res = await api.post("/api/motos", moto);
    return res.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Erro ao criar moto");
  }
}

export async function updateMoto(id: number, moto: Partial<Moto>) {
  try {
    const res = await api.put(`/api/motos/${id}`, moto);
    return res.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Erro ao atualizar moto");
  }
}

export async function deleteMoto(id: number) {
  try {
    await api.delete(`/api/motos/${id}`);
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || "Erro ao deletar moto");
  }
}
