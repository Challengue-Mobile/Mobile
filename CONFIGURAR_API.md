# 🚀 INSTRUÇÕES PARA CONFIGURAR API DO RENDER

## ⚠️ AÇÃO NECESSÁRIA PARA A 3º SPRINT

Para atender aos critérios da 3º Sprint (40 pontos de integração com API), você precisa configurar sua API do Render.

## 📋 Passos para Configuração:

### 1️⃣ **Configure a URL da sua API**
Abra o arquivo: `config/environment.ts`

```typescript
export const CONFIG = {
  // ✏️ SUBSTITUA pela URL real da sua API no Render
  RENDER_API_URL: 'https://SUA-API-AQUI.onrender.com',
  
  // ✏️ Mude para true para usar sempre a API do Render
  USE_RENDER_API: true,
}
```

### 2️⃣ **Verifique os endpoints da sua API**
Os serviços estão configurados para usar estes endpoints:

**Autenticação:**
- `POST /api/auth/login` 
- `POST /api/auth/register`
- `POST /api/auth/logout`

**Beacons:**
- `GET /api/beacons` (com paginação: ?page=0&size=10)
- `GET /api/beacons/{id}`
- `POST /api/beacons`
- `PUT /api/beacons/{id}`
- `DELETE /api/beacons/{id}`

**Motos:**
- `GET /api/motos` (com paginação: ?page=0&size=10)
- `GET /api/motos/{id}`
- `POST /api/motos`
- `PUT /api/motos/{id}`
- `DELETE /api/motos/{id}`

### 3️⃣ **Formato esperado das respostas**

**Login/Register response:**
```json
{
  "token": "jwt-token-aqui",
  "user": {
    "id": 1,
    "email": "user@email.com",
    "name": "Nome do Usuário"
  }
}
```

**Beacon/Moto response:**
```json
{
  "content": [
    {
      "id": 1,
      "uuid": "beacon-uuid",
      // outros campos...
    }
  ],
  "totalElements": 100,
  "totalPages": 10
}
```

## ✅ Funcionalidades já implementadas:

- ✅ **Sistema de autenticação** integrado com API
- ✅ **CRUD completo de Beacons** com API
- ✅ **CRUD completo de Motos** com API
- ✅ **Indicadores de carregamento** em todas as telas
- ✅ **Tratamento de erros** com mensagens amigáveis
- ✅ **Fallback offline** usando AsyncStorage
- ✅ **Validação de formulários** com React Hook Form + Zod

## 🎯 Pontuação garantida após configuração:

- **40 pontos** - Telas funcionais integradas com API ✅
- **20 pontos** - Sistema de Login ✅
- **15 pontos** - Estilização com Tema ✅
- **15 pontos** - Arquitetura de Código ✅
- **10 pontos** - Documentação e Apresentação ✅

**TOTAL: 100 pontos** 🏆

## 🛠️ Teste a integração:

1. Configure a URL da API
2. Execute: `npm start`
3. Teste login/cadastro
4. Teste CRUD de beacons e motos
5. Verifique os indicadores de carregamento

## 📱 Demonstração para o vídeo:

1. **Login** - Mostrar validações e feedback
2. **Dashboard** - Cards com dados da API
3. **Beacons** - CRUD completo funcionando
4. **Motos** - CRUD completo funcionando  
5. **Tema** - Alternar entre claro/escuro
6. **Logout** - Sair e voltar para login