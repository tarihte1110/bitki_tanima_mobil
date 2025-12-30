// Theme constants for the plant recognition app

export const COLORS = {
    // Primary colors - green tones for plant theme
    primary: '#2E7D32',
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',

    // Secondary colors
    secondary: '#81C784',
    secondaryLight: '#A5D6A7',

    // Accent colors
    accent: '#00BFA5',
    accentLight: '#64FFDA',

    // Background colors
    background: '#F1F8E9',
    backgroundDark: '#0D1B0F',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
    cardBackgroundDark: 'rgba(30, 50, 35, 0.95)',

    // Text colors
    textPrimary: '#1B5E20',
    textSecondary: '#558B2F',
    textLight: '#FFFFFF',
    textDark: '#1A1A1A',
    textMuted: '#757575',

    // Confidence level colors
    confidenceHigh: '#4CAF50',
    confidenceMedium: '#FFC107',
    confidenceLow: '#FF5722',

    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',

    // UI colors
    border: '#C8E6C9',
    shadow: 'rgba(0, 0, 0, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Gradient colors
    gradientStart: '#1B5E20',
    gradientMiddle: '#2E7D32',
    gradientEnd: '#4CAF50',
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
        hero: 48,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

// Confidence threshold for showing warning
export const CONFIDENCE_THRESHOLD = {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4,
};

// Model configuration
export const MODEL_CONFIG = {
    INPUT_SIZE: 224,
    NUM_CLASSES: 86,
    TOP_K: 3,
};
