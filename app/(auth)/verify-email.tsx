import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAuth } from './AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function VerifyEmail() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState('');

  const resendVerificationEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        setError('Verification email sent. Please check your inbox.');
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  return (
    <View className="flex-1 pt-20 bg-white items-center justify-top p-4">
      <Text className="text-2xl font-bold mb-4">Verify Your Email</Text>
      <Text className="text-center mb-4">
        Please verify your email address. Check your inbox for a verification link. Sign in once your email is verified.
      </Text>
      {error && <Text className="text-red-500 mb-4">{error}</Text>}
      <Pressable
        className="bg-green-700 py-2 px-4 rounded active:bg-green-800"
        onPress={resendVerificationEmail}
      >
        <Text className="text-white font-bold">Resend Verification Email</Text>
      </Pressable>
      <Pressable
        className="mt-4"
        onPress={() => router.replace('/(auth)/signin')}
      >
        <Text className="font-bold text-gray-600">Continue to Sign In</Text>
      </Pressable>
    </View>
  );
}