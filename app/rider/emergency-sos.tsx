import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Emergency SOS Screen
 * Allows riders to trigger emergency alerts and contact trusted contacts
 */

export default function EmergencySOS() {
  const colors = useColors();
  const [sosActive, setSOSActive] = useState(false);
  const [emergencyType, setEmergencyType] = useState<"medical" | "accident" | "threat" | null>(null);

  const emergencyTypes = [
    { id: "medical", label: "Medical Emergency", icon: "🏥" },
    { id: "accident", label: "Accident", icon: "🚗" },
    { id: "threat", label: "Safety Threat", icon: "🚨" },
  ];

  const trustedContacts = [
    { id: 1, name: "Mom", phone: "+1-555-0100", icon: "👩" },
    { id: 2, name: "Dad", phone: "+1-555-0101", icon: "👨" },
    { id: 3, name: "Sister", phone: "+1-555-0102", icon: "👧" },
  ];

  const handleSOSPress = () => {
    if (!emergencyType) {
      Alert.alert("Select Emergency Type", "Please select the type of emergency first");
      return;
    }

    Alert.alert(
      "Confirm SOS Alert",
      `Are you sure you want to trigger an SOS alert for ${emergencyType}?\n\nThis will:\n• Alert emergency services\n• Notify trusted contacts\n• Share your location\n• Alert your driver`,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Confirm SOS",
          onPress: () => {
            setSOSActive(true);
            Alert.alert("SOS Activated", "Emergency services have been alerted. Help is on the way.");
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleContactTrusted = (contact: any) => {
    Alert.alert("Contact Sent", `Emergency alert sent to ${contact.name}`);
  };

  const handleCancelSOS = () => {
    Alert.alert(
      "Cancel SOS",
      "Are you sure you want to cancel the SOS alert?",
      [
        { text: "Keep Active", style: "cancel" },
        {
          text: "Cancel SOS",
          onPress: () => {
            setSOSActive(false);
            setEmergencyType(null);
          },
          style: "destructive",
        },
      ]
    );
  };

  if (sosActive) {
    return (
      <ScreenContainer className="p-6 bg-error/5">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 gap-6 items-center justify-center">
            {/* Active SOS Status */}
            <View className="w-24 h-24 bg-error rounded-full items-center justify-center animate-pulse">
              <Text className="text-5xl">🚨</Text>
            </View>

            <View className="items-center gap-2">
              <Text className="text-2xl font-bold text-error">SOS ACTIVE</Text>
              <Text className="text-base text-foreground text-center">
                Emergency services have been alerted
              </Text>
              <Text className="text-sm text-muted text-center">
                Your location is being shared with emergency contacts
              </Text>
            </View>

            {/* Emergency Type */}
            <View className="w-full bg-background border border-border rounded-lg p-4 gap-2">
              <Text className="text-sm text-muted">Emergency Type</Text>
              <Text className="text-lg font-semibold text-foreground capitalize">{emergencyType}</Text>
            </View>

            {/* Location Sharing */}
            <View className="w-full bg-background border border-border rounded-lg p-4 gap-2">
              <Text className="text-sm text-muted">Your Location</Text>
              <Text className="text-foreground font-semibold">📍 40.7128° N, 74.0060° W</Text>
              <Text className="text-xs text-muted">Sharing with emergency services & trusted contacts</Text>
            </View>

            {/* Contacted Parties */}
            <View className="w-full gap-3">
              <Text className="text-sm font-semibold text-foreground">Contacted</Text>

              {/* Emergency Services */}
              <View className="bg-success/10 border border-success rounded-lg p-4 flex-row items-center gap-3">
                <View className="w-10 h-10 bg-success rounded-full items-center justify-center">
                  <Text className="text-lg">🚑</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">Emergency Services</Text>
                  <Text className="text-xs text-muted">Alerted • ETA 5 mins</Text>
                </View>
                <Text className="text-success">✓</Text>
              </View>

              {/* Trusted Contacts */}
              {trustedContacts.slice(0, 2).map((contact) => (
                <View
                  key={contact.id}
                  className="bg-background border border-border rounded-lg p-4 flex-row items-center gap-3"
                >
                  <Text className="text-2xl">{contact.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">{contact.name}</Text>
                    <Text className="text-xs text-muted">Notified</Text>
                  </View>
                  <Text className="text-success">✓</Text>
                </View>
              ))}
            </View>

            {/* Driver Alert */}
            <View className="w-full bg-warning/10 border border-warning rounded-lg p-4 gap-2">
              <Text className="text-sm font-semibold text-warning">Driver Notified</Text>
              <Text className="text-xs text-muted">Your driver has been alerted of the emergency</Text>
            </View>

            {/* Cancel SOS Button */}
            <TouchableOpacity
              className="w-full bg-error rounded-lg p-4 items-center mt-auto"
              onPress={handleCancelSOS}
            >
              <Text className="text-background font-bold text-lg">Cancel SOS Alert</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Emergency SOS</Text>
            <Text className="text-sm text-muted">Quick access to emergency services and trusted contacts</Text>
          </View>

          {/* Emergency Type Selection */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">What's happening?</Text>
            {emergencyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                className={`border-2 rounded-lg p-4 items-center gap-2 ${
                  emergencyType === type.id
                    ? "bg-error/10 border-error"
                    : "bg-surface border-border active:bg-surface/80"
                }`}
                onPress={() => setEmergencyType(type.id as any)}
              >
                <Text className="text-3xl">{type.icon}</Text>
                <Text className={`font-semibold ${emergencyType === type.id ? "text-error" : "text-foreground"}`}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trusted Contacts */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Quick Contact</Text>
            {trustedContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                className="bg-surface border border-border rounded-lg p-4 flex-row items-center gap-3 active:bg-surface/80"
                onPress={() => handleContactTrusted(contact)}
              >
                <Text className="text-2xl">{contact.icon}</Text>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">{contact.name}</Text>
                  <Text className="text-xs text-muted">{contact.phone}</Text>
                </View>
                <Text className="text-primary">→</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Safety Tips */}
          <View className="bg-primary/5 border border-primary/20 rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-foreground">Safety Tips</Text>
            <Text className="text-xs text-muted">• Keep your phone charged</Text>
            <Text className="text-xs text-muted">• Update trusted contacts regularly</Text>
            <Text className="text-xs text-muted">• Share your ride with contacts before traveling</Text>
          </View>

          {/* SOS Button */}
          <TouchableOpacity
            className="bg-error rounded-lg p-6 items-center gap-2 mt-auto active:bg-error/90"
            onPress={handleSOSPress}
          >
            <Text className="text-4xl">🚨</Text>
            <Text className="text-xl font-bold text-background">TRIGGER SOS</Text>
            <Text className="text-xs text-background/80">Hold to activate emergency alert</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
