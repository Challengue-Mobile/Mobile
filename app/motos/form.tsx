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
import { ArrowLeft, Check } from "lucide-react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import type { Motorcycle } from "@/types"
import { useBeacons } from "@/hooks/useBeacons"
import { useMotorcycles } from "@/hooks/useMotorcycles"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"
import { logError } from "../../lib/errorHandler"
import { getMotoById, createMoto, updateMoto, type Moto } from "../../lib/motoService"

export default function MotoFormScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { theme } = useTheme()
  const { t } = useLocalization()
  const { beacons } = useBeacons()
  const { refetch } = useMotorcycles()

  const isEditing = Boolean(params.id)
  const motoId = params.id as string

  // Estados do formulário
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [model, setModel] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [year, setYear] = useState("")
  const [color, setColor] = useState("")
  const [status, setStatus] = useState<"in-yard" | "out" | "maintenance">("in-yard")
  const [beaconId, setBeaconId] = useState("")

  // Estados de validação
  const [errors, setErrors] = useState({
    model: '',
    licensePlate: '',
    year: '',
    color: ''
  })

  // Beacons disponíveis
  const availableBeacons = beacons.filter(
    (b) => !b.motoId || (isEditing && b.motoId === motoId)
  )

  // Carregar dados da moto se for edição
  useEffect(() => {
    if (isEditing && motoId) {
      loadMotorcycle()
    }
  }, [isEditing, motoId])

  const loadMotorcycle = async () => {
    try {
      setLoading(true)
      const moto = await getMotoById(parseInt(motoId))
      
      if (moto) {
        setModel(moto.modelo || "")
        setLicensePlate(moto.placa || "")
        setYear(moto.year?.toString() || "")
        setColor(moto.color || "")
        setStatus(moto.status || "in-yard")
        setBeaconId(moto.beaconId || "")
      }
    } catch (error) {
      logError('MotoForm - Load', error)
      Alert.alert("Erro", "Não foi possível carregar os dados da moto")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  // Validações
  const validateLicensePlate = (plate: string) => {
    // Formatos aceitos: ABC-1234 ou ABC1D23 (Mercosul)
    const oldFormat = /^[A-Z]{3}-[0-9]{4}$/
    const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/
    return oldFormat.test(plate) || mercosulFormat.test(plate)
  }

  const validateForm = () => {
    const newErrors = { model: '', licensePlate: '', year: '', color: '' }
    
    if (!model.trim()) {
      newErrors.model = 'Modelo é obrigatório'
    } else if (model.trim().length < 2) {
      newErrors.model = 'Modelo deve ter pelo menos 2 caracteres'
    }
    
    if (!licensePlate.trim()) {
      newErrors.licensePlate = 'Placa é obrigatória'
    } else if (!validateLicensePlate(licensePlate.toUpperCase())) {
      newErrors.licensePlate = 'Formato inválido (ABC-1234 ou ABC1D23)'
    }
    
    if (year && (parseInt(year) < 1900 || parseInt(year) > new Date().getFullYear() + 1)) {
      newErrors.year = 'Ano inválido'
    }
    
    setErrors(newErrors)
    return !newErrors.model && !newErrors.licensePlate && !newErrors.year
  }

  // Handlers para limpar erros em tempo real
  const handleModelChange = (text: string) => {
    setModel(text)
    if (errors.model) {
      setErrors(prev => ({ ...prev, model: '' }))
    }
  }

  const handleLicensePlateChange = (text: string) => {
    setLicensePlate(text.toUpperCase())
    if (errors.licensePlate) {
      setErrors(prev => ({ ...prev, licensePlate: '' }))
    }
  }

  const handleYearChange = (text: string) => {
    setYear(text)
    if (errors.year) {
      setErrors(prev => ({ ...prev, year: '' }))
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setSaving(true)
    
    try {
      const motoData: Omit<Moto, "id"> = {
        placa: licensePlate.toUpperCase(),
        modelo: model.trim(),
      }

      if (isEditing) {
        await updateMoto(parseInt(motoId), motoData)
        Alert.alert("Sucesso", "Moto atualizada com sucesso")
      } else {
        await createMoto(motoData)
        Alert.alert("Sucesso", "Moto cadastrada com sucesso")
      }

      // Atualizar lista de motos
      await refetch?.()
      
      // Voltar para listagem
      router.back()
    } catch (error) {
      logError('MotoForm - Save', error)
      Alert.alert("Erro", `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} moto`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
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
            {isEditing ? "Editar Moto" : "Nova Moto"}
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
          {/* Modelo */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Modelo *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                  borderColor: errors.model ? '#ef4444' : theme.colors.gray[300],
                  color: theme.colors.text,
                },
              ]}
              value={model}
              onChangeText={handleModelChange}
              placeholder="Ex: Honda CG 160"
              placeholderTextColor={theme.colors.gray[400]}
              editable={!saving}
            />
            {errors.model ? <Text style={styles.errorText}>{errors.model}</Text> : null}
          </View>

          {/* Placa */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Placa *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                  borderColor: errors.licensePlate ? '#ef4444' : theme.colors.gray[300],
                  color: theme.colors.text,
                },
              ]}
              value={licensePlate}
              onChangeText={handleLicensePlateChange}
              placeholder="Ex: ABC-1234 ou ABC1D23"
              placeholderTextColor={theme.colors.gray[400]}
              autoCapitalize="characters"
              editable={!saving}
            />
            {errors.licensePlate ? <Text style={styles.errorText}>{errors.licensePlate}</Text> : null}
          </View>

          {/* Ano & Cor */}
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Ano
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                    borderColor: errors.year ? '#ef4444' : theme.colors.gray[300],
                    color: theme.colors.text,
                  },
                ]}
                value={year}
                onChangeText={handleYearChange}
                placeholder="Ex: 2023"
                placeholderTextColor={theme.colors.gray[400]}
                keyboardType="numeric"
                editable={!saving}
              />
              {errors.year ? <Text style={styles.errorText}>{errors.year}</Text> : null}
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Cor
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                    borderColor: theme.colors.gray[300],
                    color: theme.colors.text,
                  },
                ]}
                value={color}
                onChangeText={setColor}
                placeholder="Ex: Vermelha"
                placeholderTextColor={theme.colors.gray[400]}
                editable={!saving}
              />
            </View>
          </View>

          {/* Status */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Status
            </Text>
            <View style={styles.statusOptions}>
              {(["in-yard", "out", "maintenance"] as const).map((st) => (
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
                    {st === "in-yard" ? "No Pátio" : st === "out" ? "Fora" : "Manutenção"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Beacon */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Beacon
            </Text>
            {availableBeacons.length > 0 ? (
              <View style={styles.beaconOptions}>
                <TouchableOpacity
                  style={[
                    styles.beaconOption,
                    { 
                      borderColor: theme.colors.gray[300],
                      backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                    },
                    beaconId === "" && {
                      borderColor: theme.colors.primary[500],
                      backgroundColor: theme.colors.primary[50],
                    },
                  ]}
                  onPress={() => setBeaconId("")}
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.beaconText,
                      { color: theme.colors.gray[700] },
                      beaconId === "" && {
                        color: theme.colors.primary[700],
                        fontFamily: "Poppins-Medium",
                      },
                    ]}
                  >
                    Nenhum
                  </Text>
                </TouchableOpacity>
                {availableBeacons.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.beaconOption,
                      { 
                        borderColor: theme.colors.gray[300],
                        backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                      },
                      b.id === beaconId && {
                        borderColor: theme.colors.primary[500],
                        backgroundColor: theme.colors.primary[50],
                      },
                    ]}
                    onPress={() => setBeaconId(b.id)}
                    disabled={saving}
                  >
                    <Text
                      style={[
                        styles.beaconText,
                        { color: theme.colors.gray[700] },
                        b.id === beaconId && {
                          color: theme.colors.primary[700],
                          fontFamily: "Poppins-Medium",
                        },
                      ]}
                    >
                      {b.id.substring(0, 8)}...
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text
                style={[
                  styles.noBeaconsText,
                  {
                    color: theme.colors.gray[600],
                    backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.gray[50],
                  },
                ]}
              >
                Nenhum beacon disponível
              </Text>
            )}
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
                backgroundColor: (saving || !model.trim() || !licensePlate.trim())
                  ? theme.colors.gray[400]
                  : theme.colors.primary[500]
              }
            ]}
            onPress={handleSave}
            disabled={saving || !model.trim() || !licensePlate.trim()}
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
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginBottom: 6,
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
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },

  // Beacon Options
  beaconOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  beaconOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  beaconText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  noBeaconsText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
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