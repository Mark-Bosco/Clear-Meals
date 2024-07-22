import { Stack } from "expo-router";
import React from "react";
import { FoodListProvider } from "../FoodListContext";

export default function ScreensLayout() {
  return (
    <FoodListProvider>
      <Stack>
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="nutrition" options={{ headerShown: false }} />
        {/* <Stack.Screen name="history" options={{ headerShown: false }} /> */}
        {/* <Stack.Screen name="settings" options={{ headerShown: false }} /> */}
      </Stack>
    </FoodListProvider>
  );
}