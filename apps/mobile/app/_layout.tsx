import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#f6f5ef" },
          headerTintColor: "#18231d",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#f6f5ef" }
        }}
      >
        <Stack.Screen name="index" options={{ title: "PATH", headerShown: false }} />
      </Stack>
    </>
  );
}
