// Top K Predictions List Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { PredictionResult } from '../types';

interface TopKListProps {
    predictions: PredictionResult[];
    title?: string;
}

const getMedalEmoji = (index: number): string => {
    switch (index) {
        case 0:
            return '🥇';
        case 1:
            return '🥈';
        case 2:
            return '🥉';
        default:
            return `${index + 1}.`;
    }
};

export const TopKList: React.FC<TopKListProps> = ({
    predictions,
    title = 'En Olası Tahminler',
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            {predictions.map((prediction, index) => (
                <View
                    key={prediction.classIndex}
                    style={[
                        styles.itemContainer,
                        index === 0 && styles.firstItem,
                    ]}
                >
                    <View style={styles.rankContainer}>
                        <Text style={styles.medal}>{getMedalEmoji(index)}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={[styles.className, index === 0 && styles.firstClassName]}>
                            {prediction.className}
                        </Text>
                        <View style={styles.progressContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    {
                                        width: `${Math.round(prediction.confidence * 100)}%`,
                                        backgroundColor: index === 0 ? COLORS.primary : COLORS.secondary,
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    <Text style={[styles.percentage, index === 0 && styles.firstPercentage]}>
                        %{Math.round(prediction.confidence * 100)}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.medium,
    },
    title: {
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    firstItem: {
        backgroundColor: COLORS.secondaryLight + '30',
        marginHorizontal: -SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderBottomWidth: 0,
        marginBottom: SPACING.xs,
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
    },
    medal: {
        fontSize: 24,
    },
    infoContainer: {
        flex: 1,
        marginRight: SPACING.md,
    },
    className: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    firstClassName: {
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    progressContainer: {
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    percentage: {
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        color: COLORS.textSecondary,
        minWidth: 50,
        textAlign: 'right',
    },
    firstPercentage: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default TopKList;
