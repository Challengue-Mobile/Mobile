"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ArrowLeft, Check, Bluetooth } from "lucide-react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import type { Beacon } from "@/types"
import { useBeacons } from "@/hooks/useBeacons"
import { useMotorcycles } from "@/hooks/useMotorcycles"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"
import { logError } from "../../lib/errorHandler"
import { getBeaconById, createBeacon, updateBeacon, type Beacon as BeaconAPI } from "../../lib/beaconService"

export default function BeaconFormScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { theme } = useTheme()
  const { t } = useLocalization()
  const { motorcycles } = useMotorcycles()
  const { refetch } = useBeacons()

  const isEditing = Boolean(params.id)
  const beaconId = params.id as string

  // Estados do formulário
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [uuid, setUuid] = useState("")
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [batteryLevel, setBatteryLevel] = useState("100")
  const [signalStrength, setSignalStrength] = useState("100")
  const [motoId, setMotoId] = useState<string | null>(null)

  // Estados de validação
  const [errors, setErrors] = useState({
    uuid: '',
    batteryLevel: '',
    signalStrength: ''
  })

  // Carregar dados do beacon se for edição
  useEffect(() => {
    if (isEditing && beaconId) {
      loadBeacon()
    }
  }, [isEditing, beaconId])

  const loadBeacon = async () => {
    try {
      setLoading(true)
      const beacon = await getBeaconById(parseInt(beaconId))
      
      if (beacon) {
        setUuid(beacon.uuid || "")
        setStatus(beacon.status || "active")
        setBatteryLevel(beacon.batteryLevel?.toString() || "100")
        setSignalStrength(beacon.signalStrength?.toString() || "100")
        setMotoId(beacon.motoId || null)
      }
    } catch (error) {
      logError('BeaconForm - Load', error)
      Alert.alert("Erro", "Não foi possível carregar os dados do beacon")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  // Validações
  const validateUUID = (uuidValue: string) => {
    // Formato UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const simpleIdRegex = /^[a-zA-Z0-9\-_]{3,50}$/
    
    return uuidRegex.test(uuidValue) || simpleIdRegex.test(uuidValue)
  }

  const validateForm = () => {
    const newErrors = { uuid: '', batteryLevel: '', signalStrength: '' }
    
    if (!uuid.trim()) {
      newErrors.uuid = 'UUID é obrigatório'
    } else if (!validateUUID(uuid.trim())) {
      newErrors.uuid = 'Formato inválido (UUID ou ID alfanumérico 3-50 chars)'
    }
    
    const batteryNum = parseInt(batteryLevel)
    if (isNaN(batteryNum) || batteryNum < 0 || batteryNum > 100) {
      newErrors.batteryLevel = 'Bateria deve estar entre 0 e 100%'
    }
    
    const signalNum = parseInt(signalStrength)
    if (isNaN(signalNum) || signalNum < 0 || signalNum > 100) {
      newErrors.signalStrength = 'Sinal deve estar entre 0 e 100%'
    }
    
    setErrors(newErrors)
    return !newErrors.uuid && !newErrors.batteryLevel && !newErrors.signalStrength
  }

  // Handlers para limpar erros em tempo real
  const handleUuidChange = (text: string) => {
    setUuid(text.trim())
    if (errors.uuid) {
      setErrors(prev => ({ ...prev, uuid: '' }))
    }
  }

  const handleBatteryChange = (text: string) => {
    setBatteryLevel(text)
    if (errors.batteryLevel) {
      setErrors(prev => ({ ...prev, batteryLevel: '' }))
    }
  }

  const handleSignalChange = (text: string) => {
    setSignalStrength(text)
    if (errors.signalStrength) {
      setErrors(prev => ({ ...prev, signalStrength: '' }))
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setSaving(true)
    
    try {
      const beaconData: Omit<BeaconAPI, "id"> = {
        uuid: uuid.trim(),
      }

      if (isEditing) {
        await updateBeacon(parseInt(beaconId), beaconData)
        Alert.alert("Sucesso", "Beacon atualizado com sucesso")
      } else {
        await createBeacon(beaconData)
        Alert.alert("Sucesso", "Beacon cadastrado com sucesso")
      }

      // Atualizar lista de beacons
      await refetch?.()
      
      // Voltar para listagem
      router.back()
    } catch (error) {
      logError('BeaconForm - Save', error)
      Alert.alert("Erro", `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} beacon`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const generateUUID = () => {
    // Gerar UUID v4 simples
    const chars = '0123456789abcdef'
    let uuid = ''
    for (let i = 0; i < 32; i++) {
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-'
      }
      if (i === 12) {
        uuid += '4'
      } else if (i === 16) {
        uuid += chars[(Math.random() * 4 | 0) + 8]
      } else {
        uuid += chars[Math.random() * 16 | 0]
      }
    }
    setUuid(uuid)
    if (errors.uuid) {
      setErrors(prev => ({ ...prev, uuid: '' }))
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={[styles.loadingText, { color: theme.colors.gray[600] }]}>
            Carregando...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white, 
          borderBottomColor: theme.colors.gray[200] 
        }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {isEditing ? "Editar Beacon" : "Novo Beacon"}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* UUID */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                UUID *
              </Text>
              <TouchableOpacity 
                onPress={generateUUID}
                style={[styles.generateButton, { backgroundColor: theme.colors.primary[500] }]}
              >
                <Text style={[styles.generateButtonText, { color: theme.colors.white }]}>
                  Gerar
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                  borderColor: errors.uuid ? '#ef4444' : theme.colors.gray[300],
                  color: theme.colors.text,
                },
              ]}
              value={uuid}
              onChangeText={handleUuidChange}
              placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
              placeholderTextColor={theme.colors.gray[400]}
              editable={!saving}
              multiline={true}
              numberOfLines={2}
            />
            {errors.uuid ? <Text style={styles.errorText}>{errors.uuid}</Text> : null}
          </View>

          {/* Status */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Status
            </Text>
            <View style={styles.statusOptions}>
              {(["active", "inactive"] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.statusOption,
                    { 
                      borderColor: theme.colors.gray[300],
                      backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                    },
                    status === st && {
                      borderColor: theme.colors.primary[500],
                      backgroundColor: theme.colors.primary[50],
                    },
                  ]}
                  onPress={() => setStatus(st)}
                  disabled={saving}
                >
                  <Bluetooth 
                    size={16} 
                    color={status === st ? theme.colors.primary[700] : theme.colors.gray[500]} 
                    style={styles.statusIcon}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: theme.colors.gray[700] },
                      status === st && {
                        color: theme.colors.primary[700],
                        fontFamily: "Poppins-Medium",
                      },
                    ]}
                  >
                    {st === "active" ? "Ativo" : "Inativo"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bateria & Sinal */}
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Bateria (%)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                    borderColor: errors.batteryLevel ? '#ef4444' : theme.colors.gray[300],
                    color: theme.colors.text,
                  },
                ]}
                value={batteryLevel}
                onChangeText={handleBatteryChange}
                placeholder="100"
                placeholderTextColor={theme.colors.gray[400]}
                keyboardType="numeric"
                editable={!saving}
              />
              {errors.batteryLevel ? <Text style={styles.errorText}>{errors.batteryLevel}</Text> : null}
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Sinal (%)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                    borderColor: errors.signalStrength ? '#ef4444' : theme.colors.gray[300],
                    color: theme.colors.text,
                  },
                ]}
                value={signalStrength}
                onChangeText={handleSignalChange}
                placeholder="100"
                placeholderTextColor={theme.colors.gray[400]}
                keyboardType="numeric"
                editable={!saving}
              />
              {errors.signalStrength ? <Text style={styles.errorText}>{errors.signalStrength}</Text> : null}
            </View>
          </View>

          {/* Associar à Moto */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Associar à Moto
            </Text>
            <View style={styles.motoOptions}>
              <TouchableOpacity
                style={[
                  styles.motoOption,
                  { 
                    borderColor: theme.colors.gray[300],
                    backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                  },
                  motoId === null && {
                    borderColor: theme.colors.primary[500],
                    backgroundColor: theme.colors.primary[50],
                  },
                ]}
                onPress={() => setMotoId(null)}
                disabled={saving}
              >
                <Text
                  style={[
                    styles.motoText,
                    { color: theme.colors.gray[700] },
                    motoId === null && {
                      color: theme.colors.primary[700],
                      fontFamily: "Poppins-Medium",
                    },
                  ]}
                >
                  Nenhuma
                </Text>
              </TouchableOpacity>
              {motorcycles.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.motoOption,
                    { 
                      borderColor: theme.colors.gray[300],
                      backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                    },
                    m.id === motoId && {
                      borderColor: theme.colors.primary[500],
                      backgroundColor: theme.colors.primary[50],
                    },
                  ]}
                  onPress={() => setMotoId(m.id)}
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.motoText,
                      { color: theme.colors.gray[700] },
                      m.id === motoId && {
                        color: theme.colors.primary[700],
                        fontFamily: "Poppins-Medium",
                      },
                    ]}
                  >
                    {m.model} ({(m as any).licensePlate || (m as any).plate || "S/P"})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { 
          borderTopColor: theme.colors.gray[200],
          backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
        }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.gray[300] }]}
            onPress={handleCancel}
            disabled={saving}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.gray[700] }]}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: (saving || !uuid.trim())
                  ? theme.colors.gray[400]
                  : theme.colors.primary[500]
              }
            ]}
            onPress={handleSave}
            disabled={saving || !uuid.trim()}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Check size={18} color={theme.colors.white} />
                <Text style={[styles.saveButtonText, { color: theme.colors.white }]}>
                  Salvar
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  
  // Loading
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    marginTop: 12, 
    fontFamily: "Poppins-Regular", 
    fontSize: 14 
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: { 
    padding: 4 
  },
  title: { 
    fontFamily: "Poppins-SemiBold", 
    fontSize: 18,
    flex: 1,
    textAlign: "center",
  },
  placeholder: { 
    width: 32 
  },

  // Content
  content: { 
    flex: 1 
  },
  contentContainer: { 
    padding: 16 
  },

  // Form
  formGroup: { 
    marginBottom: 16 
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: { 
    width: "48%" 
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  generateButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  generateButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
  input: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: "Poppins-Regular",
  },

  // Status Options
  statusOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },

  // Moto Options
  motoOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  motoOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  motoText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },

  // Footer
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginLeft: 8,
  },
})