// settings.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut, deleteUser } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../(auth)/AuthContext';

const Settings = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)/signin');
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        setIsDeleting(true);
        try {
            await deleteUser(user);
            router.replace('/(auth)/signin');
        } catch (error) {
            console.error('Error deleting account:', error);
            Alert.alert('Error', 'Failed to delete account. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: handleDeleteAccount, style: 'destructive' },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <Pressable style={styles.button} onPress={handleSignOut}>
                <Text style={styles.buttonText}>Log Out</Text>
            </Pressable>

            <Pressable
                style={[styles.button, styles.deleteButton]}
                onPress={confirmDeleteAccount}
                disabled={isDeleting}
            >
                <Text style={styles.buttonText}>
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 40,
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#15803D',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: '#bc2f2f',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
});

export default Settings;