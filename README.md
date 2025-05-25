# Mottooth Mobile

Sistema de gestão e rastreamento de **motos** por **beacons Bluetooth** desenvolvido para o *Challenge 2025 – FIAP / Mottu*.

> **Dica rápida:** use o aplicativo sempre no **modo escuro**; todos os layouts, cores e contrastes foram pensados para oferecer a melhor experiência (além de economizar bateria). 🌙

## Índice
1. [Visão geral](#visão-geral)  
2. [Funcionalidades](#funcionalidades)  
3. [Tecnologias e arquitetura](#tecnologias-e-arquitetura)  
4. [Estrutura de pastas](#estrutura-de-pastas)  
5. [Como executar](#como-executar)  
6. [Roadmap de ideias futuras](#roadmap-de-ideias-futuras)  
7. [Membros do projeto](#membros-do-projeto)  
8. [Créditos / licenças](#créditos--licenças)  
9. [Demonstrações](#demonstrações)  

---

## Visão geral
O **Mottooth** foi criado para otimizar a operação de pátios de motocicletas da Mottu, rastreando cada moto em tempo real por meio de beacons Bluetooth de baixo consumo.  
Com ele, o time de logística visualiza:

- Zonas do pátio (_Entrada, Manutenção, Armazenamento…_) destacadas por cor  
- A localização atual de cada moto  
- O status de bateria e força de sinal de cada beacon  
- Um histórico completo de movimentação  

Tudo isso em um app *mobile-first* (React Native + Expo Router) fácil de instalar em qualquer Android ou iOS.

## Funcionalidades
| Tela                 | Descrição rápida                                                                 |
|----------------------|----------------------------------------------------------------------------------|
| **Mapa do Pátio**    | Grid responsivo com zonas coloridas, contadores de motos/beacons e visualização em tempo real. |
| **Dashboard (Início)** | Indicadores de motos no pátio, beacons ativos, cards de resumo de zonas, listas de últimos cadastros. |
| **Gerenciar Motos**  | CRUD completo, pesquisa por modelo/placa, filtro por status, associação direta a um beacon. |
| **Gerenciar Beacons**| Listagem de beacons (ativos ou não), leitura de bateria & RSSI, edição/remoção, escaneamento contínuo. |
| **Configurações**    | Preferências de tema, idioma, notificações, histórico, limpeza de dados e menu de ajuda. |

> 🔒 **Segurança:** todas as leituras BLE são filtradas por UUID válido e armazenadas localmente de forma criptografada até sincronizar com a API.

## Tecnologias e arquitetura
| Camada      | Stack                                                                 |
|-------------|-----------------------------------------------------------------------|
| **App**     | React Native + Expo SDK 50, TypeScript 5, Expo Router, React Navigation 6 |
| **BLE**     | `react-native-ble-plx`, adaptação para background mode no Android 13+ |
| **Estado**  | Zustand, AsyncStorage (persistência offline)                          |
| **UI/UX**   | Tailwind-RN + custom theme, ícones `lucide-react-native`, animações Framer Motion |
| **Qualidade** | ESLint + Prettier, Husky + lint-staged, Jest / React-Testing-Library |
| **CI**      | GitHub Actions → EAS Build Preview em cada PR                         |

## Estrutura de pastas
```txt
app/                // rotas (Expo Router)
 └─ (tabs)/         // bottom-tabs: index, motos, beacons, ...
components/         // UI compartilhada
lib/                // hooks, serviços de BLE, helpers
store/              // Zustand slices
assets/             // ícones, fontes, imagens
```

## Como executar
```bash
# 1. clone o repo
git clone https://github.com/<usuario>/mottooth-mobile.git
cd mottooth-mobile

# 2. instale dependências
npm install
# ou
yarn

# 3. rode localmente
npx expo start   # abre o Metro e o QR Code

# 4. (opcional) rodar testes
npm test
```

> É necessário **Node >= 18** e **Expo CLI** (`npm i -g expo-cli`).  
> Para compilar nativo, configure Xcode / Android SDK ou use **EAS Build**.

## Roadmap de ideias futuras
- [ ] Heat-map de zonas mais movimentadas  
- [ ] Notificação push de bateria baixa do beacon  
- [ ] Modo offline completo com sincronização diferida  
- [ ] Exportação CSV / integração direta com ERP da Mottu  

## Membros do projeto
| Nome | RM |
|------|----|
| Arthur Ramos dos Santos | RM558798 |
| Felipe Melo de Sousa | RM556099 |
| Robert Daniel da Silva Coimbra | RM555881 |

---

Feito com dedicação por estudantes de **Análise e Desenvolvimento de Sistemas – FIAP** para o **Challenge 2025**.
