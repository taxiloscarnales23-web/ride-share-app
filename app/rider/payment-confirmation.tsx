import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Payment Confirmation Screen
 * Displays fare breakdown and payment options (cash-only)
 */

export default function PaymentConfirmationScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTipOptions, setShowTipOptions] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

  const baseFare = 12.5;
  const taxes = 1.25;
  const tip = selectedTip || 0;
  const total = baseFare + taxes + tip;

  const tipOptions = [0, 1, 2, 3, 5];

  const handleConfirmPayment = async () => {
    try {
      setError("");
      setLoading(true);

      // Mock: Confirm payment
      console.log("[PaymentConfirmation] Confirming payment:", { baseFare, taxes, tip, total });

      // In production, call API: await api.rides.confirmPayment({ rideId, tip })
      alert("Payment confirmed! Ride starting...");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Payment Details</Text>
            <Text className="text-base text-muted">Cash payment at ride completion</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Fare Breakdown Card */}
          <View className="bg-surface border border-border rounded-lg p-6 gap-4">
            {/* Base Fare */}
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground">Base Fare</Text>
              <Text className="text-foreground font-semibold">${baseFare.toFixed(2)}</Text>
            </View>

            {/* Distance */}
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground">Distance (3.2 km)</Text>
              <Text className="text-foreground font-semibold">Included</Text>
            </View>

            {/* Divider */}
            <View className="h-px bg-border" />

            {/* Taxes */}
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground">Taxes & Fees</Text>
              <Text className="text-foreground font-semibold">${taxes.toFixed(2)}</Text>
            </View>

            {/* Tip */}
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground">Tip</Text>
              <Text className="text-foreground font-semibold">${tip.toFixed(2)}</Text>
            </View>

            {/* Divider */}
            <View className="h-px bg-border" />

            {/* Total */}
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-foreground">Total</Text>
              <Text className="text-2xl font-bold text-primary">${total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Tip Selection */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-foreground">Add a Tip</Text>
              {selectedTip !== null && (
                <TouchableOpacity onPress={() => setSelectedTip(null)}>
                  <Text className="text-xs text-primary">Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row gap-2 flex-wrap">
              {tipOptions.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  className={`flex-1 min-w-[80px] rounded-lg p-3 items-center border ${
                    selectedTip === amount
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                  onPress={() => setSelectedTip(amount)}
                  disabled={loading}
                >
                  <Text
                    className={`font-semibold ${
                      selectedTip === amount ? "text-background" : "text-foreground"
                    }`}
                  >
                    ${amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Payment Method</Text>
            <View className="bg-primary/10 border border-primary rounded-lg p-4 flex-row items-center gap-3">
              <Text className="text-2xl">💵</Text>
              <View className="flex-1">
                <Text className="text-foreground font-semibold">Cash</Text>
                <Text className="text-xs text-muted">Pay driver at ride completion</Text>
              </View>
              <Text className="text-primary">✓</Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg p-4 items-center mt-auto"
            onPress={handleConfirmPayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <View className="items-center">
                <Text className="text-background font-semibold text-lg">Confirm Payment</Text>
                <Text className="text-background/80 text-xs">Total: ${total.toFixed(2)}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View className="bg-surface border border-border rounded-lg p-4">
            <Text className="text-xs text-muted text-center">
              You'll pay the driver in cash at the end of your ride. Keep your receipt for your records.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
