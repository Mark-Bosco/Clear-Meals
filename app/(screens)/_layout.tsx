import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
      <Stack>
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="nutrition" options={{ headerShown: true }} />
        {/* <Stack.Screen name="history" options={{ headerShown: false }} /> */}
        {/* <Stack.Screen name="settings" options={{ headerShown: false }} /> */}
      </Stack>
  );
}