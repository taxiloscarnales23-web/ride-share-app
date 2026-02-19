import { ScrollView, Text, View, Pressable, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface PooledRide {
  id: number;
  rider: string;
  pickup: string;
  dropoff: string;
  discount: string;
  savings: string;
  pickupTime: string;
  status: "available" | "matched" | "in_progress" | "completed";
  avatar: string;
}

export default function RidePoolingScreen() {
  const colors = useColors();
  const [pooledRides, setPooledRides] = useState<PooledRide[]>([
    {
      id: 1,
      rider: "Sarah M.",
      pickup: "123 Main St",
      dropoff: "456 Oak Ave",
      discount: "15%",
      savings: "$2.50",
      pickupTime: "In 5 min",
      status: "available",
      avatar: "👩",
    },
    {
      id: 2,
      rider: "James K.",
      pickup: "789 Pine Rd",
      dropoff: "321 Elm St",
      discount: "12%",
      savings: "$1.80",
      pickupTime: "In 8 min",
      status: "available",
      avatar: "👨",
    },
    {
      id: 3,
      rider: "Emma L.",
      pickup: "555 Maple Dr",
      dropoff: "999 Cedar Ln",
      discount: "18%",
      savings: "$3.20",
      pickupTime: "In 3 min",
      status: "matched",
      avatar: "👩‍🦰",
    },
  ]);

  const handleJoinPool = async (id: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Join Ride Pool",
      "You'll save money by sharing this ride. Confirm to join?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Join Pool",
          onPress: () => {
            setPooledRides(
              pooledRides.map((r) =>
                r.id === id ? { ...r, status: "matched" as const } : r
              )
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", "You've joined the ride pool!");
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success/10 border-success";
      case "matched":
        return "bg-primary/10 border-primary";
      case "in_progress":
        return "bg-warning/10 border-warning";
      case "completed":
        return "bg-muted/10 border-muted";
      default:
        return "bg-surface border-border";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return { text: "Available", color: "text-success" };
      case "matched":
        return { text: "Matched", color: "text-primary" };
      case "in_progress":
        return { text: "In Progress", color: "text-warning" };
      case "completed":
        return { text: "Completed", color: "text-muted" };
      default:
        return { text: "Unknown", color: "text-muted" };
    }
  };

  const availableRides = pooledRides.filter((r) => r.status === "available");
  const matchedRides = pooledRides.filter((r) => r.status === "matched");

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Ride Pooling</Text>
            <Text className="text-muted">Share rides and save money</Text>
          </View>

          {/* Savings Card */}
          <View
            className="rounded-2xl p-6 gap-3"
            style={{ backgroundColor: colors.success }}
          >
            <Text className="text-white text-sm font-semibold">Average Savings</Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-4xl font-bold text-white">18%</Text>
              <Text className="text-white">per ride</Text>
            </View>
            <Text className="text-white/80 text-xs">
              Save up to 20% by pooling with other riders
            </Text>
          </View>

          {/* Available Pools */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">
              Available Pools ({availableRides.length})
            </Text>

            {availableRides.length === 0 ? (
              <View className="bg-surface rounded-lg p-6 items-center">
                <Text className="text-3xl mb-2">🚗</Text>
                <Text className="text-foreground font-semibold">No available pools</Text>
                <Text className="text-muted text-center text-sm mt-2">
                  Check back soon for ride pooling opportunities
                </Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={availableRides}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View
                    className={`border-2 rounded-2xl p-4 gap-3 mb-2 ${getStatusColor(item.status)}`}
                  >
                    {/* Rider Info */}
                    <View className="flex-row justify-between items-start">
                      <View className="flex-row gap-3 flex-1">
                        <Text className="text-3xl">{item.avatar}</Text>
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-foreground">{item.rider}</Text>
                          <Text className="text-xs text-muted mt-1">{item.pickupTime}</Text>
                        </View>
                      </View>
                      <View className="bg-success rounded-full px-3 py-1">
                        <Text className="text-white text-xs font-bold">{item.discount}</Text>
                      </View>
                    </View>

                    {/* Route */}
                    <View className="gap-2">
                      <View className="flex-row gap-2">
                        <Text className="text-lg">📍</Text>
                        <Text className="text-xs text-muted flex-1">{item.pickup}</Text>
                      </View>
                      <View className="flex-row gap-2">
                        <Text className="text-lg">🎯</Text>
                        <Text className="text-xs text-muted flex-1">{item.dropoff}</Text>
                      </View>
                    </View>

                    {/* Savings and Button */}
                    <View className="flex-row justify-between items-center pt-2 border-t border-border">
                      <View>
                        <Text className="text-xs text-muted">You save</Text>
                        <Text className="text-sm font-bold text-success">{item.savings}</Text>
                      </View>
                      <Pressable
                        onPress={() => handleJoinPool(item.id)}
                        style={({ pressed }) => [
                          {
                            transform: [{ scale: pressed ? 0.97 : 1 }],
                            opacity: pressed ? 0.9 : 1,
                          },
                        ]}
                      >
                        <View
                          className="rounded-lg px-4 py-2"
                          style={{ backgroundColor: colors.success }}
                        >
                          <Text className="text-white text-sm font-bold">Join Pool</Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          {/* Your Pools */}
          {matchedRides.length > 0 && (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">Your Pools</Text>

              <FlatList
                scrollEnabled={false}
                data={matchedRides}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-primary/10 border-2 border-primary rounded-lg p-4 gap-2 mb-2">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row gap-2 items-center flex-1">
                        <Text className="text-2xl">{item.avatar}</Text>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-foreground">{item.rider}</Text>
                          <Text className="text-xs text-muted">{getStatusBadge(item.status).text}</Text>
                        </View>
                      </View>
                      <Text className="text-sm font-bold text-primary">{item.savings}</Text>
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          {/* Benefits */}
          <View className="bg-primary/10 rounded-lg p-4 gap-3">
            <Text className="text-sm font-semibold text-primary">✨ Benefits of Pooling</Text>
            <View className="gap-2">
              <Text className="text-xs text-primary">• Save 10-20% on every ride</Text>
              <Text className="text-xs text-primary">• Reduce environmental impact</Text>
              <Text className="text-xs text-primary">• Meet other riders in your area</Text>
              <Text className="text-xs text-primary">• Drivers earn more per trip</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
