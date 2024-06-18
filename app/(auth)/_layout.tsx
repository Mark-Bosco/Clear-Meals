import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signInScreen" options={{ headerShown: false }} />
      <Stack.Screen name="signUpScreen" options={{ headerShown: false }} />
    </Stack>
  );
}