import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { davidPath } from "@path/path-engine/david";

const green = "#285b43";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>PA<Text style={styles.brandAccent}>TH</Text></Text>
          <Text style={styles.kicker}>SCRIPTURE · UNDERSTANDING · PRACTICE</Text>
        </View>

        <Text style={styles.title}>Don’t just read Scripture. <Text style={styles.titleAccent}>Know it.</Text></Text>
        <Text style={styles.intro}>
          A guided journey to explore the story, understand what you read, remember what matters,
          and connect Scripture.
        </Text>

        <View style={styles.pathCard}>
          <Text style={styles.cardKicker}>YOUR FIRST LEARNING JOURNEY</Text>
          <Text style={styles.cardTitle}>{davidPath.title}</Text>
          <Text style={styles.cardCopy}>{davidPath.subtitle} · {davidPath.estimatedMinutes} min</Text>
          <View style={styles.steps}>
            {davidPath.steps.slice(0, 5).map((step, index) => (
              <View key={step.id} style={styles.step}>
                <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.reference}>{step.scriptureReferences.join(" · ")}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>The PATH learning loop</Text>
        <Text style={styles.loop}>Read → Explore → Understand → Remember → Test → Connect</Text>
        <Text style={styles.note}>Progress means understanding and recall—not just checking a box.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f5ef" },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 42 },
  header: { marginBottom: 34 },
  brand: { color: "#18231d", fontSize: 20, fontWeight: "900", letterSpacing: 4 },
  brandAccent: { color: green },
  kicker: { marginTop: 10, color: green, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: "#18231d", fontSize: 42, fontWeight: "800", letterSpacing: -1.8, lineHeight: 47 },
  titleAccent: { color: green },
  intro: { marginTop: 16, color: "#68756d", fontSize: 16, lineHeight: 25 },
  pathCard: { marginTop: 28, padding: 20, borderRadius: 22, borderWidth: 1, borderColor: "#e1e5dc", backgroundColor: "#fff" },
  cardKicker: { color: "#68756d", fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  cardTitle: { marginTop: 10, color: "#18231d", fontSize: 24, fontWeight: "800", letterSpacing: -0.7 },
  cardCopy: { marginTop: 6, color: "#68756d", fontSize: 13 },
  steps: { marginTop: 18 },
  step: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#edf0e9" },
  number: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#edf3ed", alignItems: "center", justifyContent: "center" },
  numberText: { color: green, fontSize: 12, fontWeight: "800" },
  stepText: { flex: 1, marginLeft: 12 },
  stepTitle: { color: "#18231d", fontSize: 14, fontWeight: "700" },
  reference: { marginTop: 3, color: "#68756d", fontSize: 11 },
  sectionTitle: { marginTop: 32, color: "#18231d", fontSize: 21, fontWeight: "800", letterSpacing: -0.5 },
  loop: { marginTop: 10, color: green, fontSize: 14, fontWeight: "700", lineHeight: 24 },
  note: { marginTop: 8, color: "#68756d", fontSize: 13, lineHeight: 20 }
});
