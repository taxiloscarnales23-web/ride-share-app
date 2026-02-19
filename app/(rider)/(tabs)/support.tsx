import { ScrollView, Text, View, Pressable, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

export default function SupportScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"faq" | "tickets" | "contact">(
    "faq"
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");

  const faqs = [
    {
      id: 1,
      question: "How do I request a ride?",
      answer:
        "Open the app, enter your pickup and dropoff locations, select your ride type, and tap 'Request Ride'. A nearby driver will be matched with you shortly.",
    },
    {
      id: 2,
      question: "What payment methods do you accept?",
      answer:
        "We currently accept cash payments only. Payment is collected directly from the driver at the end of your ride.",
    },
    {
      id: 3,
      question: "Can I schedule a ride in advance?",
      answer:
        "Yes! Go to the Schedule tab, select your preferred date and time, and we'll match you with a driver for that time slot.",
    },
    {
      id: 4,
      question: "How is the fare calculated?",
      answer:
        "Fares are calculated based on distance, time, and current demand. Base fare is $2.50, then $1.50 per km with a minimum of $5.",
    },
    {
      id: 5,
      question: "What if I have an issue with my ride?",
      answer:
        "You can report an issue through the support ticket system. Our team will investigate and resolve it within 24 hours.",
    },
    {
      id: 6,
      question: "How do I rate my driver?",
      answer:
        "After your ride ends, you'll be prompted to rate your driver and provide feedback. This helps us maintain service quality.",
    },
  ];

  const supportTickets = [
    {
      id: "TKT001",
      title: "Driver was late",
      status: "Open",
      date: "2024-02-19",
      priority: "Medium",
    },
    {
      id: "TKT002",
      title: "Incorrect fare charged",
      status: "Resolved",
      date: "2024-02-18",
      priority: "High",
    },
    {
      id: "TKT003",
      title: "Lost item in vehicle",
      status: "In Progress",
      date: "2024-02-17",
      priority: "High",
    },
  ];

  const contactOptions = [
    {
      id: 1,
      method: "Email",
      value: "support@rideshare.com",
      icon: "✉️",
    },
    {
      id: 2,
      method: "Phone",
      value: "+1 (555) 123-4567",
      icon: "📞",
    },
    {
      id: 3,
      method: "Chat",
      value: "Live chat available 24/7",
      icon: "💬",
    },
  ];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Support</Text>
            <Text className="text-sm text-muted">
              Get help and manage your support requests
            </Text>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row gap-2 bg-surface rounded-lg p-1">
            {(["faq", "tickets", "contact"] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={({ pressed }) => [
                  {
                    backgroundColor:
                      activeTab === tab ? colors.primary : "transparent",
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 py-2 px-3 rounded items-center"
              >
                <Text
                  className={`font-semibold text-xs ${
                    activeTab === tab ? "text-background" : "text-foreground"
                  }`}
                >
                  {tab === "faq"
                    ? "FAQ"
                    : tab === "tickets"
                      ? "Tickets"
                      : "Contact"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* FAQ Tab */}
          {activeTab === "faq" && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">
                Frequently Asked Questions
              </Text>
              <View className="gap-2">
                {faqs.map((faq) => (
                  <Pressable
                    key={faq.id}
                    onPress={() =>
                      setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                    }
                    className="bg-surface rounded-lg p-4 border border-border"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="flex-1 font-semibold text-foreground text-sm">
                        {faq.question}
                      </Text>
                      <Text className="text-lg text-primary">
                        {expandedFaq === faq.id ? "−" : "+"}
                      </Text>
                    </View>
                    {expandedFaq === faq.id && (
                      <Text className="text-xs text-muted mt-3">
                        {faq.answer}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Tickets Tab */}
          {activeTab === "tickets" && (
            <View className="gap-4">
              {/* Create New Ticket */}
              <View className="bg-surface rounded-lg p-4 border border-border gap-3">
                <Text className="font-semibold text-foreground">
                  Create Support Ticket
                </Text>
                <TextInput
                  placeholder="Ticket title"
                  placeholderTextColor={colors.muted}
                  value={ticketTitle}
                  onChangeText={setTicketTitle}
                  className="bg-background rounded-lg p-3 text-foreground border border-border"
                  style={{ color: colors.foreground }}
                />
                <TextInput
                  placeholder="Describe your issue..."
                  placeholderTextColor={colors.muted}
                  value={ticketDescription}
                  onChangeText={setTicketDescription}
                  multiline
                  numberOfLines={4}
                  className="bg-background rounded-lg p-3 text-foreground border border-border"
                  style={{ color: colors.foreground }}
                />
                <Pressable
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="py-3 px-4 rounded-lg items-center"
                >
                  <Text className="text-background font-semibold">
                    Submit Ticket
                  </Text>
                </Pressable>
              </View>

              {/* Existing Tickets */}
              <View className="gap-3">
                <Text className="font-semibold text-foreground">
                  Your Support Tickets
                </Text>
                {supportTickets.map((ticket) => (
                  <View
                    key={ticket.id}
                    className="bg-surface rounded-lg p-4 border border-border"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">
                          {ticket.title}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {ticket.id} • {ticket.date}
                        </Text>
                      </View>
                      <View
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor:
                            ticket.status === "Resolved"
                              ? colors.success + "20"
                              : ticket.status === "In Progress"
                                ? colors.warning + "20"
                                : colors.error + "20",
                        }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{
                            color:
                              ticket.status === "Resolved"
                                ? colors.success
                                : ticket.status === "In Progress"
                                  ? colors.warning
                                  : colors.error,
                          }}
                        >
                          {ticket.status}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <View
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: colors.primary }}
                        >
                          {ticket.priority}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <View className="gap-4">
              <Text className="font-semibold text-foreground">
                Get in Touch
              </Text>
              {contactOptions.map((option) => (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="bg-surface rounded-lg p-4 border border-border flex-row items-center gap-4"
                >
                  <Text className="text-2xl">{option.icon}</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">
                      {option.method}
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      {option.value}
                    </Text>
                  </View>
                  <Text className="text-primary">→</Text>
                </Pressable>
              ))}

              {/* Additional Resources */}
              <View className="bg-surface rounded-lg p-4 border border-border gap-3">
                <Text className="font-semibold text-foreground">
                  Additional Resources
                </Text>
                <Pressable className="flex-row justify-between items-center">
                  <Text className="text-sm text-foreground">
                    Safety Guidelines
                  </Text>
                  <Text className="text-primary">→</Text>
                </Pressable>
                <Pressable className="flex-row justify-between items-center border-t border-border pt-3">
                  <Text className="text-sm text-foreground">
                    Terms & Conditions
                  </Text>
                  <Text className="text-primary">→</Text>
                </Pressable>
                <Pressable className="flex-row justify-between items-center border-t border-border pt-3">
                  <Text className="text-sm text-foreground">
                    Privacy Policy
                  </Text>
                  <Text className="text-primary">→</Text>
                </Pressable>
              </View>

              {/* Emergency Contact */}
              <View className="bg-error rounded-lg p-4 gap-2">
                <Text className="font-semibold text-background">
                  Emergency Support
                </Text>
                <Text className="text-sm text-background">
                  For urgent safety concerns, call emergency services or our
                  24/7 hotline: +1 (555) 999-0000
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
