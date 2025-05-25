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
  Switch,
} from "react-native"
import { X } from "lucide-react-native"
import type { Beacon } from "@/types"
import { useMotorcycles } from "@/hooks/useMotorcycles"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"

interface BeaconFormModalProps {
  visible: boolean
  beacon: Beacon | null
  onClose: () => void
  onSave: (beacon: Beacon) => void
}

export function BeaconFormModal({
  visible,
  beacon,
  onClose,
  onSave,
}: BeaconFormModalProps) {
  const { theme } = useTheme()
  const { t } = useLocalization()
  const { motorcycles } = useMotorcycles()

  const [id, setId] = useState("")
  const [status, setStatus] = useState<"active" | "inactive" | "offline">(
    "active"
  )
  const [batteryLevel, setBatteryLevel] = useState("100")
  const [signalStrength, setSignalStrength] = useState("100")
  const [motoId, setMotoId] = useState<string | null>(null)

  // sempre mostrar todas as motos
  const availableMotorcycles = motorcycles

  useEffect(() => {
    if (beacon) {
      // modo edição: carrega valores
      setId(beacon.id)
      setStatus(beacon.status)
      setBatteryLevel(beacon.batteryLevel.toString())
      setSignalStrength(beacon.signalStrength.toString())
      setMotoId(beacon.motoId ?? null)
    } else {
      // modo novo: gera ID simples
      setId(`beacon-${String(Date.now()).slice(-3)}`)
      setStatus("active")
      setBatteryLevel("100")
      setSignalStrength("100")
      setMotoId(null)
    }
  }, [beacon, visible])

  const handleSave = () => {
    if (!id.trim()) return

    // garante status válido
    type Status = "active" | "inactive" | "offline"
    const isValidStatus = (v: string): v is Status =>
      ["active", "inactive", "offline"].includes(v)
    const finalStatus: Status = isValidStatus(status) ? status : "offline"

    const newBeacon: Beacon = {
      id: id.trim(),
      status: finalStatus,
      batteryLevel: parseInt(batteryLevel) || 100,
      signalStrength: parseInt(signalStrength) || 100,
      motoId,
    }
    onSave(newBeacon)
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
        {/* backdrop escuro */}
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* modal container */}
        <View
          style={[styles.container, { backgroundColor: theme.colors.white }]}
        >
          {/* cabeçalho */}
          <View
            style={[styles.header, { borderBottomColor: theme.colors.gray[200] }]}
          >
            <Text style={[styles.title, { color: theme.colors.gray[900] }]}>
              {beacon ? t("beacons.edit") : t("beacons.new")}
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
            {/* ID */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.gray[800] }]}>
                {t("beacons.id")}
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
                value={id}
                onChangeText={setId}
                placeholder="Ex: beacon-001"
                placeholderTextColor={theme.colors.gray[400]}
                // sempre editável
                editable={true}
              />
            </View>

            {/* Status */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.gray[800] }]}>
                {t("beacons.status")}
              </Text>
              <View
                style={[
                  styles.statusOption,
                  {
                    backgroundColor: theme.colors.gray[100],
                    borderRadius: 8,
                  },
                ]}
              >
                <Text
                  style={[styles.statusLabel, { color: theme.colors.gray[800] }]}
                >
                  {t(`beacons.status.${status}`)}
                </Text>
                <Switch
                  value={status === "active"}
                  onValueChange={(v) =>
                    setStatus(v ? "active" : "inactive")
                  }
                  trackColor={{
                    false: theme.colors.gray[300],
                    true: theme.colors.primary[300],
                  }}
                  thumbColor={
                    status === "active"
                      ? theme.colors.primary[500]
                      : theme.colors.gray[100]
                  }
                />
              </View>
            </View>

            {/* Nível de bateria / sinal */}
            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: theme.colors.gray[800] }]}>
                  {t("beacons.batteryLevel")}
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
                  value={batteryLevel}
                  onChangeText={setBatteryLevel}
                  placeholder="100"
                  placeholderTextColor={theme.colors.gray[400]}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: theme.colors.gray[800] }]}>
                  {t("beacons.signalStrength")}
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
                  value={signalStrength}
                  onChangeText={setSignalStrength}
                  placeholder="100"
                  placeholderTextColor={theme.colors.gray[400]}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Vincular moto */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.gray[800] }]}>
                {t("beacons.linkToMotorcycle")}
              </Text>
              <View style={styles.beaconOptions}>
                {/* “Nenhuma” */}
                <TouchableOpacity
                  style={[
                    styles.motoOption,
                    {
                      backgroundColor: motoId === null
                        ? theme.colors.primary[50]
                        : theme.colors.gray[100],
                      borderColor: motoId === null
                        ? theme.colors.primary[500]
                        : theme.colors.gray[300],
                    },
                  ]}
                  onPress={() => setMotoId(null)}
                >
                  <Text
                    style={[
                      styles.motoText,
                      motoId === null && {
                        color: theme.colors.primary[700],
                        fontFamily: "Poppins-Medium",
                      },
                    ]}
                  >
                    {t("beacons.none")}
                  </Text>
                </TouchableOpacity>

                {/* lista de motos */}
                {availableMotorcycles.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.motoOption,
                      {
                        backgroundColor: m.id === motoId
                          ? theme.colors.primary[50]
                          : theme.colors.gray[100],
                        borderColor: m.id === motoId
                          ? theme.colors.primary[500]
                          : theme.colors.gray[300],
                      },
                    ]}
                    onPress={() => setMotoId(m.id)}
                  >
                    <Text
                      style={[
                        styles.motoText,
                        m.id === motoId && {
                          color: theme.colors.primary[700],
                          fontFamily: "Poppins-Medium",
                        },
                      ]}
                    >
                      {m.model} ({m.licensePlate})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* rodapé */}
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
              style={[styles.saveButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={handleSave}
            >
              <Text style={[styles.saveButtonText, { color: theme.colors.white }]}>
                {t("common.save")}
              </Text>
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
    maxHeight: "70%",
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
  statusOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  statusLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  beaconOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  motoOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  motoText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#374151",
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
})
