import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface TwoFAConfig {
  enabled: boolean;
  method: "totp" | "sms" | "both";
  backupCodesCount: number;
}

export default function TwoFactorAuthScreen() {
  const colors = useColors();
  const [twoFAConfig, setTwoFAConfig] = useState<TwoFAConfig>({
    enabled: false,
    method: "totp",
    backupCodesCount: 10,
  });

  const [setupStep, setSetupStep] = useState<"menu" | "method" | "totp" | "sms" | "codes">("menu");
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const backupCodes = [
    "ABC12345",
    "DEF67890",
    "GHI11111",
    "JKL22222",
    "MNO33333",
    "PQR44444",
    "STU55555",
    "VWX66666",
    "YZA77777",
    "BCD88888",
  ];

  const handleEnableTwoFA = () => {
    setSetupStep("method");
  };

  const handleSelectMethod = (method: "totp" | "sms" | "both") => {
    setTwoFAConfig({ ...twoFAConfig, method });
    if (method === "totp" || method === "both") {
      setSetupStep("totp");
    } else {
      setSetupStep("sms");
    }
  };

  const handleVerifyTOTP = () => {
    if (verificationCode.length !== 6) {
      Alert.alert("Error", "Please enter a 6-digit code");
      return;
    }
    Alert.alert("Success", "TOTP verified successfully");
    setSetupStep("codes");
  };

  const handleVerifySMS = () => {
    if (verificationCode.length !== 4) {
      Alert.alert("Error", "Please enter a 4-digit code");
      return;
    }
    Alert.alert("Success", "SMS verified successfully");
    setSetupStep("codes");
  };

  const handleConfirmSetup = () => {
    setTwoFAConfig({ ...twoFAConfig, enabled: true });
    setSetupStep("menu");
    setVerificationCode("");
    Alert.alert("Success", "Two-Factor Authentication enabled");
  };

  const handleDisableTwoFA = () => {
    Alert.alert("Disable 2FA", "Are you sure? This will reduce your account security.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disable",
        style: "destructive",
        onPress: () => {
          setTwoFAConfig({ ...twoFAConfig, enabled: false });
          Alert.alert("Success", "Two-Factor Authentication disabled");
        },
      },
    ]);
  };

  const handleDownloadBackupCodes = () => {
    Alert.alert("Download Backup Codes", "Backup codes have been copied to clipboard");
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Two-Factor Authentication</Text>
          <Text className="text-sm text-muted">Enhance your account security</Text>
        </View>

        {/* Menu View */}
        {setupStep === "menu" && (
          <>
            {/* Status Card */}
            <View className={`rounded-lg p-4 mb-6 border border-border ${
              twoFAConfig.enabled ? "bg-success/10" : "bg-warning/10"
            }`}>
              <View className="flex-row items-center gap-2 mb-2">
                <View
                  className={`w-3 h-3 rounded-full ${
                    twoFAConfig.enabled ? "bg-success" : "bg-warning"
                  }`}
                />
                <Text className={`font-semibold ${
                  twoFAConfig.enabled ? "text-success" : "text-warning"
                }`}>
                  {twoFAConfig.enabled ? "Enabled" : "Disabled"}
                </Text>
              </View>
              <Text className="text-sm text-foreground">
                {twoFAConfig.enabled
                  ? `Using ${twoFAConfig.method === "both" ? "TOTP & SMS" : twoFAConfig.method.toUpperCase()}`
                  : "Add an extra layer of security to your account"}
              </Text>
            </View>

            {/* Action Buttons */}
            {!twoFAConfig.enabled ? (
              <TouchableOpacity
                onPress={handleEnableTwoFA}
                className="bg-primary rounded-lg p-4 mb-4 active:opacity-80"
              >
                <Text className="text-white font-semibold text-center">Enable 2FA</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setShowBackupCodes(!showBackupCodes)}
                  className="bg-primary/20 rounded-lg p-4 mb-4 active:opacity-80"
                >
                  <Text className="text-primary font-semibold text-center">
                    {showBackupCodes ? "Hide" : "View"} Backup Codes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDisableTwoFA}
                  className="bg-error/20 rounded-lg p-4 active:opacity-80"
                >
                  <Text className="text-error font-semibold text-center">Disable 2FA</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Backup Codes Display */}
            {showBackupCodes && twoFAConfig.enabled && (
              <View className="mt-6 bg-surface rounded-lg p-4 border border-border">
                <Text className="text-sm font-semibold text-foreground mb-3">Backup Codes</Text>
                <Text className="text-xs text-muted mb-3">
                  Save these codes in a safe place. Each code can be used once if you lose access to your 2FA device.
                </Text>
                <View className="bg-background rounded p-3 mb-3">
                  {backupCodes.map((code, index) => (
                    <Text key={index} className="text-xs font-mono text-foreground mb-1">
                      {code}
                    </Text>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={handleDownloadBackupCodes}
                  className="bg-primary/20 rounded-lg p-2 active:opacity-80"
                >
                  <Text className="text-primary font-semibold text-center text-sm">
                    Download Codes
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Info Section */}
            <View className="mt-6 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-2">How it works</Text>
              <Text className="text-xs text-muted leading-relaxed">
                Two-factor authentication adds an extra layer of security. After entering your password, you'll need to enter a code from your authenticator app or SMS.
              </Text>
            </View>
          </>
        )}

        {/* Method Selection */}
        {setupStep === "method" && (
          <>
            <Text className="text-lg font-semibold text-foreground mb-4">Choose Authentication Method</Text>

            <TouchableOpacity
              onPress={() => handleSelectMethod("totp")}
              className="bg-surface rounded-lg p-4 mb-3 border border-border active:opacity-80"
            >
              <Text className="text-sm font-semibold text-foreground mb-1">Authenticator App</Text>
              <Text className="text-xs text-muted">Use Google Authenticator, Authy, or similar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectMethod("sms")}
              className="bg-surface rounded-lg p-4 mb-3 border border-border active:opacity-80"
            >
              <Text className="text-sm font-semibold text-foreground mb-1">SMS Text Message</Text>
              <Text className="text-xs text-muted">Receive codes via text message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectMethod("both")}
              className="bg-surface rounded-lg p-4 border border-border active:opacity-80"
            >
              <Text className="text-sm font-semibold text-foreground mb-1">Both Methods</Text>
              <Text className="text-xs text-muted">Use both authenticator app and SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSetupStep("menu")}
              className="mt-4 bg-muted/20 rounded-lg p-3 active:opacity-80"
            >
              <Text className="text-foreground font-semibold text-center">Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {/* TOTP Setup */}
        {setupStep === "totp" && (
          <>
            <Text className="text-lg font-semibold text-foreground mb-4">Scan QR Code</Text>

            {/* QR Code Placeholder */}
            <View className="bg-surface rounded-lg p-6 mb-4 items-center border border-border">
              <View className="w-40 h-40 bg-background rounded-lg items-center justify-center">
                <Text className="text-xs text-muted text-center">
                  QR Code would appear here{"\n"}Scan with authenticator app
                </Text>
              </View>
            </View>

            <Text className="text-sm font-semibold text-foreground mb-2">Or enter manually:</Text>
            <View className="bg-surface rounded-lg p-3 mb-4 border border-border">
              <Text className="text-xs font-mono text-foreground">JBSWY3DPEBLW64TMMQ======</Text>
            </View>

            {/* Verification Code Input */}
            <Text className="text-sm font-semibold text-foreground mb-2">Enter 6-digit code:</Text>
            <TextInput
              placeholder="000000"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
              className="bg-surface border border-border rounded-lg p-3 text-foreground text-center text-lg font-mono mb-4"
              placeholderTextColor={colors.muted}
            />

            <TouchableOpacity
              onPress={handleVerifyTOTP}
              className="bg-primary rounded-lg p-3 mb-2 active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSetupStep("method")}
              className="bg-muted/20 rounded-lg p-3 active:opacity-80"
            >
              <Text className="text-foreground font-semibold text-center">Back</Text>
            </TouchableOpacity>
          </>
        )}

        {/* SMS Setup */}
        {setupStep === "sms" && (
          <>
            <Text className="text-lg font-semibold text-foreground mb-4">Enter Phone Number</Text>

            <TextInput
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              className="bg-surface border border-border rounded-lg p-3 text-foreground mb-4"
              placeholderTextColor={colors.muted}
            />

            <TouchableOpacity
              onPress={() => {
                if (!phoneNumber.trim()) {
                  Alert.alert("Error", "Please enter a phone number");
                  return;
                }
                Alert.alert("Code Sent", "A verification code has been sent to your phone");
                setVerificationCode("");
              }}
              className="bg-primary rounded-lg p-3 mb-4 active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">Send Code</Text>
            </TouchableOpacity>

            {verificationCode !== "" && (
              <>
                <Text className="text-sm font-semibold text-foreground mb-2">Enter 4-digit code:</Text>
                <TextInput
                  placeholder="0000"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={4}
                  className="bg-surface border border-border rounded-lg p-3 text-foreground text-center text-lg font-mono mb-4"
                  placeholderTextColor={colors.muted}
                />

                <TouchableOpacity
                  onPress={handleVerifySMS}
                  className="bg-primary rounded-lg p-3 mb-2 active:opacity-80"
                >
                  <Text className="text-white font-semibold text-center">Verify</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={() => setSetupStep("method")}
              className="bg-muted/20 rounded-lg p-3 active:opacity-80"
            >
              <Text className="text-foreground font-semibold text-center">Back</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Backup Codes Setup */}
        {setupStep === "codes" && (
          <>
            <Text className="text-lg font-semibold text-foreground mb-2">Save Backup Codes</Text>
            <Text className="text-sm text-muted mb-4">
              Keep these codes safe. You can use them if you lose access to your 2FA device.
            </Text>

            <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
              {backupCodes.map((code, index) => (
                <Text key={index} className="text-sm font-mono text-foreground mb-2">
                  {code}
                </Text>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleDownloadBackupCodes}
              className="bg-primary/20 rounded-lg p-3 mb-4 active:opacity-80"
            >
              <Text className="text-primary font-semibold text-center">Download Codes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirmSetup}
              className="bg-success rounded-lg p-3 active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">Complete Setup</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
