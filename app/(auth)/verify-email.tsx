import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAuth } from './AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function VerifyEmail() {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const resendVerificationEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        setMessage('Verification email sent. Please check your inbox.');
        setIsError(false);
      } catch (error: any) {
        console.error('Error sending verification email.');
        setMessage('Failed to send verification email, try again later.');
        setIsError(true);
      }
    } else {
      setMessage('No user signed in. Please sign in again.');
      setIsError(true);
    }
  };

  return (
    <View className="flex-1 pt-20 bg-white items-center justify-top p-4">
      <Text className="text-5xl font-bold mb-4">Verify Your Email</Text>
      <Text className="text-center mb-4">
        Please verify your email address. Check your inbox for a verification link. Sign in once your email is verified.
      </Text>
      {message && (
        <View className={`${isError ? 'bg-red-700' : 'bg-yellow-600'} mb-2 p-2 rounded`}>
          <Text className="text-white font-bold">
            {message}
          </Text>
        </View>
      )}
      <Pressable
        className="bg-green-700 py-2 px-4 rounded active:bg-green-800"
        onPress={resendVerificationEmail}
      >
        <Text className="text-white text-lg font-bold">Resend Verification Email</Text>
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