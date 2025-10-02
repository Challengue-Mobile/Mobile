export function handleApiError(error: any): string {
  if (error.response) {
    // Erro da API
    return error.response.data.message || 'Erro no servidor';
  } else if (error.request) {
    // Sem resposta
    return 'Sem conexão com o servidor';
  } else {
    // Outro erro
    return error.message || 'Erro desconhecido';
  }
}

export function showUserFriendlyError(error: any): string {
  const message = handleApiError(error);
  
  // Mapear erros comuns para mensagens mais amigáveis
  if (message.includes('Network Error') || message.includes('timeout')) {
    return 'Problema de conexão. Verifique sua internet.';
  }
  
  if (message.includes('401') || message.includes('Unauthorized')) {
    return 'Sessão expirada. Faça login novamente.';
  }
  
  if (message.includes('403') || message.includes('Forbidden')) {
    return 'Você não tem permissão para esta ação.';
  }
  
  if (message.includes('404') || message.includes('Not Found')) {
    return 'Item não encontrado.';
  }
  
  if (message.includes('500') || message.includes('Internal Server Error')) {
    return 'Erro interno do servidor. Tente novamente mais tarde.';
  }
  
  return message;
}

export function logError(context: string, error: any) {
  console.error(`[${context}] Erro:`, error);
  
  // Em produção, você poderia enviar para um serviço de monitoramento
  // como Sentry, Bugsnag, etc.
  if (__DEV__) {
    console.warn(`Contexto: ${context}`);
    console.warn('Stack trace:', error.stack);
  }
}