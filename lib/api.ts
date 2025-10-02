// lib/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getApiUrl, CONFIG } from '../config/environment'

/**
 * URL da API configurada automaticamente baseada no ambiente
 */
const API_URL = getApiUrl()

console.log("🌐 Usando API_URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: CONFIG.API_TIMEOUT,
});

// Interceptor de requisição: injeta token Bearer
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta: trata 401 e erros de rede
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem("authToken");
    }
    return Promise.reject(error);
  }
);

export default api;
