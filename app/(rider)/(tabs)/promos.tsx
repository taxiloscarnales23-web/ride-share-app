import { ScrollView, Text, View, TextInput, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface PromoCode {
  id: number;
  code: string;
  description: string;
  discount: string;
  minRide: string;
  expiryDate: string;
  isActive: boolean;
}

export default function PromosScreen() {
  const colors = useColors();
  const [promoCode, setPromoCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<PromoCode | null>(null);

  const availablePromos: PromoCode[] = [
    {
      id: 1,
      code: "WELCOME20",
      description: "20% off your first ride",
      discount: "20%",
      minRide: "No minimum",
      expiryDate: "Mar 31, 2026",
      isActive: true,
    },
    {
      id: 2,
      code: "SAVE10",
      description: "$10 off rides over $50",
      discount: "$10",
      minRide: "$50",
      expiryDate: "Apr 15, 2026",
      isActive: true,
    },
    {
      id: 3,
      code: "WEEKEND15",
      description: "15% off weekend rides",
      discount: "15%",
      minRide: "No minimum",
      expiryDate: "Apr 30, 2026",
      isActive: true,
    },
    {
      id: 4,
      code: "FRIEND25",
      description: "Refer a friend and get $25",
      discount: "$25",
      minRide: "No minimum",
      expiryDate: "May 31, 2026",
      isActive: true,
    },
  ];

  const handleApplyCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert("Error", "Please enter a promo code");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const found = availablePromos.find(
      (p) => p.code.toUpperCase() === promoCode.toUpperCase() && p.isActive
    );

    if (found) {
      setAppliedCode(found);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", `Promo code "${found.code}" applied!`);
      setPromoCode("");
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid", "Promo code not found or expired");
    }
  };

  const handleRemoveCode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAppliedCode(null);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Promo Codes</Text>
            <Text className="text-muted">Save money on your rides</Text>
          </View>

          {/* Applied Code */}
          {appliedCode && (
            <View className="bg-success/10 border-2 border-success rounded-2xl p-4 gap-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-success mb-1">ACTIVE CODE</Text>
                  <Text className="text-2xl font-bold text-success">{appliedCode.code}</Text>
                  <Text className="text-sm text-success mt-2">{appliedCode.description}</Text>
                </View>
                <Pressable onPress={handleRemoveCode}>
                  <Text className="text-2xl">✕</Text>
                </Pressable>
              </View>
              <View className="h-px bg-success/30" />
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-success/70">Discount</Text>
                  <Text className="text-lg font-bold text-success">{appliedCode.discount}</Text>
                </View>
                <View>
                  <Text className="text-xs text-success/70">Expires</Text>
                  <Text className="text-sm font-semibold text-success">{appliedCode.expiryDate}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Code Input */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Have a code?</Text>
            <View className="flex-row gap-2">
              <TextInput
                placeholder="Enter promo code"
                value={promoCode}
                onChangeText={(text) => setPromoCode(text.toUpperCase())}
                className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-foreground font-semibold"
                placeholderTextColor={colors.muted}
              />
              <Pressable
                onPress={handleApplyCode}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View
                  className="px-4 py-3 rounded-lg items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-bold">Apply</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Available Promos */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Available Offers</Text>

            {availablePromos.map((promo) => (
              <Pressable
                key={promo.id}
                onPress={() => {
                  setPromoCode(promo.code);
                }}
              >
                <View className="bg-surface border border-border rounded-2xl p-4 gap-2">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-primary">{promo.discount}</Text>
                      <Text className="text-sm text-foreground mt-1">{promo.description}</Text>
                    </View>
                    <View className="bg-primary/10 rounded-lg px-3 py-1">
                      <Text className="text-xs font-mono text-primary">{promo.code}</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between text-xs">
                    <Text className="text-muted">Min: {promo.minRide}</Text>
                    <Text className="text-muted">Expires: {promo.expiryDate}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Terms */}
          <View className="bg-primary/5 rounded-lg p-3">
            <Text className="text-xs text-muted text-center">
              Promo codes can only be used once per account. Some codes may have restrictions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
