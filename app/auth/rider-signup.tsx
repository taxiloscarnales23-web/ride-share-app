import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Rider Sign-Up Screen
 * Collects rider profile information after phone verification
 */

export default function RiderSignupScreen() {
  const colors = useColors();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      setError("");
      setLoading(true);

      // Validate form
      if (!formData.firstName.trim()) {
        throw new Error("First name is required");
      }
      if (!formData.lastName.trim()) {
        throw new Error("Last name is required");
      }
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error("Please enter a valid email address");
      }

      // Mock: Create rider profile
      console.log("[RiderSignup] Creating profile:", formData);

      // In production, call API: await api.auth.createRiderProfile(formData)
      // Then navigate to home screen

      alert("Profile created successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center gap-8">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">Create Your Profile</Text>
            <Text className="text-base text-muted text-center">
              Tell us a bit about yourself to get started as a rider
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View className="gap-4">
            {/* First Name */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">First Name</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg p-4 text-foreground"
                placeholder="John"
                placeholderTextColor={colors.muted}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                editable={!loading}
              />
            </View>

            {/* Last Name */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Last Name</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg p-4 text-foreground"
                placeholder="Doe"
                placeholderTextColor={colors.muted}
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Email Address</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg p-4 text-foreground"
                placeholder="john@example.com"
                placeholderTextColor={colors.muted}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-lg p-4 items-center ${
              isFormValid && !loading ? "bg-primary" : "bg-primary/50"
            }`}
            onPress={handleSignup}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-semibold">Create Profile</Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text className="text-xs text-muted text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
