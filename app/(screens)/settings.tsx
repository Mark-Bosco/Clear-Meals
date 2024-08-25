import React, { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { deleteUserData } from '@/backend/firestore';

const Settings = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [password, setPassword] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)/signin');
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    const reauthenticate = async (password: string) => {
        if (!user || !user.email) return false;

        const credential = EmailAuthProvider.credential(user.email, password);
        try {
            await reauthenticateWithCredential(user, credential);
            return true;
        } catch (error) {
            console.error('Error reauthenticating:', error);
            return false;
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        setIsDeleting(true);
        try {
            const isReauthenticated = await reauthenticate(password);
            if (!isReauthenticated) {
                Alert.alert('Error', 'Failed to reauthenticate. Please check your password and try again.');
                return;
            }

            // First, delete the user's Firestore data
            await deleteUserData(user.uid);

            // Then, delete the user account
            await deleteUser(user);

            router.replace('/(auth)/signin');
        } catch (error) {
            console.error('Error deleting account:', error);
            Alert.alert('Error', 'Failed to delete account. Please try again.');
        } finally {
            setIsDeleting(false);
            setIsModalVisible(false);
        }
    };

    const confirmDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone and will delete all your data.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: () => setIsModalVisible(true),
                    style: 'destructive'
                },
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Enter your password to confirm account deletion:</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                        />
                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    setPassword('');
                                }}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.deleteButton]}
                                onPress={handleDeleteAccount}
                            >
                                <Text style={styles.buttonText}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
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
    cancelButton: {
        backgroundColor: '#6b7280',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        height: 40,
        width: 200,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        width: '50%'
    },
});

export default Settings;