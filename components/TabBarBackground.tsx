
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import React from 'react';
import { colors } from '@/styles/commonStyles';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  fallback: {
    backgroundColor: colors.surface,
    opacity: 0.95,
  },
});

export default function TabBarBackground() {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={80}
        tint="systemMaterial"
        style={styles.container}
      />
    );
  }

  return <View style={[styles.container, styles.fallback]} />;
}
