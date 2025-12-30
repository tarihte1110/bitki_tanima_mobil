// Result Screen - Premium Design matching HomeScreen
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Dimensions,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { RootStackParamList, PlantDetails } from '../types';
import FloraMentor from '../components/FloraMentor';
import TopKList from '../components/TopKList';

// Import plant details
import plantDetailsData from '../../assets/plantDetails.json';

const { width } = Dimensions.get('window');

// Premium Theme (Same as HomeScreen)
const THEME = {
    bg: '#ffffff',
    primary: '#166534', // Green 800
    secondary: '#dcfce7', // Green 100
    text: '#1f2937', // Gray 800
    subtext: '#6b7280', // Gray 600
    accent: '#22c55e', // Green 500
    surface: '#f9fafb', // Gray 50
    border: '#f3f4f6', // Gray 200
    white: '#ffffff',
};

type ResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface ResultScreenProps {
    navigation: ResultScreenNavigationProp;
    route: ResultScreenRouteProp;
}

// Helper for status badges
const getStatusStyle = (type: 'toxicity' | 'edible', value: string) => {
    const lower = value.toLowerCase();

    if (type === 'toxicity') {
        if (lower.includes('çok zehirli')) return { bg: '#fee2e2', text: '#991b1b', icon: '☠️' }; // Red
        if (lower.includes('zehirli') && !lower.includes('değil')) return { bg: '#ffedd5', text: '#c2410c', icon: '⚠️' }; // Orange
        if (lower.includes('hafif')) return { bg: '#fef9c3', text: '#a16207', icon: '⚠️' }; // Yellow
        return { bg: '#dcfce7', text: '#166534', icon: '✅' }; // Green
    } else {
        if (lower.startsWith('evet')) return { bg: '#dcfce7', text: '#166534', icon: '🍽️' }; // Green
        if (lower.startsWith('hayır')) return { bg: '#fee2e2', text: '#991b1b', icon: '⛔' }; // Red
        return { bg: '#fef9c3', text: '#a16207', icon: '🤔' }; // Yellow
    }
};

