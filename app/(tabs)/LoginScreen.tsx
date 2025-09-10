import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { signIn, resetPassword } = useAuth();
  const { setValue, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(loginSchema) });
  const [errMsg, setErrMsg] = useState("");

  const onSubmit = async (data: FormData) => {
    setErrMsg("");
    try {
      await signIn(data.email, data.password);
      // navegação pós-login: ex.: navigation.replace("Home") se quiser
    } catch (e: any) {
      setErrMsg(mapFirebaseError(e));
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>Entrar</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(t) => setValue("email", t, { shouldValidate: true })}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />
      {!!errors.email && <Text style={{ color: "red" }}>{errors.email.message}</Text>}

      <TextInput
        placeholder="Senha"
        secureTextEntry
        onChangeText={(t) => setValue("password", t, { shouldValidate: true })}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />
      {!!errors.password && <Text style={{ color: "red" }}>{errors.password.message}</Text>}

      {!!errMsg && <Text style={{ color: "red" }}>{errMsg}</Text>}

      <TouchableOpacity
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        style={{ backgroundColor: "#0ea5e9", padding: 14, borderRadius: 10, alignItems: "center" }}
      >
        {isSubmitting ? <ActivityIndicator /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={{ textAlign: "center", marginTop: 12 }}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => resetPasswordPrompt(resetPassword)}>
        <Text style={{ color: "#0ea5e9", textAlign: "center", marginTop: 8 }}>Esqueci minha senha</Text>
      </TouchableOpacity>
    </View>
  );
}

function resetPasswordPrompt(resetPassword: (email: string) => Promise<void>) {
  Alert.prompt?.(
    "Recuperar senha",
    "Digite seu email",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Enviar",
        onPress: async (email) => {
          if (!email) return;
          try {
            await resetPassword(email);
            Alert.alert("Pronto!", "Enviamos o link de redefinição.");
          } catch {
            Alert.alert("Erro", "Não foi possível enviar o email.");
          }
        },
      },
    ],
    "plain-text"
  );
}

function mapFirebaseError(e: any) {
  const code = e?.code || "";
  if (code.includes("auth/invalid-email")) return "Email inválido.";
  if (code.includes("auth/user-not-found")) return "Usuário não encontrado.";
  if (code.includes("auth/wrong-password")) return "Senha incorreta.";
  if (code.includes("auth/too-many-requests")) return "Muitas tentativas. Tente mais tarde.";
  return "Não foi possível entrar.";
}