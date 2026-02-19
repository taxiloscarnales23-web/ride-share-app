import { ScrollView, Text, View, Pressable, FlatList, ActivityIndicator, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import * as Haptics from "expo-haptics";

export default function DriverHomeScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  
  const driverProfile = trpc.drivers.getProfile.useQuery();
  const activeRides = trpc.rides.getActive.useQuery();
  const updateDriverMutation = trpc.drivers.updateProfile.useMutation();
  const acceptRideMutation = trpc.rides.accept.useMutation();

  const handleToggleOnline = async (value: boolean) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsOnline(value);
      
      await updateDriverMutation.mutateAsync({
        isOnline: value,
        currentLatitude: "40.7128",
        currentLongitude: "-74.0060",
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setIsOnline(!value);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleAcceptRide = async (rideId: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await acceptRideMutation.mutateAsync({ rideId });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Ride Accepted", "You've accepted a new ride!");
      activeRides.refetch();
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to accept ride");
    }
  };

  const renderRideCard = ({ item }: any) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="mb-3">
        <Text className="text-sm font-semibold text-foreground">{item.pickupAddress}</Text>
        <Text className="text-xs text-muted mt-1">→ {item.dropoffAddress}</Text>
      </View>
      
      <View className="flex-row justify-between items-center mb-3 py-2 border-t border-b border-border">
        <View>
          <Text className="text-xs text-muted">Estimated Fare</Text>
          <Text className="text-lg font-bold text-primary">${item.estimatedFare}</Text>
        </View>
        <View>
          <Text className="text-xs text-muted">Distance</Text>
          <Text className="text-lg font-bold text-foreground">{item.estimatedDistance}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => handleAcceptRide(item.id)}
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View className="bg-success rounded-lg py-3 items-center">
          <Text className="text-white font-bold">Accept Ride</Text>
        </View>
      </Pressable>
    </View>
  );

  if (driverProfile.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.warning} />
      </ScreenContainer>
    );
  }

  const rides = activeRides.data || [];

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Available Rides</Text>
            <Text className="text-sm text-muted">Welcome, {user?.name || "Driver"}</Text>
          </View>

          {/* Online Status */}
          <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
            <View>
              <Text className="text-sm font-semibold text-foreground">Online Status</Text>
              <Text className="text-xs text-muted mt-1">
                {isOnline ? "You're accepting rides" : "You're offline"}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={isOnline ? colors.primary : colors.muted}
            />
          </View>

          {/* Rides List */}
          {!isOnline ? (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-base text-muted text-center">Go online to start accepting rides</Text>
            </View>
          ) : rides.length === 0 ? (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-base text-muted text-center">No rides available right now</Text>
              <Text className="text-xs text-muted text-center mt-2">Check back soon for new ride requests</Text>
            </View>
          ) : (
            <View>
              <Text className="text-sm font-semibold text-foreground mb-3">{rides.length} Available Rides</Text>
              <FlatList
                data={rides}
                renderItem={renderRideCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
