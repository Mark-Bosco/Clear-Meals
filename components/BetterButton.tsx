import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ResponsiveButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({ 
  onPress, 
  title, 
  style, 
  textStyle, 
  disabled = false 
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled
      ]}
    >
      {({ pressed }) => (
        <Text style={[
          styles.buttonText,
          textStyle,
          pressed && styles.buttonTextPressed,
          disabled && styles.buttonTextDisabled
        ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#15803D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonPressed: {
    backgroundColor: '#166534',
    elevation: 1,
    shadowOpacity: 0.15,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextPressed: {
    color: '#E5E7EB',
  },
  buttonTextDisabled: {
    color: '#D1D5DB',
  },
});

export default ResponsiveButton;