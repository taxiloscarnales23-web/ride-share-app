import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Rider Home Screen
 * Shows booking button, recent rides, and saved locations
 */

export default function RiderHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [savedLocations] = useState([
    { id: 1, name: "Home", address: "123 Main St, Downtown", icon: "🏠" },
    { id: 2, name: "Work", address: "456 Oak Ave, Uptown", icon: "💼" },
    { id: 3, name: "Gym", address: "789 Fitness Blvd", icon: "🏋️" },
  ]);

  const [recentRides] = useState([
    {
      id: 1,
      driverName: "John Smith",
      from: "123 Main St",
      to: "456 Oak Ave",
      fare: "$12.50",
      rating: 4.8,
      date: "Today at 2:30 PM",
      status: "completed",
    },
    {
      id: 2,
      driverName: "Maria Garcia",
      from: "456 Oak Ave",
      to: "789 Park Ln",
      fare: "$8.75",
      rating: 5.0,
      date: "Yesterday at 5:15 PM",
      status: "completed",
    },
    {
      id: 3,
      driverName: "Ahmed Hassan",
      from: "789 Park Ln",
      to: "321 Center St",
      fare: "$15.25",
      rating: 4.7,
      date: "2 days ago",
      status: "completed",
    },
  ]);

  const handleBookRide = () => {
    router.push("/rider/book-ride");
  };

  const handleQuickBook = (location: any) => {
    router.push({
      pathname: "/rider/book-ride",
      params: { destination: location.address },
    });
  };

  const handleRideDetails = (rideId: number) => {
    console.log("[RiderHome] View ride details:", rideId);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-bold text-foreground">Welcome back!</Text>
              <Text className="text-base text-muted">Ready for a ride?</Text>
            </View>
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
              <Text className="text-2xl">👤</Text>
            </View>
          </View>

          {/* Book Ride Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg p-6 items-center gap-2 active:bg-primary/90"
            onPress={handleBookRide}
          >
            <Text className="text-4xl">🚗</Text>
            <Text className="text-lg font-bold text-background">Book a Ride Now</Text>
            <Text className="text-sm text-background/80">Get where you need to go</Text>
          </TouchableOpacity>

          {/* Saved Locations */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Quick Locations</Text>
            <FlatList
              data={savedLocations}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center gap-3 bg-surface border border-border rounded-lg p-4 mb-2 active:bg-surface/80"
                  onPress={() => handleQuickBook(item)}
                >
                  <Text className="text-2xl">{item.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">{item.name}</Text>
                    <Text className="text-xs text-muted">{item.address}</Text>
                  </View>
                  <Text className="text-muted">→</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Recent Rides */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-foreground">Recent Rides</Text>
              <TouchableOpacity>
                <Text className="text-xs text-primary font-semibold">View All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={recentRides}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-surface border border-border rounded-lg p-4 mb-2 gap-3 active:bg-surface/80"
                  onPress={() => handleRideDetails(item.id)}
                >
                  {/* Driver Info */}
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold">{item.driverName}</Text>
                      <Text className="text-xs text-muted mt-1">{item.date}</Text>
                    </View>
                    <View className="items-end gap-1">
                      <Text className="text-lg font-bold text-primary">{item.fare}</Text>
                      <Text className="text-xs text-muted">⭐ {item.rating}</Text>
                    </View>
                  </View>

                  {/* Route */}
                  <View className="gap-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-muted">📍</Text>
                      <Text className="text-sm text-muted flex-1">{item.from}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-muted">📍</Text>
                      <Text className="text-sm text-muted flex-1">{item.to}</Text>
                    </View>
                  </View>

                  {/* Action */}
                  <TouchableOpacity className="bg-primary/10 rounded-lg p-2 items-center">
                    <Text className="text-primary text-xs font-semibold">Rebook</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Quick Stats */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-3 mt-auto">
            <Text className="text-sm font-semibold text-foreground">Your Stats</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary">47</Text>
                <Text className="text-xs text-muted">Total Rides</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary">4.9</Text>
                <Text className="text-xs text-muted">Avg Rating</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary">$342</Text>
                <Text className="text-xs text-muted">Total Spent</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
