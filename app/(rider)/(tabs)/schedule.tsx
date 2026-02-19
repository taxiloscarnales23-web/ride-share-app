import { ScrollView, Text, View, Pressable, Alert, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface ScheduledRide {
  id: number;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledTime: string;
  estimatedFare: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
}

export default function ScheduleScreen() {
  const colors = useColors();
  const [scheduledRides, setScheduledRides] = useState<ScheduledRide[]>([
    {
      id: 1,
      pickupAddress: "123 Main St, Downtown",
      dropoffAddress: "456 Oak Ave, Airport",
      scheduledTime: "Tomorrow at 8:00 AM",
      estimatedFare: "$28.50",
      status: "scheduled",
    },
    {
      id: 2,
      pickupAddress: "789 Pine Rd, Home",
      dropoffAddress: "321 Elm St, Office",
      scheduledTime: "Feb 21, 2026 at 9:30 AM",
      estimatedFare: "$15.75",
      status: "confirmed",
    },
  ]);

  const handleScheduleRide = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Schedule Ride",
      "Select pickup location, dropoff location, and preferred time",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            Alert.alert("Ride Scheduled", "Your ride has been scheduled successfully!");
          },
        },
      ]
    );
  };

  const handleCancelRide = async (id: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Cancel Ride",
      "Are you sure you want to cancel this scheduled ride?",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Cancel Ride",
          style: "destructive",
          onPress: () => {
            setScheduledRides(scheduledRides.filter((r) => r.id !== id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-warning/10 border-warning";
      case "confirmed":
        return "bg-success/10 border-success";
      case "completed":
        return "bg-primary/10 border-primary";
      case "cancelled":
        return "bg-error/10 border-error";
      default:
        return "bg-surface border-border";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Scheduled Rides</Text>
            <Text className="text-muted">Book rides in advance</Text>
          </View>

          {/* Schedule New Ride Button */}
          <Pressable
            onPress={handleScheduleRide}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View
              className="rounded-2xl p-4 items-center justify-center flex-row gap-3"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-2xl">📅</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-white">Schedule a New Ride</Text>
                <Text className="text-xs text-white/80">Book a ride for later</Text>
              </View>
              <Text className="text-xl text-white">→</Text>
            </View>
          </Pressable>

          {/* Scheduled Rides List */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Upcoming Rides</Text>

            {scheduledRides.length === 0 ? (
              <View className="bg-surface rounded-lg p-6 items-center">
                <Text className="text-3xl mb-2">📭</Text>
                <Text className="text-foreground font-semibold">No scheduled rides</Text>
                <Text className="text-muted text-center text-sm mt-2">
                  Schedule a ride in advance to see it here
                </Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={scheduledRides}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View
                    className={`border-2 rounded-2xl p-4 gap-3 ${getStatusColor(item.status)}`}
                  >
                    {/* Status Badge */}
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-xs font-semibold text-muted mb-1">PICKUP</Text>
                        <Text className="text-sm font-semibold text-foreground">
                          {item.pickupAddress}
                        </Text>
                      </View>
                      <View className="bg-primary/20 rounded-full px-3 py-1">
                        <Text className="text-xs font-bold text-primary">
                          {getStatusText(item.status)}
                        </Text>
                      </View>
                    </View>

                    {/* Arrow */}
                    <View className="flex-row items-center gap-2">
                      <View className="flex-1 h-px bg-border" />
                      <Text className="text-lg">↓</Text>
                      <View className="flex-1 h-px bg-border" />
                    </View>

                    {/* Dropoff */}
                    <View>
                      <Text className="text-xs font-semibold text-muted mb-1">DROPOFF</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {item.dropoffAddress}
                      </Text>
                    </View>

                    {/* Details */}
                    <View className="flex-row justify-between pt-2 border-t border-border">
                      <View>
                        <Text className="text-xs text-muted">Time</Text>
                        <Text className="text-sm font-semibold text-foreground">
                          {item.scheduledTime}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-xs text-muted">Est. Fare</Text>
                        <Text className="text-sm font-bold text-primary">{item.estimatedFare}</Text>
                      </View>
                      {item.status === "scheduled" && (
                        <Pressable
                          onPress={() => handleCancelRide(item.id)}
                          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        >
                          <View className="items-center">
                            <Text className="text-xs text-error">Cancel</Text>
                            <Text className="text-lg">✕</Text>
                          </View>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          {/* Tips */}
          <View className="bg-primary/10 rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-primary">💡 Scheduling Tips</Text>
            <Text className="text-xs text-primary">• Schedule rides at least 15 minutes in advance</Text>
            <Text className="text-xs text-primary">• Prices may vary based on demand at scheduled time</Text>
            <Text className="text-xs text-primary">• You can modify or cancel up to 30 minutes before pickup</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
