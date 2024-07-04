import { AuthProvider } from "./(auth)/AuthContext";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(screens)" options={{ headerShown: false }} />
            </Stack>
        </AuthProvider>
    );
}