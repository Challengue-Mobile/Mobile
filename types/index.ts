export interface Motorcycle {
  id: string
  model: string
  licensePlate: string
  year: number
  zoneId?: string
  color: string
  status: "in-yard" | "out" | "maintenance"
  beaconId: string | null
}

export interface Beacon {
  id: string
  status: "active" | "inactive" | "offline"
  batteryLevel: number
  signalStrength: number
  motoId: string | null
}

// Adicione estas traduções ao arquivo de contexto de localização
export const beaconTranslations = {
  "beacons.weakSignalTitle": {
    "pt-BR": "Sinal Fraco Detectado",
    "en-US": "Weak Signal Detected",
  },
  "beacons.weakSignalBody": {
    "pt-BR": "O beacon {id} está com sinal fraco. Verifique sua localização.",
    "en-US": "Beacon {id} has a weak signal. Check its location.",
  },
  "beacons.lowBatteryTitle": {
    "pt-BR": "Bateria Fraca",
    "en-US": "Low Battery",
  },
  "beacons.lowBatteryBody": {
    "pt-BR": "O beacon {id} está com bateria fraca. Considere substituí-la em breve.",
    "en-US": "Beacon {id} has a low battery. Consider replacing it soon.",
  },
}
export const motorcycleTranslations = {
  "motorcycles.inYard": {
    "pt-BR": "Na Garagem",
    "en-US": "In Yard",
  },
  "motorcycles.out": {
    "pt-BR": "Fora",
    "en-US": "Out",
  },
  "motorcycles.maintenance": {
    "pt-BR": "Manutenção",
    "en-US": "Maintenance",
  },
}
export const statusTranslations = {
  "status.active": {
    "pt-BR": "Ativo",
    "en-US": "Active",
  },
  "status.inactive": {
    "pt-BR": "Inativo",
    "en-US": "Inactive",
  },
  "status.offline": {
    "pt-BR": "Offline",
    "en-US": "Offline",
  }
}