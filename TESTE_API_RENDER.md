# 🔗 Configuração da API do Render

## ✅ Configuração Aplicada

A API **https://mottooth-java.onrender.com** foi configurada com sucesso no projeto!

### 📋 Mudanças Realizadas:

1. **Arquivo:** `config/environment.ts`
   - ✅ `RENDER_API_URL`: `'https://mottooth-java.onrender.com'`
   - ✅ `USE_RENDER_API`: `true`

## 🚀 Como Testar

### **URL do Aplicativo:**
- **Web:** http://localhost:8081

### **Sistema Híbrido:**
O app agora funciona com um sistema híbrido:

1. **Primeira tentativa:** API do Render (`https://mottooth-java.onrender.com`)
2. **Fallback automático:** Sistema offline com AsyncStorage
3. **Login de teste:** `test@test.com` / `123456` (para demonstração offline)

### **Testando Login/Cadastro:**

#### 🌐 **Com API Online:**
- Tente fazer login com credenciais reais da sua API
- O app vai tentar conectar em `https://mottooth-java.onrender.com/api/auth/login`
- Se funcionar, você estará logado via API

#### 📱 **Modo Offline (Fallback):**
- Se a API não estiver disponível, o app automaticamente:
  - Usa o sistema de AsyncStorage local
  - Permite login com `test@test.com` / `123456`
  - Salva novos usuários localmente

### **Endpoints da API:**
Baseado na URL fornecida, o app está configurado para:

- **Login:** `POST https://mottooth-java.onrender.com/api/auth/login`
- **Registro:** `POST https://mottooth-java.onrender.com/api/auth/register`
- **Logout:** `POST https://mottooth-java.onrender.com/api/auth/logout`
- **Beacons:** `https://mottooth-java.onrender.com/api/beacons`
- **Motos:** `https://mottooth-java.onrender.com/api/motos`

### **Console do Navegador:**
Abra as **Ferramentas do Desenvolvedor (F12)** e veja o console para:
- ✅ `🌐 Usando API_URL: https://mottooth-java.onrender.com`
- 📡 Logs de requisições para a API
- ⚠️ Avisos de fallback offline se a API não responder

## 🔧 Configuração Flexível

Para voltar ao modo de desenvolvimento local, edite `config/environment.ts`:

```typescript
export const CONFIG = {
  // Para usar API do Render
  USE_RENDER_API: true,  // ← API do Render
  
  // Para usar desenvolvimento local
  USE_RENDER_API: false, // ← Desenvolvimento local
}
```

## 🎯 Status Atual

- ✅ **API configurada:** https://mottooth-java.onrender.com
- ✅ **Sistema híbrido ativo:** API + Fallback offline
- ✅ **Projeto rodando:** http://localhost:8081
- ✅ **Login/Cadastro corrigidos:** Usando contexto de autenticação
- ✅ **Demonstração garantida:** Funciona com ou sem API

---

**🚀 Pronto para testar!** O app agora está conectado à sua API do Render e tem fallback offline para garantir funcionamento 100% do tempo.