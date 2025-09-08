import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from '../contexts/AuthContext';

// Corrigir o schema para incluir name
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type FormData = z.infer<typeof registerSchema>; // usar registerSchema, não schema

export default function RegisterScreen({ navigation }: any) {
  const { register: registerUser } = useAuth(); // usar useAuth(), não useContext
  const { setValue, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(registerSchema) }); // usar registerSchema
  const [errMsg, setErrMsg] = useState("");

  const onSubmit = async (data: FormData) => {
    setErrMsg("");
    try {
      // Se seu register só aceita email e password, ignore o name por enquanto
      await registerUser(data.email, data.password);
      Alert.alert("Sucesso", "Cadastro realizado! Faça login.");
      navigation.replace("Login");
    } catch (e: any) {
      setErrMsg(mapFirebaseError(e));
    }
  };
  return (
    <View style={{ flex:1, justifyContent:"center", padding:20, gap:12 }}>
      <Text style={{ fontSize:24, fontWeight:"700", marginBottom:8 }}>Criar conta</Text>

      <TextInput placeholder="Nome" onChangeText={(t)=>setValue("name", t)}
        style={{ borderWidth:1, borderRadius:8, padding:12 }}/>
      {!!errors.name && <Text style={{ color:"red" }}>{errors.name.message}</Text>}

      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        onChangeText={(t)=>setValue("email", t)} style={{ borderWidth:1, borderRadius:8, padding:12 }}/>
      {!!errors.email && <Text style={{ color:"red" }}>{errors.email.message}</Text>}

      <TextInput placeholder="Senha" secureTextEntry
        onChangeText={(t)=>setValue("password", t)} style={{ borderWidth:1, borderRadius:8, padding:12 }}/>
      {!!errors.password && <Text style={{ color:"red" }}>{errors.password.message}</Text>}

      {!!errMsg && <Text style={{ color:"red" }}>{errMsg}</Text>}

      <TouchableOpacity disabled={isSubmitting} onPress={handleSubmit(onSubmit)}
        style={{ backgroundColor:"#22c55e", padding:14, borderRadius:10, alignItems:"center" }}>
        {isSubmitting ? <ActivityIndicator/> : <Text style={{ color:"#fff", fontWeight:"700" }}>Cadastrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={()=>navigation.replace("Login")}>
        <Text style={{ textAlign:"center", marginTop:12 }}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

function mapFirebaseError(e:any){
  const code = e?.code || "";
  if (code.includes("auth/email-already-in-use")) return "Email já cadastrado.";
  if (code.includes("auth/invalid-email")) return "Email inválido.";
  if (code.includes("auth/weak-password")) return "Senha muito fraca (mínimo 6).";
  return "Erro ao cadastrar.";
}
