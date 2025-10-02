import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { login } from '../../lib/auth';
import { logError } from '../../lib/errorHandler';
import { useTheme } from '../contexts/ThemeContext';

export default function Login() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // TODO: melhorar regex de email depois
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setLoading(true);
      setGeneralError('');
      
      try {
        const result = await login(email, password);
        console.log('Login ok:', result);
        
        // Limpar campos após sucesso
        setEmail('');
        setPassword('');
        
        // Mostrar feedback de sucesso
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        
        router.replace('/(tabs)');
      } catch (err: any) {
        logError('LoginScreen - Login', err);
        setGeneralError(err.message || 'Erro ao fazer login. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Mottooth</Text>
        
        <View style={styles.form}>
          <View>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.gray[100], 
                  borderColor: theme.colors.gray[300],
                  color: theme.colors.text 
                },
                errors.email && { borderColor: theme.colors.error[500] }
              ]}
              placeholder="Email"
              placeholderTextColor={theme.colors.gray[500]}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
            />
            {errors.email ? <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>{errors.email}</Text> : null}
          </View>
          
          <View>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.gray[100], 
                  borderColor: theme.colors.gray[300],
                  color: theme.colors.text 
                },
                errors.password && { borderColor: theme.colors.error[500] }
              ]}
              placeholder="Senha"
              placeholderTextColor={theme.colors.gray[500]}
              secureTextEntry
              value={password}
              onChangeText={handlePasswordChange}
            />
            {errors.password ? <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>{errors.password}</Text> : null}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: theme.colors.primary[500] },
              loading && styles.buttonDisabled
            ]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.white }]}>Entrar</Text>
            )}
          </TouchableOpacity>
          
          {generalError ? <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>{generalError}</Text> : null}
        </View>
        
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={[styles.signupText, { color: theme.colors.gray[500] }]}>Não tem conta? Cadastre-se</Text>
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
  signupText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});