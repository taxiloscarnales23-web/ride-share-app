import { ScrollView, Text, View, Pressable, Alert, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
}

export default function SafetyScreen() {
  const colors = useColors();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: 1, name: "Mom", phone: "+1 (555) 123-4567", relationship: "Mother" },
    { id: 2, name: "Best Friend", phone: "+1 (555) 987-6543", relationship: "Friend" },
  ]);
  const [showAddContact, setShowAddContact] = useState(false);

  const handleEmergencyCall = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Emergency Alert",
      "Alerting emergency contacts and support team...",
      [{ text: "OK" }]
    );
  };

  const handleShareLocation = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Location Shared", "Your location has been shared with emergency contacts");
  };

  const handleReportIncident = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Report Incident",
      "Describe what happened during your ride. Our support team will investigate.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Report", onPress: () => Alert.alert("Submitted", "Thank you for reporting. We'll investigate this incident.") },
      ]
    );
  };

  const handleCallContact = async (phone: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Call", `Calling ${phone}`);
  };

  const handleDeleteContact = async (id: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id));
    Alert.alert("Removed", "Emergency contact removed");
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Safety</Text>
            <Text className="text-muted">Emergency features and trusted contacts</Text>
          </View>

          {/* Emergency Actions */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Quick Actions</Text>

            {/* Emergency Button */}
            <Pressable
              onPress={handleEmergencyCall}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View className="bg-error rounded-2xl p-4 items-center justify-center">
                <Text className="text-3xl mb-2">🚨</Text>
                <Text className="text-lg font-bold text-white">Emergency Alert</Text>
                <Text className="text-xs text-white/80 mt-1">Alert emergency contacts</Text>
              </View>
            </Pressable>

            {/* Share Location */}
            <Pressable
              onPress={handleShareLocation}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View className="bg-warning rounded-2xl p-4 items-center justify-center">
                <Text className="text-3xl mb-2">📍</Text>
                <Text className="text-lg font-bold text-white">Share Location</Text>
                <Text className="text-xs text-white/80 mt-1">Share with emergency contacts</Text>
              </View>
            </Pressable>

            {/* Report Incident */}
            <Pressable
              onPress={handleReportIncident}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View className="border-2 border-error rounded-2xl p-4 items-center justify-center">
                <Text className="text-3xl mb-2">📋</Text>
                <Text className="text-lg font-bold text-error">Report Incident</Text>
                <Text className="text-xs text-error/70 mt-1">Report safety concerns</Text>
              </View>
            </Pressable>
          </View>

          {/* Emergency Contacts */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-foreground">Emergency Contacts</Text>
              <Pressable
                onPress={() => setShowAddContact(!showAddContact)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <Text className="text-primary font-semibold">+ Add</Text>
              </Pressable>
            </View>

            {emergencyContacts.length === 0 ? (
              <View className="bg-surface rounded-lg p-4 items-center">
                <Text className="text-muted text-center">No emergency contacts added yet</Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={emergencyContacts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-surface border border-border rounded-lg p-3 flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{item.name}</Text>
                      <Text className="text-xs text-muted">{item.relationship}</Text>
                      <Text className="text-xs text-muted font-mono mt-1">{item.phone}</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleCallContact(item.phone)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      >
                        <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                          <Text className="text-lg">📞</Text>
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteContact(item.id)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      >
                        <View className="w-10 h-10 rounded-full bg-error/10 items-center justify-center">
                          <Text className="text-lg">✕</Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          {/* Safety Tips */}
          <View className="bg-primary/10 rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-primary">💡 Safety Tips</Text>
            <Text className="text-xs text-primary">• Share your ride details with trusted contacts</Text>
            <Text className="text-xs text-primary">• Check driver rating and vehicle info before accepting</Text>
            <Text className="text-xs text-primary">• Keep doors locked until driver arrives</Text>
            <Text className="text-xs text-primary">• Report any safety concerns immediately</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
