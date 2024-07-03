import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
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

  const resetFields = () => {
    setValue({
      email: '',
      password: '',
      error: ''
    });
  };

  async function signUp() {
    setValue((currentValue) => {
      if (!currentValue.email || !currentValue.password) {
        return { ...currentValue, error: 'Please enter both email and password.' };
      }

      createUserWithEmailAndPassword(auth, currentValue.email, currentValue.password)
        .then((userCredential) => {
          // Send verification email
          sendEmailVerification(userCredential.user)
            .then(() => {
              router.replace('/(auth)/verify-email');
            })
            .catch(() => {
              setValue((prevValue) => ({ ...prevValue, error: 'Account created, but failed to send verification email. Please try to sign in to resend the verification email.' }));
            });
        })
        .catch((error) => {
          // Handle different types of errors
          switch (error.code) {
            case 'auth/email-already-in-use':
              setValue((prevValue) => ({ ...prevValue, error: 'This email is already in use. Please try a different email or sign in.' }));
              break;
            case 'auth/invalid-email':
              setValue((prevValue) => ({ ...prevValue, error: 'Please enter a valid email.' }));
              break;
            case 'auth/weak-password':
              setValue((prevValue) => ({ ...prevValue, error: 'Please use a password at least 6 characters long.' }));
              break;
            default:
              setValue((prevValue) => ({ ...prevValue, error: 'An error occurred during sign up. Please try again.' }));
          }
        });

      return currentValue;
    });
  }

  return (
    <View className="flex-1 pt-20 bg-white items-center justify-top p-4">
      <Text className="text-6xl font-bold mb-4">Sign Up</Text>

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
            onChangeText={(text) => setValue((prevValue) => ({ ...prevValue, email: text }))}
          />
        </View>

        <View className="flex-row items-center border-b border-gray-300 py-2 mb-4">
          <Ionicons name="key-outline" size={24} color="gray" />
          <TextInput
            className="flex-1 ml-2"
            placeholder="Password"
            value={value.password}
            onChangeText={(text) => setValue((prevValue) => ({ ...prevValue, password: text }))}
            secureTextEntry={true}
          />
        </View>

        <Pressable
          className="bg-green-700 py-2 px-4 rounded active:bg-green-800"
          onPress={signUp}
        >
          {({ pressed }) => (
            <Text className={`text-white text-center font-bold ${pressed ? 'opacity-75' : ''}`}>
              Sign up
            </Text>
          )}
        </Pressable>

        <Link href="/signin" asChild>
          <Pressable
            className="mt-4"
            onPress={resetFields}>
            {({ pressed }) => (
              <Text className={`text-center text-gray-600 ${pressed ? 'opacity-75' : ''}`}>
                Sign in
              </Text>
            )}
          </Pressable>
        </Link>
      </View>
    </View>
  );
}