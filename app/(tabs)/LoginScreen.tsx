// app/(tabs)/LoginScreen.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]   = useState<{username?: string; password?: string}>({});
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrors({});
    setError("");

    // Validações manuais
    const v: typeof errors = {};
    if (!username.trim()) v.username = "Usuário é obrigatório";
    else if (username.trim().length < 3) v.username = "Usuário deve ter no mínimo 3 caracteres";

    if (!password) v.password = "Senha é obrigatória";
    else if (password.length < 6) v.password = "Senha deve ter no mínimo 6 caracteres";

    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setLoading(true);
    try {
      await signIn(username, password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Mottooth</Text>

        <View style={styles.field}>
          <TextInput
            style={[styles.input, errors.username && styles.inputError]}
            placeholder="Usuário"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          {!!errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
        </View>

        <View style={styles.field}>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Senha"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {!!error && <Text style={styles.errorTextCenter}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.5 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a0a" },
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { color: "#fff", fontSize: 32, fontWeight: "800", marginBottom: 32, textAlign: "center" },
  field: { marginBottom: 16 },
  input: {
    backgroundColor: "#111827",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
  },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", marginTop: 6, fontSize: 12 },
  errorTextCenter: { color: "#ef4444", textAlign: "center", marginBottom: 8 },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
