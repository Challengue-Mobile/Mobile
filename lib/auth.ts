import AsyncStorage from '@react-native-async-storage/async-storage';

export async function login(email: string, password: string) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!email || !password) {
    throw new Error('Credenciais inválidas');
  }
  
  await AsyncStorage.setItem('userToken', 'fake-token-123');
  return { token: 'fake-token-123', user: { email } };
}

export async function register(name: string, email: string, password: string) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!name || !email || !password) {
    throw new Error('Todos os campos são obrigatórios');
  }
  
  await AsyncStorage.setItem('userToken', 'fake-token-456');
  return { token: 'fake-token-456', user: { name, email } };
}

export async function logout() {
  await AsyncStorage.clear();
}

export async function getToken() {
  return await AsyncStorage.getItem('userToken');
}