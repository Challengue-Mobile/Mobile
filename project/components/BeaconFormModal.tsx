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
  Keyboard,
  TouchableWithoutFeedback,
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

export function BeaconFormModal({ visible, beacon, onClose, onSave }: BeaconFormModalProps) {
  const { theme } = useTheme()
  const { t } = useLocalization()
  const { motorcycles } = useMotorcycles()

  const [id, setId] = useState("")
  const [status, setStatus] = useState("active")
  const [batteryLevel, setBatteryLevel] = useState("100")
  const [signalStrength, setSignalStrength] = useState("100")
  const [motoId, setMotoId] = useState<string | null>(null)

  const availableMotorcycles = motorcycles.filter((m) => !m.beaconId || (beacon && m.beaconId === beacon.id))

  useEffect(() => {
    if (beacon) {
      setId(beacon.id)
      setStatus(beacon.status)
      setBatteryLevel(beacon.batteryLevel.toString())
      setSignalStrength(beacon.signalStrength.toString())
      setMotoId(beacon.motoId)
    } else {
      setId(`beacon-${String(Date.now()).slice(-3)}`)
      setStatus("active")
      setBatteryLevel("100")
      setSignalStrength("100")
      setMotoId(null)
    }
  }, [beacon, visible])

  const handleSave = () => {
    if (!id) {
      return // Could add validation feedback here
    }

    type Status = "active" | "inactive" | "offline";

function isValidStatus(value: string): value is Status {
  return value === "active" || value === "inactive" || value === "offline";
}

let finalStatus: Status = "offline"; // fallback padrão

if (isValidStatus(status)) {
  finalStatus = status;
}

const newBeacon: Beacon = {
  id,
  status: finalStatus,
  batteryLevel: Number.parseInt(batteryLevel) || 100,
  signalStrength: Number.parseInt(signalStrength) || 100,
  motoId,
};

    onSave(newBeacon)
  }

  const handleDismiss = () => {
    Keyboard.dismiss()
    onClose()
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={handleDismiss}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: theme.colors.white }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.gray[200] }]}>
              <Text style={[styles.title, { color: theme.colors.gray[900] }]}>
                {beacon ? t("beacons.edit") : t("beacons.new")}
              </Text>
              <TouchableOpacity onPress={handleDismiss}>
                <X size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.gray[800] }]}>{t("beacons.id")}</Text>
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
                  editable={!beacon} // Only allow editing if it's a new beacon
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.gray[800] }]}>{t("beacons.status")}</Text>
                <View style={[styles.statusOption, { backgroundColor: theme.colors.gray[100], borderRadius: 8 }]}>
                  <Text style={[styles.statusLabel, { color: theme.colors.gray[800] }]}>
                    {t("beacons.status.active")}
                  </Text>
                  <Switch
                    value={status === "active"}
                    onValueChange={(value) => setStatus(value ? "active" : "inactive")}
                    trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[300] }}
                    thumbColor={status === "active" ? theme.colors.primary[500] : theme.colors.gray[100]}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={[styles.label, { color: theme.colors.gray[800] }]}>{t("beacons.batteryLevel")}</Text>
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
                    placeholder="Ex: 100"
                    placeholderTextColor={theme.colors.gray[400]}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={[styles.label, { color: theme.colors.gray[800] }]}>{t("beacons.signalStrength")}</Text>
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
                    placeholder="Ex: 100"
                    placeholderTextColor={theme.colors.gray[400]}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.gray[800] }]}>{t("beacons.linkToMotorcycle")}</Text>
                {availableMotorcycles.length > 0 ? (
                  <View>
                    <TouchableOpacity
                      style={[
                        styles.motoOption,
                        { borderColor: theme.colors.gray[300] },
                        motoId === null && [
                          styles.motoOptionSelected,
                          { borderColor: theme.colors.primary[500], backgroundColor: theme.colors.primary[50] },
                        ],
                      ]}
                      onPress={() => setMotoId(null)}
                    >
                      <Text
                        style={[
                          styles.motoText,
                          { color: theme.colors.gray[700] },
                          motoId === null && [styles.motoTextSelected, { color: theme.colors.primary[700] }],
                        ]}
                      >
                        {t("beacons.none")}
                      </Text>
                    </TouchableOpacity>

                    {availableMotorcycles.map((moto) => (
                      <TouchableOpacity
                        key={moto.id}
                        style={[
                          styles.motoOption,
                          { borderColor: theme.colors.gray[300] },
                          moto.id === motoId && [
                            styles.motoOptionSelected,
                            { borderColor: theme.colors.primary[500], backgroundColor: theme.colors.primary[50] },
                          ],
                        ]}
                        onPress={() => setMotoId(moto.id)}
                      >
                        <Text
                          style={[
                            styles.motoText,
                            { color: theme.colors.gray[700] },
                            moto.id === motoId && [styles.motoTextSelected, { color: theme.colors.primary[700] }],
                          ]}
                        >
                          {moto.model} ({moto.licensePlate})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.noMotosText,
                      { color: theme.colors.gray[600], backgroundColor: theme.colors.gray[100] },
                    ]}
                  >
                    {t("beacons.noMotorcyclesAvailable")}
                  </Text>
                )}
              </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.gray[200] }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.gray[300] }]}
                onPress={handleDismiss}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.gray[700] }]}>{t("common.cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary[500] }]}
                onPress={handleSave}
              >
                <Text style={[styles.saveButtonText, { color: theme.colors.white }]}>{t("common.save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
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
  motoOption: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  motoOptionSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  motoText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  motoTextSelected: {
    fontFamily: "Poppins-Medium",
  },
  noMotosText: {
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
})
