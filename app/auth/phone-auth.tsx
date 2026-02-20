import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Phone Authentication Screen
 * Handles phone number entry and OTP verification
 */

export default function PhoneAuthScreen() {
  const colors = useColors();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const handleSendOTP = async () => {
    try {
      setError("");
      setLoading(true);

      // Validate phone number
      if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
        throw new Error("Please enter a valid phone number");
      }

      // Mock: Simulate sending OTP
      console.log(`[PhoneAuth] Sending OTP to ${phoneNumber}`);

      // In production, call API: await api.auth.sendOTP({ phoneNumber })
      setStep("otp");
      setResendTimer(60);

      // Start countdown timer
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setError("");
      setLoading(true);

      // Validate OTP
      if (otp.length !== 6) {
        throw new Error("Please enter a 6-digit OTP");
      }

      // Mock: Simulate verifying OTP
      console.log(`[PhoneAuth] Verifying OTP: ${otp}`);

      // In production, call API: await api.auth.verifyOTP({ phoneNumber, code: otp })
      // Then navigate to role selection or sign-up flow

      alert("OTP verified successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setError("");
      setLoading(true);

      // Mock: Simulate resending OTP
      console.log(`[PhoneAuth] Resending OTP to ${phoneNumber}`);

      // In production, call API: await api.auth.resendOTP({ phoneNumber })
      setResendTimer(60);

      // Start countdown timer
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
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
            <Text className="text-4xl font-bold text-foreground">Welcome</Text>
            <Text className="text-base text-muted text-center">
              {step === "phone" ? "Enter your phone number to get started" : "Enter the OTP sent to your phone"}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Phone Number Input */}
          {step === "phone" && (
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Phone Number</Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg p-4 text-foreground"
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor={colors.muted}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                className="bg-primary rounded-lg p-4 items-center"
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Send OTP</Text>
                )}
              </TouchableOpacity>

              <Text className="text-xs text-muted text-center">
                We'll send you a 6-digit code to verify your phone number
              </Text>
            </View>
          )}

          {/* OTP Input */}
          {step === "otp" && (
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Verification Code</Text>
                <TextInput
                  className="bg-surface border border-border rounded-lg p-4 text-foreground text-center text-2xl tracking-widest"
                  placeholder="000000"
                  placeholderTextColor={colors.muted}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                className="bg-primary rounded-lg p-4 items-center"
                onPress={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Verify OTP</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP */}
              <View className="items-center gap-2">
                {resendTimer > 0 ? (
                  <Text className="text-sm text-muted">Resend code in {resendTimer}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                    <Text className="text-sm text-primary font-semibold">Didn't receive code? Resend</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Back Button */}
              <TouchableOpacity onPress={() => setStep("phone")} disabled={loading}>
                <Text className="text-sm text-muted text-center">← Back to phone number</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
