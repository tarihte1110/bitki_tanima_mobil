// Header Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface HeaderProps {
    title: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    showBackButton = false,
    onBackPress,
}) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

            {showBackButton && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBackPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.title}>{title}</Text>

            {/* Spacer for centering title when back button is shown */}
            {showBackButton && <View style={styles.spacer} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + SPACING.sm : SPACING.xl + SPACING.md,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
    },
    backButton: {
        position: 'absolute',
        left: SPACING.md,
        bottom: SPACING.md,
        padding: SPACING.xs,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.textLight,
        fontWeight: 'bold',
    },
    title: {
        fontSize: FONTS.sizes.xl,
        fontWeight: 'bold',
        color: COLORS.textLight,
        textAlign: 'center',
    },
    spacer: {
        width: 40,
    },
});

export default Header;
