import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Ride Completion & Rating Screen
 * Displays ride summary and allows rider to rate driver
 */

export default function RideCompletionScreen() {
  const colors = useColors();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleRateDriver = async () => {
    try {
      setError("");
      setLoading(true);

      if (rating === 0) {
        throw new Error("Please select a rating");
      }

      // Mock: Submit rating
      console.log("[RideCompletion] Submitting rating:", { rating, review });

      // In production, call API: await api.rides.rateDriver({ rideId, rating, review })
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipRating = async () => {
    try {
      setLoading(true);
      // Mock: Skip rating
      console.log("[RideCompletion] Skipping rating");
      setCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center items-center gap-6">
            {/* Success Icon */}
            <View className="w-20 h-20 bg-success/10 rounded-full items-center justify-center">
              <Text className="text-5xl">✓</Text>
            </View>

            {/* Message */}
            <View className="items-center gap-2">
              <Text className="text-3xl font-bold text-foreground">Ride Complete!</Text>
              <Text className="text-base text-muted text-center">
                Thank you for riding with us. Your feedback helps us improve.
              </Text>
            </View>

            {/* Ride Summary */}
            <View className="w-full bg-surface border border-border rounded-lg p-6 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted">Distance</Text>
                <Text className="text-foreground font-semibold">3.2 km</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Duration</Text>
                <Text className="text-foreground font-semibold">12 minutes</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Fare</Text>
                <Text className="text-foreground font-semibold">$12.50</Text>
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity className="w-full bg-primary rounded-lg p-4 items-center">
              <Text className="text-background font-semibold">Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Rate Your Ride</Text>
            <Text className="text-base text-muted">How was your experience with the driver?</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Driver Info */}
          <View className="bg-surface border border-border rounded-lg p-6 flex-row items-center gap-4">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center">
              <Text className="text-3xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">John Smith</Text>
              <Text className="text-sm text-muted">Toyota Camry • ABC 1234</Text>
              <Text className="text-xs text-muted mt-1">⭐ 4.8 rating</Text>
            </View>
          </View>

          {/* Rating Stars */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Your Rating</Text>
            <View className="flex-row gap-3 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  disabled={loading}
                  className="p-2"
                >
                  <Text className="text-4xl">{star <= rating ? "⭐" : "☆"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text className="text-center text-sm text-muted">
                {rating === 5
                  ? "Excellent!"
                  : rating === 4
                    ? "Very Good"
                    : rating === 3
                      ? "Good"
                      : rating === 2
                        ? "Fair"
                        : "Poor"}
              </Text>
            )}
          </View>

          {/* Review Text */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Add a Comment (Optional)</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg p-4 text-foreground"
              placeholder="Share your feedback..."
              placeholderTextColor={colors.muted}
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
              editable={!loading}
              textAlignVertical="top"
            />
          </View>

          {/* Ride Summary */}
          <View className="bg-surface border border-border rounded-lg p-6 gap-3">
            <Text className="text-sm font-semibold text-foreground mb-2">Ride Summary</Text>
            <View className="flex-row justify-between">
              <Text className="text-muted">Distance</Text>
              <Text className="text-foreground font-semibold">3.2 km</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted">Duration</Text>
              <Text className="text-foreground font-semibold">12 minutes</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted">Fare</Text>
              <Text className="text-foreground font-semibold">$12.50</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted">Tip</Text>
              <Text className="text-foreground font-semibold">$2.00</Text>
            </View>
            <View className="h-px bg-border my-2" />
            <View className="flex-row justify-between">
              <Text className="font-semibold text-foreground">Total Paid</Text>
              <Text className="text-lg font-bold text-primary">$14.50</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-lg p-4 items-center ${
              rating > 0 && !loading ? "bg-primary" : "bg-primary/50"
            }`}
            onPress={handleRateDriver}
            disabled={rating === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-semibold">Submit Rating</Text>
            )}
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            className="border border-primary rounded-lg p-4 items-center"
            onPress={handleSkipRating}
            disabled={loading}
          >
            <Text className="text-primary font-semibold">Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
