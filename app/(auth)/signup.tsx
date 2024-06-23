import { auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function SignUp() {
  const router = useRouter();
  const [value, setValue] = React.useState({
    email: '',
    password: '',
    error: ''
  });

  async function signUp() {
    if (value.email === '' || value.password === '') {
      setValue({ ...value, error: 'Email and password required' });
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, value.email, value.password);
      // Navigate to the home screen using expo router
      router.replace('/home');
    } catch (error : any) {
      setValue({ ...value, error: error.message });
    }

    setValue({ ...value, error: '' });
  }

  return (
    <View className="flex-1 pt-5 bg-white items-center justify-center p-4">
      <Text className="text-xl font-bold mb-4">Signup screen!</Text>

      {!!value.error && (
        <View className="mt-2 p-2 bg-red-500 rounded">
          <Text className="text-white">{value.error}</Text>
        </View>
      )}

      <View className="w-full">
        <View className="flex-row items-center border-b border-gray-300 py-2 mb-4">
          <Ionicons name="mail-outline" size={24} color="gray" />
          <TextInput
            className="flex-1 ml-2"
            placeholder="Email"
            value={value.email}
            onChangeText={(text) => setValue({ ...value, email: text })}
          />
        </View>

        <View className="flex-row items-center border-b border-gray-300 py-2 mb-4">
          <Ionicons name="key-outline" size={24} color="gray" />
          <TextInput
            className="flex-1 ml-2"
            placeholder="Password"
            value={value.password}
            onChangeText={(text) => setValue({ ...value, password: text })}
            secureTextEntry={true}
          />
        </View>

        <Pressable
          className="bg-blue-500 py-2 px-4 rounded active:bg-blue-600"
          onPress={signUp}
        >
          {({ pressed }) => (
            <Text className={`text-white text-center font-bold ${pressed ? 'opacity-75' : ''}`}>
              Sign up
            </Text>
          )}
        </Pressable>

        <Link href="/signin" asChild>
          <Pressable className="mt-4">
            {({ pressed }) => (
              <Text className={`text-center text-blue-500 ${pressed ? 'opacity-75' : ''}`}>
                Already have an account? Sign in
              </Text>
            )}
          </Pressable>
        </Link>
      </View>
    </View>
  );
}