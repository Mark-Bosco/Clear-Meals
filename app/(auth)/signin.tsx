import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SignIn() {
  return (
    <View className='p-20'>
      <Text>Welcome!</Text>
      <Link href="/home" asChild>
        <Pressable className="items-center bg-gray-100 p-2 mt-2 mx-2 rounded-xl">
          <Text className="text-4xl text-black font-bold">Sign In</Text>
        </Pressable>
      </Link>
      <Link href="/signup" asChild>
        <Pressable className="items-center bg-gray-100 p-2 mt-2 mx-2 rounded-xl">
          <Text className="text-4xl text-black font-bold">Sign Up</Text>
        </Pressable>
      </Link>
    </View>
  );
}