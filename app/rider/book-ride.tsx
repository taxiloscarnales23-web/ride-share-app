import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Ride Booking Screen
 * Allows riders to search for destination and book a ride
 */

interface Location {
  id: string;
  name: string;
  address: string;
  distance?: string;
}

const MOCK_LOCATIONS: Location[] = [
  { id: "1", name: "Downtown Station", address: "123 Main St, Downtown" },
  { id: "2", name: "Airport Terminal", address: "International Airport" },
  { id: "3", name: "Central Park", address: "Central Park, City Center" },
  { id: "4", name: "Shopping Mall", address: "456 Commerce Ave" },
  { id: "5", name: "Hospital", address: "789 Health Blvd" },
];

export default function BookRideScreen() {
  const colors = useColors();
  const [step, setStep] = useState<"search" | "confirm">("search");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (text: string) => {
    setDropoff(text);
    if (text.length > 2) {
      // Mock search - filter locations
      const results = MOCK_LOCATIONS.filter((loc) =>
        loc.name.toLowerCase().includes(text.toLowerCase()) ||
        loc.address.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSelectDestination = (location: Location) => {
    setDropoff(location.name);
    setShowResults(false);
  };

  const handleConfirmRide = async () => {
    try {
      setError("");
      setLoading(true);

      if (!pickup.trim()) {
        throw new Error("Please enter pickup location");
      }
      if (!dropoff.trim()) {
        throw new Error("Please select a destination");
      }

      // Mock: Calculate fare
      console.log("[BookRide] Booking ride:", { pickup, dropoff });

      // In production, call API: await api.rides.estimateFare({ pickup, dropoff })
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm ride");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRide = async () => {
    try {
      setError("");
      setLoading(true);

      // Mock: Request ride
      console.log("[BookRide] Requesting ride");

      // In production, call API: await api.rides.requestRide({ pickup, dropoff })
      alert("Ride requested! Waiting for driver...");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request ride");
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
            <Text className="text-3xl font-bold text-foreground">Book a Ride</Text>
            <Text className="text-base text-muted">
              {step === "search" ? "Enter your destination" : "Confirm your ride details"}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {step === "search" && (
            <View className="gap-4 flex-1">
              {/* Pickup Location */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Pickup Location</Text>
                <View className="bg-surface border border-border rounded-lg p-4">
                  <Text className="text-foreground">📍 Current Location</Text>
                </View>
              </View>

              {/* Destination Search */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Destination</Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg p-4 text-foreground"
                  placeholder="Where are you going?"
                  placeholderTextColor={colors.muted}
                  value={dropoff}
                  onChangeText={handleSearch}
                  editable={!loading}
                />
              </View>

              {/* Search Results */}
              {showResults && (
                <View className="border border-border rounded-lg overflow-hidden">
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className="border-b border-border p-4 bg-surface active:bg-primary/10"
                        onPress={() => handleSelectDestination(item)}
                      >
                        <Text className="text-foreground font-semibold">{item.name}</Text>
                        <Text className="text-sm text-muted">{item.address}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}

              {/* Confirm Button */}
              <TouchableOpacity
                className={`rounded-lg p-4 items-center mt-auto ${
                  dropoff && !loading ? "bg-primary" : "bg-primary/50"
                }`}
                onPress={handleConfirmRide}
                disabled={!dropoff || loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === "confirm" && (
            <View className="gap-4 flex-1">
              {/* Ride Details Card */}
              <View className="bg-surface border border-border rounded-lg p-6 gap-4">
                {/* Pickup */}
                <View className="gap-2">
                  <Text className="text-xs font-semibold text-muted uppercase">Pickup</Text>
                  <Text className="text-lg font-semibold text-foreground">📍 {pickup}</Text>
                </View>

                {/* Divider */}
                <View className="h-px bg-border" />

                {/* Dropoff */}
                <View className="gap-2">
                  <Text className="text-xs font-semibold text-muted uppercase">Dropoff</Text>
                  <Text className="text-lg font-semibold text-foreground">📍 {dropoff}</Text>
                </View>

                {/* Divider */}
                <View className="h-px bg-border" />

                {/* Fare Estimate */}
                <View className="gap-2">
                  <Text className="text-xs font-semibold text-muted uppercase">Estimated Fare</Text>
                  <Text className="text-2xl font-bold text-primary">$12.50</Text>
                  <Text className="text-xs text-muted">Distance: ~3.2 km • Duration: ~12 min</Text>
                </View>
              </View>

              {/* Ride Type Selection */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Ride Type</Text>
                <TouchableOpacity className="bg-primary/10 border border-primary rounded-lg p-4 flex-row items-center gap-3">
                  <Text className="text-2xl">🚗</Text>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">Standard</Text>
                    <Text className="text-xs text-muted">Most affordable option</Text>
                  </View>
                  <Text className="text-foreground font-semibold">$12.50</Text>
                </TouchableOpacity>
              </View>

              {/* Request Button */}
              <TouchableOpacity
                className="bg-primary rounded-lg p-4 items-center mt-auto"
                onPress={handleRequestRide}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold text-lg">Request Ride</Text>
                )}
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity
                className="border border-primary rounded-lg p-4 items-center"
                onPress={() => setStep("search")}
                disabled={loading}
              >
                <Text className="text-primary font-semibold">Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
