import { AuthProvider } from "../contexts/AuthContext";
import { Stack } from "expo-router";
import React from "react";

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