// In index.tsx

import { useAuth } from './(auth)/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import React from 'react';

export default function Index() {
  const router = useRouter();
  const { user, isLoading, isEmailVerified } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (isEmailVerified) {
          router.replace('/(screens)/home');
        } else {
          router.replace('/(auth)/verify-email');
        }
      } else {
        router.replace('/(auth)/signin');
      }
    }
  }, [isLoading, user, isEmailVerified, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return null;
}