export const ResultScreen: React.FC<ResultScreenProps> = ({ navigation, route }) => {
    const { imageUri, predictions } = route.params;
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showFloraMentor, setShowFloraMentor] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const shareCardRef = useRef<View>(null);

    const topPrediction = predictions[0];
    const topKPredictions = predictions.slice(0, 3); // Show top 3
    const plantDetails = (plantDetailsData as Record<string, PlantDetails>)[topPrediction.className];
    const confidencePercent = (topPrediction.confidence * 100).toFixed(0);

    const handleShare = async () => {
        if (!shareCardRef.current) return;
        setIsSharing(true);
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert('Hata', 'Paylaşım desteklenmiyor.');
                return;
            }
            // Add a small delay for UI updates if needed
            const uri = await captureRef(shareCardRef, { format: 'png', quality: 0.8 });
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: `Bitki Tanıma: ${plantDetails?.turkishName || topPrediction.className}`,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSharing(false);
        }
    };

    const toxicityStyle = plantDetails ? getStatusStyle('toxicity', plantDetails.toxicity) : null;
    const edibleStyle = plantDetails ? getStatusStyle('edible', plantDetails.edible) : null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sonuçlar</Text>
                <TouchableOpacity onPress={handleShare} style={styles.shareButton} disabled={isSharing}>
                    <Text style={styles.shareIcon}>📤</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Content Card (Capture Ref for Sharing) */}
                <View ref={shareCardRef} style={styles.mainCard} collapsable={false}>

                    {/* Image Container */}
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.plantImage} resizeMode="cover" />
                        <View style={styles.confidenceBadge}>
                            <Text style={styles.confidenceText}>%{confidencePercent} Eşleşme</Text>
                        </View>
                    </View>

                    {/* Basic Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.turkishName}>
                            {plantDetails?.turkishName || topPrediction.className}
                        </Text>
                        <Text style={styles.scientificName}>
                            {plantDetails?.scientificName || 'Bilimsel ad bulunamadı'}
                        </Text>

                        {/* Status Tags Row */}
                        {plantDetails && (
                            <View style={styles.tagsRow}>
                                <View style={[styles.statusTag, { backgroundColor: toxicityStyle?.bg }]}>
                                    <Text style={styles.statusIcon}>{toxicityStyle?.icon}</Text>
                                    <Text style={[styles.statusText, { color: toxicityStyle?.text }]}>
                                        {plantDetails.toxicity}
                                    </Text>
                                </View>
                                <View style={[styles.statusTag, { backgroundColor: edibleStyle?.bg }]}>
                                    <Text style={styles.statusIcon}>{edibleStyle?.icon}</Text>
                                    <Text style={[styles.statusText, { color: edibleStyle?.text }]}>
                                        {plantDetails.edible}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Description Section */}
                {plantDetails && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionIcon}>📖</Text>
                            <Text style={styles.sectionTitle}>Bitki Hakkında</Text>
                        </View>
                        <Text
                            style={styles.descriptionText}
                            numberOfLines={showFullDescription ? undefined : 4}
                        >
                            {plantDetails.description}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowFullDescription(!showFullDescription)}
                            style={styles.readMoreBtn}
                        >
                            <Text style={styles.readMoreText}>
                                {showFullDescription ? 'Daha az göster' : 'Devamını oku'}
                            </Text>
                        </TouchableOpacity>

                        {/* Geography */}
                        <View style={styles.geographyBox}>
                            <Text style={styles.geoTitle}>📍 Yayılış Alanı</Text>
                            <Text style={styles.geoText}>{plantDetails.geography}</Text>
                        </View>
                    </View>
                )}

                {/* Alternative Predictions */}
                <View style={[styles.sectionCard, styles.altCard]}>
                    <Text style={styles.sectionTitleSmall}>Diğer Olasılıklar</Text>
                    <TopKList predictions={topKPredictions} />
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.floraBtn}
                        onPress={() => setShowFloraMentor(true)}
                        activeOpacity={0.9}
                    >
                        <View style={styles.floraIconBox}>
                            <Text style={styles.floraIcon}>🌿</Text>
                        </View>
                        <View>
                            <Text style={styles.floraTitle}>FloraMentor'a Sor</Text>
                            <Text style={styles.floraSubtitle}>Yapay zeka asistanı</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.newBtn}
                        onPress={() => navigation.navigate('Home')}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.newBtnText}>Yeni Tarama</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* FloraMentor Modal */}
            <FloraMentor
                visible={showFloraMentor}
                onClose={() => setShowFloraMentor(false)}
                plantDetails={plantDetails || null}
                plantName={topPrediction.className}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
        paddingBottom: 20,
        backgroundColor: THEME.bg,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: THEME.surface,
    },
    backIcon: {
        fontSize: 24,
        color: THEME.text,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.text,
    },
    shareButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: THEME.surface,
    },
    shareIcon: {
        fontSize: 20,
    },

    // Content
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },

    // Main Card
    mainCard: {
        backgroundColor: THEME.white,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: THEME.border,
        marginBottom: 24,
        // Shadow (subtle)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    imageContainer: {
        height: 280,
        width: '100%',
        position: 'relative',
    },
    plantImage: {
        width: '100%',
        height: '100%',
    },
    confidenceBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(22, 101, 52, 0.9)', // Primary with opacity
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    confidenceText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
    },
    infoContainer: {
        padding: 24,
    },
    turkishName: {
        fontSize: 28,
        fontWeight: '800',
        color: THEME.text,
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    scientificName: {
        fontSize: 16,
        fontStyle: 'italic',
        color: THEME.accent,
        marginBottom: 20,
        fontWeight: '600',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    statusIcon: {
        marginRight: 6,
        fontSize: 14,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },

    // Description Section
    sectionCard: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.text,
    },
    sectionTitleSmall: {
        fontSize: 16,
        fontWeight: '700',
        color: THEME.subtext,
        marginBottom: 12,
        marginLeft: 4,
    },
    descriptionText: {
        fontSize: 15,
        color: THEME.text,
        lineHeight: 24,
        marginBottom: 8,
    },
    readMoreBtn: {
        alignSelf: 'flex-start',
    },
    readMoreText: {
        color: THEME.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    geographyBox: {
        marginTop: 20,
        padding: 16,
        backgroundColor: THEME.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    geoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.text,
        marginBottom: 4,
    },
    geoText: {
        fontSize: 14,
        color: THEME.subtext,
    },

    // Alternative Predictions
    altCard: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: THEME.border,
    },

    // Actions
    actionsContainer: {
        gap: 16,
    },
    floraBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.primary,
        padding: 20,
        borderRadius: 20,
        // Shadow
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    floraIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    floraIcon: {
        fontSize: 24,
    },
    floraTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    floraSubtitle: {
        color: THEME.secondary,
        fontSize: 13,
        marginTop: 2,
    },
    newBtn: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: THEME.surface,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border,
    },
    newBtnText: {
        color: THEME.text,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ResultScreen;
