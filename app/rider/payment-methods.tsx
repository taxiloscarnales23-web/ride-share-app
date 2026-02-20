import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";

interface PaymentMethod {
  id: string;
  type: "cash" | "card" | "wallet";
  name: string;
  icon: string;
  description: string;
  isDefault: boolean;
  lastUsed?: Date;
  cardLast4?: string;
}

export default function PaymentMethodsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>("cash");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "cash",
      type: "cash",
      name: "Cash Payment",
      icon: "💵",
      description: "Pay with cash at the end of your ride",
      isDefault: true,
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: "card-1",
      type: "card",
      name: "Visa Card",
      icon: "💳",
      description: "Visa ending in 4242",
      isDefault: false,
      cardLast4: "4242",
      lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      id: "wallet",
      type: "wallet",
      name: "Wallet Balance",
      icon: "👛",
      description: "Use your app wallet balance",
      isDefault: false,
      lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
  ]);

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    );
  };

  const handleAddPaymentMethod = () => {
    // Navigate to add payment method screen
    router.push("/rider/payment-confirmation");
  };

  const formatLastUsed = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <Pressable
      onPress={() => handleSelectMethod(item.id)}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        className={`rounded-xl p-4 mb-3 border-2 flex-row items-center gap-4 ${
          item.isDefault ? "border-primary" : "border-border"
        }`}
        style={{
          backgroundColor: item.isDefault ? colors.primary + "10" : colors.surface,
          borderColor: item.isDefault ? colors.primary : colors.border,
        }}
      >
        {/* Icon */}
        <Text className="text-3xl">{item.icon}</Text>

        {/* Details */}
        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">{item.name}</Text>
            {item.isDefault && (
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-xs font-semibold text-background">Default</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-muted">{item.description}</Text>
          {item.lastUsed && (
            <Text className="text-xs text-muted">
              Last used: {formatLastUsed(item.lastUsed)}
            </Text>
          )}
        </View>

        {/* Radio Button */}
        <View
          className="w-6 h-6 rounded-full border-2 items-center justify-center"
          style={{
            borderColor: item.isDefault ? colors.primary : colors.border,
            backgroundColor: item.isDefault ? colors.primary : "transparent",
          }}
        >
          {item.isDefault && <Text className="text-background font-bold">✓</Text>}
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Payment Methods</Text>
            <Text className="text-base text-muted">
              Choose your preferred payment method
            </Text>
          </View>

          {/* Payment Methods List */}
          <View>
            <Text className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
              Saved Methods
            </Text>
            <FlatList
              data={paymentMethods}
              renderItem={renderPaymentMethod}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Add New Payment Method */}
          <Pressable
            onPress={handleAddPaymentMethod}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                borderColor: colors.primary,
                borderWidth: 2,
                borderStyle: "dashed",
              },
              {
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                alignItems: "center",
              },
            ]}
          >
            <Text className="text-base font-semibold" style={{ color: colors.primary }}>
              + Add New Card
            </Text>
          </Pressable>

          {/* Security Info */}
          <View
            className="rounded-xl p-4 gap-2"
            style={{ backgroundColor: colors.success + "10" }}
          >
            <Text className="text-sm font-semibold text-foreground">🔒 Secure Payment</Text>
            <Text className="text-sm text-muted leading-relaxed">
              Your payment information is encrypted and stored securely. We never store your
              full card details.
            </Text>
          </View>

          {/* Confirm Button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.8 : 1,
                backgroundColor: colors.primary,
              },
              {
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                alignItems: "center",
              },
            ]}
          >
            <Text className="text-base font-semibold text-background">Confirm Selection</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
