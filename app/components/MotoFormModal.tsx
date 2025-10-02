"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native"
import { X } from "lucide-react-native"
import type { Motorcycle } from "@/types"
import { useBeacons } from "@/hooks/useBeacons"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"
import { logError } from "../../lib/errorHandler"

interface MotoFormModalProps {
  visible: boolean
  motorcycle: Motorcycle | null
  onClose: () => void
  onSave: (motorcycle: Motorcycle) => void
}

export function MotoFormModal({
  visible,
  motorcycle,
  onClose,
  onSave,
}: MotoFormModalProps) {
  const { theme } = useTheme()
  const { t } = useLocalization()
  const { beacons } = useBeacons()

  // campos do formulário
  const [model, setModel] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [year, setYear] = useState("")
  const [color, setColor] = useState("")
  const [status, setStatus] = useState<"in-yard" | "out" | "maintenance">(
    "in-yard"
  )
  const [beaconId, setBeaconId] = useState("")
  
  // validações e estados
  const [errors, setErrors] = useState({ 
    model: '', 
    licensePlate: '', 
    year: '',
    color: '' 
  })
  const [loading, setLoading] = useState(false)

  // apenas beacons livres ou já associados à moto sendo editada
  const availableBeacons = beacons.filter(
    (b) => !b.motoId || (motorcycle && b.motoId === motorcycle.id)
  )

  // sempre que abrir o modal, carregamos ou limpamos os campos
  useEffect(() => {
    if (motorcycle) {
      setModel(motorcycle.model)
      setLicensePlate(motorcycle.licensePlate)
      setYear(motorcycle.year.toString())
      setColor(motorcycle.color)
      setStatus(motorcycle.status)
      setBeaconId(motorcycle.beaconId || "")
    } else {
      setModel("")
      setLicensePlate("")
      setYear("")
      setColor("")
      setStatus("in-yard")
      setBeaconId("")
    }
    // Limpar erros ao abrir modal
    setErrors({ model: '', licensePlate: '', year: '', color: '' })
    setLoading(false)
  }, [motorcycle, visible])

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

  // Handlers para limpar erros
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
    
    setLoading(true)
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newMotorcycle: Motorcycle = {
        id: motorcycle?.id || `moto-${Date.now()}`,
        model: model.trim(),
        licensePlate: licensePlate.toUpperCase(),
        year: parseInt(year) || new Date().getFullYear(),
        color: color.trim(),
        status,
        beaconId: beaconId || null,
      }

      onSave(newMotorcycle)
    } catch (error) {
      logError('MotoForm - Save', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    Keyboard.dismiss()
    onClose()
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleDismiss}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* backdrop clicável */}
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* container do modal */}
        <View
          style={[styles.container, { backgroundColor: theme.colors.white }]}
        >
          {/* header */}
          <View
            style={[styles.header, { borderBottomColor: theme.colors.gray[200] }]}
          >
            <Text style={[styles.title, { color: theme.colors.gray[900] }]}>
              {motorcycle ? t("motorcycles.edit") : t("motorcycles.new")}
            </Text>
            <TouchableOpacity onPress={handleDismiss}>
              <X size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          {/* conteúdo */}
          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Modelo */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.gray[800] }]}>
                {t("motorcycles.model")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.gray[100],
                    borderColor: errors.model ? '#ef4444' : theme.colors.gray[300],
                    color: theme.colors.gray[900],
                  },
                ]}
                value={model}
                onChangeText={handleModelChange}
                placeholder="Ex: Honda CG 160"
                placeholderTextColor={theme.colors.gray[400]}
              />
              {errors.model ? <Text style={styles.errorText}>{errors.model}</Text> : null}
            </View>

            {/* Placa */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.gray[800] }]}>
                {t("motorcycles.licensePlate")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.gray[100],
                    borderColor: errors.licensePlate ? '#ef4444' : theme.colors.gray[300],
                    color: theme.colors.gray[900],
                  },
                ]}
                value={licensePlate}
                onChangeText={handleLicensePlateChange}
                placeholder="Ex: ABC-1234"
                placeholderTextColor={theme.colors.gray[400]}
                autoCapitalize="characters"
              />
              {errors.licensePlate ? <Text style={styles.errorText}>{errors.licensePlate}</Text> : null}
            </View>

            {/* Ano & Cor */}
            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text
                  style={[styles.label, { color: theme.colors.gray[800] }]}
                >
                  {t("motorcycles.year")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.gray[100],
                      borderColor: errors.year ? '#ef4444' : theme.colors.gray[300],
                      color: theme.colors.gray[900],
                    },
                  ]}
                  value={year}
                  onChangeText={handleYearChange}
                  placeholder="Ex: 2023"
                  placeholderTextColor={theme.colors.gray[400]}
                  keyboardType="numeric"
                />
                {errors.year ? <Text style={styles.errorText}>{errors.year}</Text> : null}
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text
                  style={[styles.label, { color: theme.colors.gray[800] }]}
                >
                  {t("motorcycles.color")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.gray[100],
                      borderColor: theme.colors.gray[300],
                      color: theme.colors.gray[900],
                    },
                  ]}
                  value={color}
                  onChangeText={setColor}
                  placeholder="Ex: Vermelha"
                  placeholderTextColor={theme.colors.gray[400]}
                />
              </View>
            </View>

            {/* Status */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.gray[800] }]}>
                {t("motorcycles.status")}
              </Text>
              <View style={styles.statusOptions}>
                {(["in-yard", "out", "maintenance"] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusOption,
                      { borderColor: theme.colors.gray[300] },
                      status === st && {
                        borderColor: theme.colors.primary[500],
                        backgroundColor: theme.colors.primary[50],
                      },
                    ]}
                    onPress={() => setStatus(st)}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        status === st && {
                          color: theme.colors.primary[700],
                          fontFamily: "Poppins-Medium",
                        },
                      ]}
                    >
                      {t(
                        `motorcycles.status.${
                          st === "in-yard" ? "inYard" : st
                        }`
                      )}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Beacon */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.gray[800] }]}>
                {t("motorcycles.beacon")}
              </Text>
              {availableBeacons.length > 0 ? (
                <View style={styles.beaconOptions}>
                  <TouchableOpacity
                    style={[
                      styles.beaconOption,
                      { borderColor: theme.colors.gray[300] },
                      beaconId === "" && {
                        borderColor: theme.colors.primary[500],
                        backgroundColor: theme.colors.primary[50],
                      },
                    ]}
                    onPress={() => setBeaconId("")}
                  >
                    <Text
                      style={[
                        styles.beaconText,
                        beaconId === "" && {
                          color: theme.colors.primary[700],
                          fontFamily: "Poppins-Medium",
                        },
                      ]}
                    >
                      {t("beacons.none")}
                    </Text>
                  </TouchableOpacity>
                  {availableBeacons.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.beaconOption,
                        { borderColor: theme.colors.gray[300] },
                        b.id === beaconId && {
                          borderColor: theme.colors.primary[500],
                          backgroundColor: theme.colors.primary[50],
                        },
                      ]}
                      onPress={() => setBeaconId(b.id)}
                    >
                      <Text
                        style={[
                          styles.beaconText,
                          b.id === beaconId && {
                            color: theme.colors.primary[700],
                            fontFamily: "Poppins-Medium",
                          },
                        ]}
                      >
                        {b.id}
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
                      backgroundColor: theme.colors.gray[100],
                    },
                  ]}
                >
                  {t("motorcycles.noBeaconsAvailable")}
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={[styles.footer, { borderTopColor: theme.colors.gray[200] }]}
          >
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.gray[300] }]}
              onPress={handleDismiss}
            >
              <Text
                style={[styles.cancelButtonText, { color: theme.colors.gray[700] }]}
              >
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton, 
                { 
                  backgroundColor: (loading || !model.trim() || !licensePlate.trim()) 
                    ? theme.colors.gray[400] 
                    : theme.colors.primary[500] 
                }
              ]}
              onPress={handleSave}
              disabled={loading || !model.trim() || !licensePlate.trim()}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text
                  style={[styles.saveButtonText, { color: theme.colors.white }]}
                >
                  {t("common.save")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  content: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
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
    paddingVertical: 10,
    borderWidth: 1,
  },
  statusOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusOption: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#4B5563",
  },
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
    color: "#4B5563",
  },
  noBeaconsText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
  },
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
  },
  saveButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: "Poppins-Regular",
  },
})
