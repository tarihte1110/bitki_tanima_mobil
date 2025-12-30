// Main App Entry Point
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, LogBox } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS, FONTS, SPACING } from './src/constants/theme';

// Suppress harmless warnings
LogBox.ignoreLogs([
  'ImagePicker.MediaTypeOptions',
]);

export default function App() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [tfError, setTfError] = useState<string | null>(null);

  useEffect(() => {
    initializeTensorFlow();
  }, []);

  const initializeTensorFlow = async () => {
    try {
      console.log('Initializing TensorFlow.js...');
      await tf.ready();
      console.log('TensorFlow.js is ready! Backend:', tf.getBackend());
      setIsTfReady(true);
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js:', error);
      setTfError('TensorFlow.js başlatılamadı');
    }
  };

  // Show loading screen while TF.js initializes
  if (!isTfReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>🌱</Text>
        <Text style={styles.loadingTitle}>Bitki Tanıma</Text>
        {tfError ? (
          <Text style={styles.errorText}>{tfError}</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
            <Text style={styles.loadingText}>Başlatılıyor...</Text>
          </>
        )}
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  loadingTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  spinner: {
    marginVertical: SPACING.lg,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
