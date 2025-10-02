import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { logError } from '../../lib/errorHandler';
import { useTheme } from '../contexts/ThemeContext';

export default function Register() {
  const router = useRouter();
  const { theme } = useTheme();
  const { register: registerUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setGeneralError('Todos os campos são obrigatórios');
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      await registerUser(email, password);
      
      // Limpar campos após sucesso
      setName('');
      setEmail('');
      setPassword('');
      
      // Mostrar feedback de sucesso
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      
      router.replace('/(tabs)');
    } catch (error) {
      logError('RegisterScreen - Register', error);
      setGeneralError(error instanceof Error ? error.message : 'Erro ao fazer cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Cadastro</Text>
        
        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.gray[100],
                borderColor: theme.colors.gray[300],
                color: theme.colors.text
              }
            ]}
            placeholder="Nome"
            placeholderTextColor={theme.colors.gray[500]}
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.gray[100],
                borderColor: theme.colors.gray[300],
                color: theme.colors.text
              }
            ]}
            placeholder="Email"
            placeholderTextColor={theme.colors.gray[500]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.gray[100],
                borderColor: theme.colors.gray[300],
                color: theme.colors.text
              }
            ]}
            placeholder="Senha"
            placeholderTextColor={theme.colors.gray[500]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity 
            style={[
              styles.button,
              { backgroundColor: theme.colors.primary[500] },
              loading && styles.buttonDisabled
            ]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.white }]}>Cadastrar</Text>
            )}
          </TouchableOpacity>
          
          {generalError ? <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>{generalError}</Text> : null}
        </View>
        
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={[styles.loginText, { color: theme.colors.gray[500] }]}>Já tem conta? Faça login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 48,
  },
  loginText: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});