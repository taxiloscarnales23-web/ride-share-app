import { ScrollView, Text, View, Pressable, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";

export default function PaymentScreen() {
  const colors = useColors();
  const router = useRouter();
  const [cashAmount, setCashAmount] = useState("12.50");
  const [tipAmount, setTipAmount] = useState("0.00");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const baseFare = 12.50;
  const totalAmount = baseFare + parseFloat(tipAmount || "0");

  const handleTipPreset = (tip: number) => {
    setTipAmount(tip.toFixed(2));
  };

  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Payment Confirmed", `Total: $${totalAmount.toFixed(2)}\n\nThank you for riding with us!`);

      // Navigate back to home
      router.replace("/(rider)/(tabs)");
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to confirm payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Payment</Text>
            <Text className="text-muted">Ride completed successfully</Text>
          </View>

          {/* Fare Breakdown */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-muted">Base Fare</Text>
              <Text className="font-semibold text-foreground">${baseFare.toFixed(2)}</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between items-center">
              <Text className="text-muted">Tip</Text>
              <Text className="font-semibold text-foreground">${parseFloat(tipAmount || "0").toFixed(2)}</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-foreground">Total</Text>
              <Text className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* Cash Payment Info */}
          <View className="bg-primary/10 rounded-lg p-4 border border-primary">
            <Text className="text-sm font-semibold text-primary mb-1">💵 Cash Payment</Text>
            <Text className="text-xs text-primary">Please pay the driver ${totalAmount.toFixed(2)} in cash</Text>
          </View>

          {/* Tip Options */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Add a Tip</Text>
            <View className="flex-row gap-2">
              {[0, 1, 2, 5].map((tip) => (
                <Pressable
                  key={tip}
                  onPress={() => handleTipPreset(tip)}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View
                    className={`flex-1 py-2 px-3 rounded-lg border ${
                      parseFloat(tipAmount || "0") === tip
                        ? "border-primary bg-primary/20"
                        : "border-border bg-surface"
                    }`}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        parseFloat(tipAmount || "0") === tip ? "text-primary" : "text-foreground"
                      }`}
                    >
                      ${tip}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-muted">Custom:</Text>
              <TextInput
                placeholder="0.00"
                value={tipAmount}
                onChangeText={setTipAmount}
                keyboardType="decimal-pad"
                className="flex-1 bg-surface border border-border rounded-lg p-2 text-foreground"
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>

          {/* Rating */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Rate Your Driver</Text>
            <View className="flex-row gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 1.1 : 1 }],
                    },
                  ]}
                >
                  <Text className="text-3xl">{star <= rating ? "⭐" : "☆"}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Feedback */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Feedback (Optional)</Text>
            <TextInput
              placeholder="Share your experience..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={3}
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor={colors.muted}
            />
          </View>

          {/* Confirm Button */}
          <Pressable
            onPress={handleConfirmPayment}
            disabled={isProcessing}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed && !isProcessing ? 0.97 : 1 }],
                opacity: isProcessing ? 0.6 : pressed ? 0.9 : 1,
              },
            ]}
          >
            <View
              className="rounded-full py-4 items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold text-lg">
                {isProcessing ? "Processing..." : "Confirm Payment"}
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
