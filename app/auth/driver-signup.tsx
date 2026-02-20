import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Driver Sign-Up Screen
 * Collects driver profile and vehicle information after phone verification
 */

export default function DriverSignupScreen() {
  const colors = useColors();
  const [step, setStep] = useState<"profile" | "vehicle" | "license">("profile");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    licenseNumber: "",
    licenseExpiry: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    licensePlate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleProfileNext = () => {
    try {
      setError("");

      // Validate profile
      if (!formData.firstName.trim()) {
        throw new Error("First name is required");
      }
      if (!formData.lastName.trim()) {
        throw new Error("Last name is required");
      }
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error("Please enter a valid email address");
      }

      setStep("license");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid input");
    }
  };

  const handleLicenseNext = () => {
    try {
      setError("");

      // Validate license
      if (!formData.licenseNumber.trim()) {
        throw new Error("License number is required");
      }
      if (!formData.licenseExpiry.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        throw new Error("Please enter expiry date in MM/DD/YYYY format");
      }

      setStep("vehicle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid input");
    }
  };

  const handleSignup = async () => {
    try {
      setError("");
      setLoading(true);

      // Validate vehicle
      if (!formData.vehicleMake.trim()) {
        throw new Error("Vehicle make is required");
      }
      if (!formData.vehicleModel.trim()) {
        throw new Error("Vehicle model is required");
      }
      if (!formData.vehicleYear.match(/^\d{4}$/)) {
        throw new Error("Please enter a valid year");
      }
      if (!formData.licensePlate.trim()) {
        throw new Error("License plate is required");
      }

      // Mock: Create driver profile
      console.log("[DriverSignup] Creating profile:", formData);

      // In production, call API: await api.auth.createDriverProfile(formData)
      // Then navigate to home screen

      alert("Driver profile created successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center gap-8">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">Become a Driver</Text>
            <Text className="text-base text-muted text-center">
              {step === "profile"
                ? "Tell us about yourself"
                : step === "license"
                  ? "Verify your driver license"
                  : "Register your vehicle"}
            </Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row gap-2">
            <View
              className={`flex-1 h-1 rounded ${step === "profile" || step === "license" || step === "vehicle" ? "bg-primary" : "bg-border"}`}
            />
            <View className={`flex-1 h-1 rounded ${step === "license" || step === "vehicle" ? "bg-primary" : "bg-border"}`} />
            <View className={`flex-1 h-1 rounded ${step === "vehicle" ? "bg-primary" : "bg-border"}`} />
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Profile Step */}
          {step === "profile" && (
            <View className="gap-4">
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

              <TouchableOpacity
                className="bg-primary rounded-lg p-4 items-center mt-4"
                onPress={handleProfileNext}
                disabled={loading}
              >
                <Text className="text-background font-semibold">Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* License Step */}
          {step === "license" && (
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">License Number</Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg p-4 text-foreground"
                  placeholder="ABC123456"
                  placeholderTextColor={colors.muted}
                  value={formData.licenseNumber}
                  onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
                  editable={!loading}
                />
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">License Expiry</Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg p-4 text-foreground"
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.muted}
                  value={formData.licenseExpiry}
                  onChangeText={(text) => setFormData({ ...formData, licenseExpiry: text })}
                  editable={!loading}
                />
              </View>

              <View className="flex-row gap-2 mt-4">
                <TouchableOpacity
                  className="flex-1 border border-primary rounded-lg p-4 items-center"
                  onPress={() => setStep("profile")}
                  disabled={loading}
                >
                  <Text className="text-primary font-semibold">Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-primary rounded-lg p-4 items-center"
                  onPress={handleLicenseNext}
                  disabled={loading}
                >
                  <Text className="text-background font-semibold">Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Vehicle Step */}
          {step === "vehicle" && (
            <View className="gap-4">
              <View className="flex-row gap-2">
                <View className="flex-1 gap-2">
                  <Text className="text-sm font-semibold text-foreground">Make</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg p-4 text-foreground"
                    placeholder="Toyota"
                    placeholderTextColor={colors.muted}
                    value={formData.vehicleMake}
                    onChangeText={(text) => setFormData({ ...formData, vehicleMake: text })}
                    editable={!loading}
                  />
                </View>

                <View className="flex-1 gap-2">
                  <Text className="text-sm font-semibold text-foreground">Model</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg p-4 text-foreground"
                    placeholder="Camry"
                    placeholderTextColor={colors.muted}
                    value={formData.vehicleModel}
                    onChangeText={(text) => setFormData({ ...formData, vehicleModel: text })}
                    editable={!loading}
                  />
                </View>
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1 gap-2">
                  <Text className="text-sm font-semibold text-foreground">Year</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg p-4 text-foreground"
                    placeholder="2022"
                    placeholderTextColor={colors.muted}
                    value={formData.vehicleYear}
                    onChangeText={(text) => setFormData({ ...formData, vehicleYear: text })}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>

                <View className="flex-1 gap-2">
                  <Text className="text-sm font-semibold text-foreground">Color</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg p-4 text-foreground"
                    placeholder="White"
                    placeholderTextColor={colors.muted}
                    value={formData.vehicleColor}
                    onChangeText={(text) => setFormData({ ...formData, vehicleColor: text })}
                    editable={!loading}
                  />
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">License Plate</Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg p-4 text-foreground"
                  placeholder="ABC 1234"
                  placeholderTextColor={colors.muted}
                  value={formData.licensePlate}
                  onChangeText={(text) => setFormData({ ...formData, licensePlate: text })}
                  editable={!loading}
                />
              </View>

              <View className="flex-row gap-2 mt-4">
                <TouchableOpacity
                  className="flex-1 border border-primary rounded-lg p-4 items-center"
                  onPress={() => setStep("license")}
                  disabled={loading}
                >
                  <Text className="text-primary font-semibold">Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-primary rounded-lg p-4 items-center"
                  onPress={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text className="text-background font-semibold">Complete Signup</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
