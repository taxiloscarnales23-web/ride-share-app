import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
}

interface BadgeProgress {
  type: string;
  current: number;
  required: number;
  percentage: number;
  earned: boolean;
}

/**
 * Driver Badges & Achievements Screen
 * Displays earned badges and progress toward future achievements
 */
export default function BadgesScreen() {
  const colors = useColors();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progress, setProgress] = useState<Record<string, BadgeProgress>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      // In a real app, this would call the backend API
      // const response = await fetch('/api/driver/badges');
      // const data = await response.json();

      // Mock data for now
      const mockBadges: Badge[] = [
        {
          id: "five_star_rated",
          name: "5-Star Rated",
          description: "Maintained a 5.0 rating across 50+ rides",
          icon: "⭐",
          earned: true,
          earnedDate: "2026-01-15",
        },
        {
          id: "safety_champion",
          name: "Safety Champion",
          description: "Perfect safety record with zero incidents",
          icon: "🛡️",
          earned: true,
          earnedDate: "2026-02-01",
        },
        {
          id: "reliability_expert",
          name: "Reliability Expert",
          description: "Never cancelled a ride in the last 6 months",
          icon: "✅",
          earned: false,
          progress: 75,
        },
        {
          id: "customer_favorite",
          name: "Customer Favorite",
          description: "Consistently receives excellent reviews",
          icon: "❤️",
          earned: false,
          progress: 60,
        },
        {
          id: "eco_friendly",
          name: "Eco-Friendly",
          description: "Uses electric or hybrid vehicle",
          icon: "🌱",
          earned: false,
          progress: 0,
        },
        {
          id: "veteran_driver",
          name: "Veteran Driver",
          description: "Completed 1000+ rides",
          icon: "🏆",
          earned: false,
          progress: 45,
        },
        {
          id: "quick_responder",
          name: "Quick Responder",
          description: "Accepts rides within 30 seconds",
          icon: "⚡",
          earned: false,
          progress: 80,
        },
        {
          id: "perfect_record",
          name: "Perfect Record",
          description: "No cancellations, complaints, or incidents",
          icon: "👑",
          earned: false,
          progress: 55,
        },
      ];

      const mockProgress: Record<string, BadgeProgress> = {
        reliability_expert: {
          type: "reliability_expert",
          current: 38,
          required: 50,
          percentage: 75,
          earned: false,
        },
        customer_favorite: {
          type: "customer_favorite",
          current: 60,
          required: 100,
          percentage: 60,
          earned: false,
        },
        veteran_driver: {
          type: "veteran_driver",
          current: 450,
          required: 1000,
          percentage: 45,
          earned: false,
        },
        quick_responder: {
          type: "quick_responder",
          current: 160,
          required: 200,
          percentage: 80,
          earned: false,
        },
        perfect_record: {
          type: "perfect_record",
          current: 275,
          required: 500,
          percentage: 55,
          earned: false,
        },
      };

      setBadges(mockBadges);
      setProgress(mockProgress);
    } catch (error) {
      console.error("Failed to load badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background">
        {/* Header */}
        <View className="bg-primary px-6 py-8">
          <Text className="text-3xl font-bold text-background mb-2">Achievements</Text>
          <Text className="text-background opacity-90">
            Earn badges by maintaining excellent service standards
          </Text>
        </View>

        {/* Stats */}
        <View className="px-6 py-6 flex-row gap-4">
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm text-muted mb-1">Badges Earned</Text>
            <Text className="text-3xl font-bold text-foreground">{earnedBadges.length}</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm text-muted mb-1">Total Available</Text>
            <Text className="text-3xl font-bold text-foreground">{badges.length}</Text>
          </View>
        </View>

        {/* Earned Badges Section */}
        {earnedBadges.length > 0 && (
          <View className="px-6 mb-8">
            <Text className="text-lg font-bold text-foreground mb-4">Earned Badges</Text>
            <View className="gap-3">
              {earnedBadges.map((badge) => (
                <Pressable
                  key={badge.id}
                  onPress={() => setSelectedBadge(badge)}
                  className="bg-surface rounded-lg p-4 border border-success active:opacity-70"
                >
                  <View className="flex-row items-center gap-4">
                    <View className="w-16 h-16 bg-primary rounded-full items-center justify-center">
                      <Text className="text-4xl">{badge.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-foreground">{badge.name}</Text>
                      <Text className="text-sm text-muted mt-1">{badge.description}</Text>
                      {badge.earnedDate && (
                        <Text className="text-xs text-success mt-2">
                          Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Locked Badges Section */}
        {lockedBadges.length > 0 && (
          <View className="px-6 mb-8">
            <Text className="text-lg font-bold text-foreground mb-4">Locked Badges</Text>
            <View className="gap-3">
              {lockedBadges.map((badge) => {
                const badgeProgress = progress[badge.id];
                return (
                  <Pressable
                    key={badge.id}
                    onPress={() => setSelectedBadge(badge)}
                    className="bg-surface rounded-lg p-4 border border-border active:opacity-70"
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="w-16 h-16 bg-muted rounded-full items-center justify-center opacity-50">
                        <Text className="text-4xl opacity-50">{badge.icon}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">{badge.name}</Text>
                        <Text className="text-sm text-muted mt-1">{badge.description}</Text>

                        {badgeProgress && (
                          <View className="mt-3">
                            {/* Progress Bar */}
                            <View className="h-2 bg-border rounded-full overflow-hidden">
                              <View
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${badgeProgress.percentage}%` }}
                              />
                            </View>
                            {/* Progress Text */}
                            <Text className="text-xs text-muted mt-2">
                              {badgeProgress.current} / {badgeProgress.required}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Badge Detail Modal (simplified) */}
        {selectedBadge && (
          <View className="px-6 mb-8 bg-surface rounded-lg p-6 border border-border">
            <Pressable onPress={() => setSelectedBadge(null)} className="mb-4">
              <Text className="text-primary font-semibold">← Back</Text>
            </Pressable>

            <View className="items-center mb-6">
              <View
                className={cn(
                  "w-24 h-24 rounded-full items-center justify-center mb-4",
                  selectedBadge.earned ? "bg-primary" : "bg-muted opacity-50"
                )}
              >
                <Text className="text-6xl">{selectedBadge.icon}</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground text-center">
                {selectedBadge.name}
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-foreground mb-2 font-semibold">About this badge</Text>
              <Text className="text-muted leading-relaxed">{selectedBadge.description}</Text>
            </View>

            {selectedBadge.earned && selectedBadge.earnedDate && (
              <View className="bg-success bg-opacity-10 rounded-lg p-4 border border-success">
                <Text className="text-success font-semibold">✓ Earned</Text>
                <Text className="text-success text-sm mt-1">
                  on {new Date(selectedBadge.earnedDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            {!selectedBadge.earned && progress[selectedBadge.id] && (
              <View className="bg-primary bg-opacity-10 rounded-lg p-4 border border-primary">
                <Text className="text-primary font-semibold mb-3">Progress</Text>
                <View className="h-3 bg-border rounded-full overflow-hidden mb-3">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${progress[selectedBadge.id].percentage}%` }}
                  />
                </View>
                <Text className="text-primary text-sm">
                  {progress[selectedBadge.id].current} / {progress[selectedBadge.id].required}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
