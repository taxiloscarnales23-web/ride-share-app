import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface SurgePricingArea {
  id: number;
  area: string;
  multiplier: string;
  reason: string;
  status: "active" | "inactive";
  icon: string;
}

export default function SurgePricingScreen() {
  const colors = useColors();
  const [surgePricingAreas] = useState<SurgePricingArea[]>([
    {
      id: 1,
      area: "Downtown District",
      multiplier: "1.5x",
      reason: "Rush hour - High demand",
      status: "active",
      icon: "📍",
    },
    {
      id: 2,
      area: "Airport Terminal",
      multiplier: "1.3x",
      reason: "Peak travel time",
      status: "active",
      icon: "✈️",
    },
    {
      id: 3,
      area: "Convention Center",
      multiplier: "1.2x",
      reason: "Event in progress",
      status: "active",
      icon: "🎪",
    },
    {
      id: 4,
      area: "Shopping Mall",
      multiplier: "1.0x",
      reason: "Normal pricing",
      status: "inactive",
      icon: "🛍️",
    },
  ]);

  const activeSurgeAreas = surgePricingAreas.filter((a) => a.status === "active");

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Surge Pricing</Text>
            <Text className="text-muted">See current pricing multipliers</Text>
          </View>

          {/* Alert Banner */}
          {activeSurgeAreas.length > 0 && (
            <View className="bg-warning/10 border-2 border-warning rounded-lg p-4 gap-2">
              <View className="flex-row gap-2 items-center">
                <Text className="text-xl">⚠️</Text>
                <Text className="text-sm font-semibold text-warning flex-1">
                  {activeSurgeAreas.length} area{activeSurgeAreas.length !== 1 ? "s" : ""} with surge pricing
                </Text>
              </View>
              <Text className="text-xs text-warning">
                Fares are higher than usual in these areas due to high demand
              </Text>
            </View>
          )}

          {/* Active Surge Areas */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Active Surge Areas</Text>

            {activeSurgeAreas.length === 0 ? (
              <View className="bg-surface rounded-lg p-6 items-center">
                <Text className="text-3xl mb-2">✓</Text>
                <Text className="text-foreground font-semibold">No surge pricing</Text>
                <Text className="text-muted text-center text-sm mt-2">
                  Normal pricing is active in all areas
                </Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={activeSurgeAreas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View className="bg-warning/10 border-2 border-warning rounded-lg p-4 gap-3 mb-2">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-row gap-3 flex-1">
                          <Text className="text-3xl">{item.icon}</Text>
                          <View className="flex-1">
                            <Text className="text-sm font-bold text-foreground">{item.area}</Text>
                            <Text className="text-xs text-muted mt-1">{item.reason}</Text>
                          </View>
                        </View>
                        <View
                          className="rounded-lg px-3 py-1"
                          style={{ backgroundColor: colors.warning }}
                        >
                          <Text className="text-white font-bold text-sm">{item.multiplier}</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>

          {/* All Areas */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">All Areas</Text>

            <FlatList
              scrollEnabled={false}
              data={surgePricingAreas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View
                  className={`rounded-lg p-4 gap-2 mb-2 flex-row justify-between items-center ${
                    item.status === "active"
                      ? "bg-warning/5 border border-warning"
                      : "bg-surface border border-border"
                  }`}
                >
                  <View className="flex-row gap-3 flex-1">
                    <Text className="text-2xl">{item.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{item.area}</Text>
                      <Text className="text-xs text-muted">{item.reason}</Text>
                    </View>
                  </View>
                  <View className="items-center">
                    <Text
                      className={`text-sm font-bold ${
                        item.status === "active" ? "text-warning" : "text-muted"
                      }`}
                    >
                      {item.multiplier}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {item.status === "active" ? "Active" : "Normal"}
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>

          {/* How Surge Pricing Works */}
          <View className="bg-primary/10 rounded-lg p-4 gap-3">
            <Text className="text-sm font-semibold text-primary">📊 How Surge Pricing Works</Text>
            <View className="gap-2">
              <Text className="text-xs text-primary">
                • Prices increase when demand exceeds available drivers
              </Text>
              <Text className="text-xs text-primary">
                • Higher fares attract more drivers to serve the area
              </Text>
              <Text className="text-xs text-primary">
                • Surge pricing is temporary and adjusts in real-time
              </Text>
              <Text className="text-xs text-primary">
                • You'll see the multiplier before confirming your ride
              </Text>
            </View>
          </View>

          {/* Tips */}
          <View className="bg-surface rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-foreground">💡 Pro Tips</Text>
            <Text className="text-xs text-muted">
              • Wait a few minutes if surge pricing is active - prices usually drop quickly
            </Text>
            <Text className="text-xs text-muted">
              • Schedule rides in advance to lock in current prices
            </Text>
            <Text className="text-xs text-muted">
              • Use shared rides (pooling) to get discounts during surge times
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
