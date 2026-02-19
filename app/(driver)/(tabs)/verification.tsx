import { ScrollView, Text, View, Pressable, Alert, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface VerificationItem {
  id: number;
  title: string;
  description: string;
  status: "pending" | "verified" | "rejected";
  icon: string;
}

export default function VerificationScreen() {
  const colors = useColors();
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([
    {
      id: 1,
      title: "Driver License",
      description: "Valid driver license with clear photo",
      status: "verified",
      icon: "🪪",
    },
    {
      id: 2,
      title: "Vehicle Registration",
      description: "Current vehicle registration document",
      status: "verified",
      icon: "📋",
    },
    {
      id: 3,
      title: "Insurance",
      description: "Valid vehicle insurance policy",
      status: "pending",
      icon: "🛡️",
    },
    {
      id: 4,
      title: "Background Check",
      description: "Criminal background verification",
      status: "pending",
      icon: "🔍",
    },
  ]);

  const handleUploadDocument = async (itemId: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Upload Document",
      "Select a document from your device or take a photo",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Take Photo",
          onPress: () => {
            setVerificationItems(
              verificationItems.map((item) =>
                item.id === itemId ? { ...item, status: "verified" as const } : item
              )
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", "Document uploaded and verified!");
          },
        },
        {
          text: "Choose File",
          onPress: () => {
            setVerificationItems(
              verificationItems.map((item) =>
                item.id === itemId ? { ...item, status: "verified" as const } : item
              )
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", "Document uploaded and verified!");
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-success/10 border-success";
      case "pending":
        return "bg-warning/10 border-warning";
      case "rejected":
        return "bg-error/10 border-error";
      default:
        return "bg-surface border-border";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return { text: "✓ Verified", color: "text-success" };
      case "pending":
        return { text: "⏳ Pending", color: "text-warning" };
      case "rejected":
        return { text: "✕ Rejected", color: "text-error" };
      default:
        return { text: "Unknown", color: "text-muted" };
    }
  };

  const verifiedCount = verificationItems.filter((v) => v.status === "verified").length;
  const totalCount = verificationItems.length;
  const completionPercentage = Math.round((verifiedCount / totalCount) * 100);

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Verification</Text>
            <Text className="text-muted">Complete your driver profile</Text>
          </View>

          {/* Progress Card */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm font-semibold text-foreground">Verification Progress</Text>
                <Text className="text-2xl font-bold text-primary mt-1">
                  {verifiedCount}/{totalCount}
                </Text>
              </View>
              <View className="items-center">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-2xl font-bold text-white">{completionPercentage}%</Text>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="h-2 bg-border rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${completionPercentage}%`,
                  backgroundColor: colors.success,
                }}
              />
            </View>

            {completionPercentage === 100 ? (
              <View className="bg-success/10 rounded-lg p-3 flex-row gap-2 items-center">
                <Text className="text-lg">✓</Text>
                <Text className="text-sm font-semibold text-success">All documents verified!</Text>
              </View>
            ) : (
              <Text className="text-xs text-muted">
                Complete all verifications to start accepting rides
              </Text>
            )}
          </View>

          {/* Verification Items */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Required Documents</Text>

            <FlatList
              scrollEnabled={false}
              data={verificationItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className={`border-2 rounded-2xl p-4 gap-3 mb-2 ${getStatusColor(item.status)}`}>
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 flex-row gap-3">
                      <Text className="text-3xl">{item.icon}</Text>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground">{item.title}</Text>
                        <Text className="text-xs text-muted mt-1">{item.description}</Text>
                      </View>
                    </View>
                    <Text className={`text-xs font-bold ${getStatusBadge(item.status).color}`}>
                      {getStatusBadge(item.status).text}
                    </Text>
                  </View>

                  {item.status !== "verified" && (
                    <Pressable
                      onPress={() => handleUploadDocument(item.id)}
                      style={({ pressed }) => [
                        {
                          transform: [{ scale: pressed ? 0.97 : 1 }],
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                    >
                      <View
                        className="rounded-lg py-2 items-center"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="text-white text-sm font-bold">Upload Document</Text>
                      </View>
                    </Pressable>
                  )}
                </View>
              )}
            />
          </View>

          {/* Verification Tips */}
          <View className="bg-primary/10 rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-primary">📋 Verification Tips</Text>
            <Text className="text-xs text-primary">• Use clear, well-lit photos of documents</Text>
            <Text className="text-xs text-primary">• Ensure all text is readable and not blurry</Text>
            <Text className="text-xs text-primary">• Documents must be current and valid</Text>
            <Text className="text-xs text-primary">• Verification typically takes 24-48 hours</Text>
          </View>

          {/* Support */}
          <View className="bg-surface border border-border rounded-lg p-4 items-center">
            <Text className="text-sm text-muted text-center mb-2">
              Having trouble with verification?
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert("Support", "Contact our support team for assistance");
              }}
            >
              <Text className="text-primary font-bold">Contact Support</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
