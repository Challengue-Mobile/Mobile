"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useSettings, type LanguageCode } from "@/hooks/useSettings"

// Definindo os tipos para as traduções
type TranslationsType = {
  [key: string]: {
    [key in LanguageCode]: string
  }
}

// Traduções do aplicativo
const translations: TranslationsType = {
  // Tabs
  "tab.home": {
    "pt-BR": "Início",
    "en-US": "Home",
  },
  "tab.mapping": {
    "pt-BR": "Mapeamento",
    "en-US": "Mapping",
  },
  "tab.motorcycles": {
    "pt-BR": "Motos",
    "en-US": "Motorcycles",
  },
  "tab.beacons": {
    "pt-BR": "Beacons",
    "en-US": "Beacons",
  },
  "tab.settings": {
    "pt-BR": "Configurações",
    "en-US": "Settings",
  },

  // Home Screen
  "home.title": {
    "pt-BR": "Sistema de Gestão",
    "en-US": "Management System",
  },
  "home.subtitle": {
    "pt-BR": "Pátio de Motos",
    "en-US": "Motorcycle Yard",
  },
  "home.motorcyclesInYard": {
    "pt-BR": "Motos no Pátio",
    "en-US": "Motorcycles in Yard",
  },
  "home.activeBeacons": {
    "pt-BR": "Beacons Ativos",
    "en-US": "Active Beacons",
  },
  "home.recentMotorcycles": {
    "pt-BR": "Motos Recentes",
    "en-US": "Recent Motorcycles",
  },
  "home.recentBeacons": {
    "pt-BR": "Beacons Recentes",
    "en-US": "Recent Beacons",
  },
  "home.viewAll": {
    "pt-BR": "Ver todos",
    "en-US": "View all",
  },

  // Mapping Screen
  "mapping.title": {
    "pt-BR": "Mapeamento do Pátio",
    "en-US": "Yard Mapping",
  },
  "mapping.beaconInfo": {
    "pt-BR": "Informações dos Beacons",
    "en-US": "Beacon Information",
  },
  "mapping.searchPlaceholder": {
    "pt-BR": "Buscar beacons ou motos",
    "en-US": "Search beacons or motorcycles",
  },
  "mapping.allZones": {
    "pt-BR": "Todas as Zonas",
    "en-US": "All Zones",
  },
  "mapping.zone": {
    "pt-BR": "Zona",
    "en-US": "Zone",
  },
  "mapping.coordinates": {
    "pt-BR": "Coordenadas",
    "en-US": "Coordinates",
  },
  "mapping.linkedMoto": {
    "pt-BR": "Moto Vinculada",
    "en-US": "Linked Motorcycle",
  },
  "mapping.recentActivity": {
    "pt-BR": "Atividade Recente",
    "en-US": "Recent Activity",
  },
  "mapping.hideInfo": {
    "pt-BR": "Ocultar Informações",
    "en-US": "Hide Information",
  },
  "mapping.showInfo": {
    "pt-BR": "Mostrar Informações",
    "en-US": "Show Information",
  },
  "mapping.zones.entrance": {
    "pt-BR": "Entrada",
    "en-US": "Entrance",
  },
  "mapping.zones.maintenance": {
    "pt-BR": "Manutenção",
    "en-US": "Maintenance",
  },
  "mapping.zones.storage": {
    "pt-BR": "Armazenamento",
    "en-US": "Storage",
  },
  "mapping.zones.exit": {
    "pt-BR": "Saída",
    "en-US": "Exit",
  },
  "mapping.zones.parking": {
    "pt-BR": "Estacionamento",
    "en-US": "Parking",
  },
  "mapping.views.normal": {
    "pt-BR": "Visão Normal",
    "en-US": "Normal View",
  },
  "mapping.views.zones": {
    "pt-BR": "Visão de Zonas",
    "en-US": "Zones View",
  },
  "mapping.views.heatmap": {
    "pt-BR": "Mapa de Calor",
    "en-US": "Heat Map",
  },
  "mapping.legend.active": {
    "pt-BR": "Beacon Ativo",
    "en-US": "Active Beacon",
  },
  "mapping.legend.inactive": {
    "pt-BR": "Beacon Inativo",
    "en-US": "Inactive Beacon",
  },
  "mapping.legend.selected": {
    "pt-BR": "Selecionado",
    "en-US": "Selected",
  },

  // Motorcycles Screen
  "motorcycles.title": {
    "pt-BR": "Gerenciar Motos",
    "en-US": "Manage Motorcycles",
  },
  "motorcycles.searchPlaceholder": {
    "pt-BR": "Pesquisar por modelo ou placa",
    "en-US": "Search by model or license plate",
  },
  "motorcycles.empty": {
    "pt-BR": "Nenhuma moto encontrada",
    "en-US": "No motorcycles found",
  },
  "motorcycles.add": {
    "pt-BR": "Adicionar moto",
    "en-US": "Add motorcycle",
  },
  "motorcycles.edit": {
    "pt-BR": "Editar Moto",
    "en-US": "Edit Motorcycle",
  },
  "motorcycles.new": {
    "pt-BR": "Adicionar Moto",
    "en-US": "Add Motorcycle",
  },
  "motorcycles.model": {
    "pt-BR": "Modelo",
    "en-US": "Model",
  },
  "motorcycles.licensePlate": {
    "pt-BR": "Placa",
    "en-US": "License Plate",
  },
  "motorcycles.year": {
    "pt-BR": "Ano",
    "en-US": "Year",
  },
  "motorcycles.color": {
    "pt-BR": "Cor",
    "en-US": "Color",
  },
  "motorcycles.status": {
    "pt-BR": "Status",
    "en-US": "Status",
  },
  "motorcycles.status.inYard": {
    "pt-BR": "No Pátio",
    "en-US": "In Yard",
  },
  "motorcycles.status.out": {
    "pt-BR": "Fora",
    "en-US": "Out",
  },
  "motorcycles.status.maintenance": {
    "pt-BR": "Manutenção",
    "en-US": "Maintenance",
  },
  "motorcycles.beacon": {
    "pt-BR": "Beacon",
    "en-US": "Beacon",
  },
  "motorcycles.noBeacon": {
    "pt-BR": "Não vinculado",
    "en-US": "Not linked",
  },
  "motorcycles.noBeaconsAvailable": {
    "pt-BR": "Não há beacons disponíveis",
    "en-US": "No beacons available",
  },

  // Beacons Screen
  "beacons.title": {
    "pt-BR": "Gerenciar Beacons",
    "en-US": "Manage Beacons",
  },
  "beacons.showAll": {
    "pt-BR": "Mostrar todos os beacons",
    "en-US": "Show all beacons",
  },
  "beacons.scan": {
    "pt-BR": "Escanear",
    "en-US": "Scan",
  },
  "beacons.scanning": {
    "pt-BR": "Escaneando...",
    "en-US": "Scanning...",
  },
  "beacons.empty": {
    "pt-BR": "Nenhum beacon encontrado",
    "en-US": "No beacons found",
  },
  "beacons.add": {
    "pt-BR": "Adicionar beacon",
    "en-US": "Add beacon",
  },
  "beacons.edit": {
    "pt-BR": "Editar Beacon",
    "en-US": "Edit Beacon",
  },
  "beacons.new": {
    "pt-BR": "Adicionar Beacon",
    "en-US": "Add Beacon",
  },
  "beacons.id": {
    "pt-BR": "ID do Beacon",
    "en-US": "Beacon ID",
  },
  "beacons.status": {
    "pt-BR": "Status",
    "en-US": "Status",
  },
  "beacons.status.active": {
    "pt-BR": "Ativo",
    "en-US": "Active",
  },
  "beacons.status.inactive": {
    "pt-BR": "Inativo",
    "en-US": "Inactive",
  },
  "beacons.status.offline": {
    "pt-BR": "Offline",
    "en-US": "Offline",
  },
  "beacons.batteryLevel": {
    "pt-BR": "Nível de Bateria (%)",
    "en-US": "Battery Level (%)",
  },
  "beacons.signalStrength": {
    "pt-BR": "Força do Sinal (%)",
    "en-US": "Signal Strength (%)",
  },
  "beacons.linkToMotorcycle": {
    "pt-BR": "Vincular à Moto",
    "en-US": "Link to Motorcycle",
  },
  "beacons.none": {
    "pt-BR": "Nenhuma",
    "en-US": "None",
  },
  "beacons.noMotorcyclesAvailable": {
    "pt-BR": "Não há motos disponíveis",
    "en-US": "No motorcycles available",
  },

  // Settings Screen
  "settings.title": {
    "pt-BR": "Configurações",
    "en-US": "Settings",
  },
  "settings.loading": {
    "pt-BR": "Carregando configurações...",
    "en-US": "Loading settings...",
  },
  "settings.preferences": {
    "pt-BR": "Preferências",
    "en-US": "Preferences",
  },
  "settings.darkMode": {
    "pt-BR": "Modo Escuro",
    "en-US": "Dark Mode",
  },
  "settings.notifications": {
    "pt-BR": "Notificações",
    "en-US": "Notifications",
  },
  "settings.language": {
    "pt-BR": "Idioma",
    "en-US": "Language",
  },
  "settings.language.ptBR": {
    "pt-BR": "Português (Brasil)",
    "en-US": "Portuguese (Brazil)",
  },
  "settings.language.enUS": {
    "pt-BR": "Inglês (EUA)",
    "en-US": "English (US)",
  },
  "settings.beaconSettings": {
    "pt-BR": "Configurações do Beacon",
    "en-US": "Beacon Settings",
  },
  "settings.autoScan": {
    "pt-BR": "Escanear Automaticamente",
    "en-US": "Auto Scan",
  },
  "settings.saveHistory": {
    "pt-BR": "Salvar Histórico",
    "en-US": "Save History",
  },
  "settings.data": {
    "pt-BR": "Dados",
    "en-US": "Data",
  },
  "settings.clearData": {
    "pt-BR": "Limpar Todos os Dados",
    "en-US": "Clear All Data",
  },
  "settings.clearDataConfirmTitle": {
    "pt-BR": "Limpar Dados",
    "en-US": "Clear Data",
  },
  "settings.clearDataConfirmMessage": {
    "pt-BR": "Tem certeza que deseja limpar todos os dados salvos? Esta ação não pode ser desfeita.",
    "en-US": "Are you sure you want to clear all saved data? This action cannot be undone.",
  },
  "settings.clearDataConfirmCancel": {
    "pt-BR": "Cancelar",
    "en-US": "Cancel",
  },
  "settings.clearDataConfirmClear": {
    "pt-BR": "Limpar",
    "en-US": "Clear",
  },
  "settings.help": {
    "pt-BR": "Ajuda",
    "en-US": "Help",
  },
  "settings.helpAndSupport": {
    "pt-BR": "Ajuda e Suporte",
    "en-US": "Help and Support",
  },
  "settings.version": {
    "pt-BR": "Versão",
    "en-US": "Version",
  },

  // Common
  "common.cancel": {
    "pt-BR": "Cancelar",
    "en-US": "Cancel",
  },
  "common.save": {
    "pt-BR": "Salvar",
    "en-US": "Save",
  },
  "common.delete": {
    "pt-BR": "Excluir",
    "en-US": "Delete",
  },
  "common.edit": {
    "pt-BR": "Editar",
    "en-US": "Edit",
  },
  "common.success": {
    "pt-BR": "Sucesso",
    "en-US": "Success",
  },
  "common.error": {
    "pt-BR": "Erro",
    "en-US": "Error",
  },
  "common.unknown": {
    "pt-BR": "Desconhecido",
    "en-US": "Unknown",
  },
  "history.added": {
    "pt-BR": "Adicionado",
    "en-US": "Added",
  },
  "history.edited": {
    "pt-BR": "Editado",
    "en-US": "Edited",
  },
  "history.deleted": {
    "pt-BR": "Excluído",
    "en-US": "Deleted",
  },
}

// Definindo o tipo para o contexto de localização
type LocalizationContextType = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: (key: string) => string
}

// Criando o contexto com um valor padrão
const LocalizationContext = createContext<LocalizationContextType>({
  language: "pt-BR",
  setLanguage: () => {},
  t: (key) => key,
})

// Hook personalizado para usar o contexto de localização
export const useLocalization = () => useContext(LocalizationContext)

// Provedor de localização que envolve a aplicação
export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSetting } = useSettings()
  const [language, setLanguageState] = useState<LanguageCode>(settings.language)

  // Função para traduzir uma chave
  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language]
    }
    // Retorna a chave se não houver tradução
    return key
  }

  // Função para alterar o idioma
  const setLanguage = (newLanguage: LanguageCode) => {
    setLanguageState(newLanguage)
    updateSetting("language", newLanguage)
  }

  // Efeito para sincronizar o estado com as configurações
  useEffect(() => {
    setLanguageState(settings.language)
  }, [settings.language])

  return <LocalizationContext.Provider value={{ language, setLanguage, t }}>{children}</LocalizationContext.Provider>
}
