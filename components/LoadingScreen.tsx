import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/lottie/loading-animation.json')} // Make sure to add your Lottie JSON file to the assets folder
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  animation: {
    width: 200,
    height: 200,
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default LoadingScreen;