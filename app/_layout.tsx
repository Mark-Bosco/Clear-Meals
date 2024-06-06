import { Stack } from "expo-router";
import "../global.css"
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        {/* <Stack.Screen name="history" options={{ headerShown: false }} /> */}
        {/* <Stack.Screen name="settings" options={{ headerShown: false }} /> */}
      </Stack>
    </PaperProvider>
  );
}
