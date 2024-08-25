import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { router } from 'expo-router';

export default function VerifyEmail() {
  const { user } = useAuth();
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
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.description}>
        Please verify your email address. Check your inbox for a verification link. Sign in once your email is verified.
      </Text>
      {message && (
        <View style={[styles.messageContainer, isError ? styles.errorContainer : styles.warningContainer]}>
          <Text style={styles.messageText}>
            {message}
          </Text>
        </View>
      )}
      <Pressable
        style={({ pressed }) => [styles.resendButton, pressed && styles.resendButtonPressed]}
        onPress={resendVerificationEmail}
      >
        <Text style={styles.resendButtonText}>Resend Verification Email</Text>
      </Pressable>
      <Pressable
        style={styles.signInButton}
        onPress={() => router.replace('/(auth)/signin')}
      >
        <Text style={styles.signInButtonText}>Continue to Sign In</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
  },
  messageContainer: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
  },
  errorContainer: {
    backgroundColor: '#B91C1C',
  },
  warningContainer: {
    backgroundColor: '#CA8A04',
  },
  messageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resendButton: {
    backgroundColor: '#15803D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  resendButtonPressed: {
    backgroundColor: '#166534',
  },
  resendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInButton: {
    marginTop: 16,
  },
  signInButtonText: {
    fontWeight: 'bold',
    color: '#4B5563',
  },
});
