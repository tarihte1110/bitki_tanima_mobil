// Prediction Card Component - Main prediction result display
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, CONFIDENCE_THRESHOLD } from '../constants/theme';
import { PredictionResult } from '../types';
import ConfidenceBar from './ConfidenceBar';

interface PredictionCardProps {
    prediction: PredictionResult;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction }) => {
    const isLowConfidence = prediction.confidence < CONFIDENCE_THRESHOLD.MEDIUM;

    return (
        <View style={styles.container}>
            {/* Plant Icon */}
            <View style={styles.iconContainer}>
                <Text style={styles.plantIcon}>🌿</Text>
            </View>

            {/* Prediction Title */}
            <Text style={styles.title}>Tahmin Sonucu</Text>

            {/* Plant Name */}
            <Text style={styles.plantName}>{prediction.className}</Text>

            {/* Confidence Bar */}
            <View style={styles.confidenceContainer}>
                <ConfidenceBar confidence={prediction.confidence} size="large" />
            </View>

            {/* Low Confidence Warning */}
            {isLowConfidence && (
                <View style={styles.warningContainer}>
                    <Text style={styles.warningIcon}>⚠️</Text>
                    <Text style={styles.warningText}>
                        Güven skoru düşük. Sonuç kesin olmayabilir.
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        alignItems: 'center',
        ...SHADOWS.large,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.secondaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    plantIcon: {
        fontSize: 40,
    },
    title: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textMuted,
        marginBottom: SPACING.xs,
    },
    plantName: {
        fontSize: FONTS.sizes.xxl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    confidenceContainer: {
        width: '100%',
        marginBottom: SPACING.md,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.sm,
    },
    warningIcon: {
        fontSize: 20,
        marginRight: SPACING.sm,
    },
    warningText: {
        flex: 1,
        fontSize: FONTS.sizes.sm,
        color: '#E65100',
    },
});

export default PredictionCard;
