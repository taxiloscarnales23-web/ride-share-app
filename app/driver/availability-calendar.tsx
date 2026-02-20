import { ScrollView, Text, View, Pressable, FlatList, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

interface DaySchedule {
  day: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

interface TimeOff {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  isApproved: boolean;
}

export default function AvailabilityCalendarScreen() {
  const colors = useColors();
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([
    { day: "Monday", isAvailable: true, startTime: "08:00", endTime: "22:00" },
    { day: "Tuesday", isAvailable: true, startTime: "08:00", endTime: "22:00" },
    { day: "Wednesday", isAvailable: true, startTime: "08:00", endTime: "22:00" },
    { day: "Thursday", isAvailable: true, startTime: "08:00", endTime: "22:00" },
    { day: "Friday", isAvailable: true, startTime: "08:00", endTime: "23:00" },
    { day: "Saturday", isAvailable: true, startTime: "09:00", endTime: "23:00" },
    { day: "Sunday", isAvailable: false, startTime: "00:00", endTime: "00:00" },
  ]);

  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([
    {
      id: "1",
      startDate: "Feb 25, 2026",
      endDate: "Feb 27, 2026",
      reason: "Personal time",
      isApproved: true,
    },
    {
      id: "2",
      startDate: "Mar 10, 2026",
      endDate: "Mar 12, 2026",
      reason: "Family vacation",
      isApproved: false,
    },
  ]);

  const toggleDayAvailability = (index: number) => {
    const updated = [...weeklySchedule];
    updated[index].isAvailable = !updated[index].isAvailable;
    setWeeklySchedule(updated);
  };

  const renderDaySchedule = ({ item, index }: { item: DaySchedule; index: number }) => (
    <View
      className="rounded-lg p-4 mb-3 flex-row items-center justify-between border border-border"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-1 gap-2">
        <Text className="text-base font-semibold text-foreground">{item.day}</Text>
        {item.isAvailable ? (
          <Text className="text-sm text-muted">
            {item.startTime} - {item.endTime}
          </Text>
        ) : (
          <Text className="text-sm text-error">Not available</Text>
        )}
      </View>
      <Switch
        value={item.isAvailable}
        onValueChange={() => toggleDayAvailability(index)}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={item.isAvailable ? colors.background : colors.muted}
      />
    </View>
  );

  const renderTimeOff = ({ item }: { item: TimeOff }) => (
    <View
      className="rounded-lg p-4 mb-3 border-l-4"
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: item.isApproved ? colors.success : colors.warning,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-foreground">{item.reason}</Text>
        <Text
          className="text-xs font-semibold px-2 py-1 rounded"
          style={{
            backgroundColor: item.isApproved ? colors.success : colors.warning,
            color: colors.background,
          }}
        >
          {item.isApproved ? "Approved" : "Pending"}
        </Text>
      </View>
      <Text className="text-sm text-muted">
        {item.startDate} to {item.endDate}
      </Text>
      <View className="flex-row gap-2 mt-3">
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.error,
              alignItems: "center",
            },
          ]}
        >
          <Text className="text-sm font-semibold text-error">Cancel</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Availability</Text>
            <Text className="text-base text-muted">Manage your work schedule</Text>
          </View>

          {/* Weekly Schedule Section */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Weekly Schedule</Text>
              <Pressable
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Text className="text-sm font-semibold text-background">Save</Text>
              </Pressable>
            </View>

            <FlatList
              data={weeklySchedule}
              renderItem={renderDaySchedule}
              keyExtractor={(_, i) => i.toString()}
              scrollEnabled={false}
            />
          </View>

          {/* Availability Stats */}
          <View
            className="rounded-lg p-4 gap-3"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-sm font-semibold text-muted uppercase">This Week</Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Available Hours</Text>
                <Text className="text-2xl font-bold text-foreground">98</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Blocked Hours</Text>
                <Text className="text-2xl font-bold text-warning">16</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Availability</Text>
                <Text className="text-2xl font-bold text-success">86%</Text>
              </View>
            </View>
          </View>

          {/* Time Off Section */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Time Off</Text>
              <Pressable
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Text className="text-sm font-semibold text-background">+ Add</Text>
              </Pressable>
            </View>

            {timeOffs.length > 0 ? (
              <FlatList
                data={timeOffs}
                renderItem={renderTimeOff}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View
                className="rounded-lg p-6 items-center justify-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-base text-muted">No time off scheduled</Text>
              </View>
            )}
          </View>

          {/* Automatic Status Update */}
          <View
            className="rounded-lg p-4 gap-3 border border-border"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Auto Status Update
                </Text>
                <Text className="text-sm text-muted mt-1">
                  Automatically go online/offline based on schedule
                </Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>

          {/* Info Box */}
          <View
            className="rounded-lg p-4 gap-2"
            style={{ backgroundColor: colors.primary + "15" }}
          >
            <Text className="text-sm font-semibold text-foreground">💡 Pro Tip</Text>
            <Text className="text-sm text-muted leading-relaxed">
              Set your availability to match your preferences. Drivers with consistent schedules
              get better ride matching and higher earnings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
