// config/environment.ts
/**
 * Configuração de ambiente do projeto
 * 
 * Para usar sua API do Render:
 * 1. Substitua 'SUA_API_RENDER_URL' pela URL real da sua API
 * 2. Mude USE_RENDER_API para true
 */

export const CONFIG = {
  // URL da sua API no Render
  RENDER_API_URL: 'https://sua-api.onrender.com', // SUBSTITUA AQUI
  
  // URLs para desenvolvimento local
  LOCAL_API_ANDROID: 'http://10.0.2.2:8080',
  LOCAL_API_IOS: 'http://localhost:8080',
  
  // Flag para forçar uso da API do Render
  USE_RENDER_API: false, // Mude para true para usar sempre a API do Render
  
  // Configurações gerais
  API_TIMEOUT: 10000,
  ENABLE_LOGGING: __DEV__,
}

// Função para obter a URL da API baseada no ambiente
export function getApiUrl(): string {
  if (CONFIG.USE_RENDER_API) {
    return CONFIG.RENDER_API_URL
  }
  
  // Para desenvolvimento, usar URL apropriada para a plataforma
  const isProd = process.env.NODE_ENV === 'production'
  
  if (isProd) {
    return CONFIG.RENDER_API_URL
  }
  
  // Em desenvolvimento, usar Android emulator por padrão
  return CONFIG.LOCAL_API_ANDROID
}