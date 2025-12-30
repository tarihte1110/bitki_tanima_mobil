// Confidence Bar Component - Visual progress bar for prediction confidence
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, BORDER_RADIUS, CONFIDENCE_THRESHOLD } from '../constants/theme';

interface ConfidenceBarProps {
    confidence: number; // 0-1
    showPercentage?: boolean;
    size?: 'small' | 'medium' | 'large';
    animated?: boolean;
}

const getConfidenceColor = (confidence: number): string => {
    if (confidence >= CONFIDENCE_THRESHOLD.HIGH) {
        return COLORS.confidenceHigh;
    } else if (confidence >= CONFIDENCE_THRESHOLD.MEDIUM) {
        return COLORS.confidenceMedium;
    }
    return COLORS.confidenceLow;
};

const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= CONFIDENCE_THRESHOLD.HIGH) {
        return 'Yüksek Güven';
    } else if (confidence >= CONFIDENCE_THRESHOLD.MEDIUM) {
        return 'Orta Güven';
    }
    return 'Düşük Güven';
};

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
    confidence,
    showPercentage = true,
    size = 'medium',
    animated = true,
}) => {
    const percentage = Math.round(confidence * 100);
    const barColor = getConfidenceColor(confidence);
    const label = getConfidenceLabel(confidence);

    const heights = {
        small: 6,
        medium: 10,
        large: 14,
    };

    const barHeight = heights[size];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.label, { color: barColor }]}>{label}</Text>
                {showPercentage && (
                    <Text style={[styles.percentage, { color: barColor }]}>
                        %{percentage}
                    </Text>
                )}
            </View>
            <View style={[styles.barBackground, { height: barHeight }]}>
                <View
                    style={[
                        styles.barFill,
                        {
                            width: `${percentage}%`,
                            height: barHeight,
                            backgroundColor: barColor,
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontSize: FONTS.sizes.sm,
        fontWeight: '600',
    },
    percentage: {
        fontSize: FONTS.sizes.lg,
        fontWeight: 'bold',
    },
    barBackground: {
        width: '100%',
        backgroundColor: COLORS.border,
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
    },
    barFill: {
        borderRadius: BORDER_RADIUS.full,
    },
});

export default ConfidenceBar;
