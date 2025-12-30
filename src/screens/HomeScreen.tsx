// Home Screen - Premium Design
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    Image,
    Platform
} from 'react-native';
import * as tf from '@tensorflow/tfjs';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';
import modelService from '../services/modelService';
import plantDetectorService from '../services/plantDetector';
import { preprocessImage, disposeTensor } from '../services/imageProcessor';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
    navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

// Premium Dark Theme Colors
const THEME = {
    bg: '#ffffff',
    primary: '#166534', // Green 800
    secondary: '#dcfce7', // Green 100
    text: '#1f2937', // Gray 800
    accent: '#22c55e', // Green 500
    surface: '#f3f4f6', // Gray 100
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [modelLoadError, setModelLoadError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initialize model on mount
    useFocusEffect(
        useCallback(() => {
            initializeModel();
        }, [])
    );

    const initializeModel = async () => {
        if (modelService.isModelLoaded() && plantDetectorService.isLoaded()) {
            setIsModelLoading(false);
            return;
        }

        try {
            setIsModelLoading(true);
            setModelLoadError(null);

            // Load both models in parallel
            await Promise.all([
                modelService.initialize(),
                plantDetectorService.initialize()
            ]);

            setIsModelLoading(false);
        } catch (error) {
            console.error('Model initialization failed:', error);
            setModelLoadError('Model yüklenemedi. Lütfen uygulamayı yeniden başlatın.');
            setIsModelLoading(false);
        }
    };

    const processImage = async (imageUri: string) => {
        setIsProcessing(true);

        try {
            // Preprocess image
            const tensor = await preprocessImage(imageUri);

            // STEP 1: Check if image contains a plant using MobileNet
            console.log('═══════════════════════════════════════');
            console.log('🔍 STEP 1: Plant Detection (MobileNet)');

            const plantCheck = await plantDetectorService.isPlantImage(tensor as tf.Tensor3D);

            if (!plantCheck.isPlant) {
                disposeTensor(tensor);
                console.log('❌ REJECTED: Image does not contain a plant');

                const topDetection = plantCheck.topPredictions[0];
                Alert.alert(
                    '🚫 Bitki Tespit Edilemedi',
                    `Bu görsel bir bitki içermiyor gibi görünüyor.\n\nTespit edilen: ${topDetection?.className || 'Bilinmiyor'}\n\nLütfen net bir bitki fotoğrafı yükleyin.`,
                    [{ text: 'Tamam', style: 'default' }]
                );
                return;
            }

            // STEP 2: Run plant species classification
            console.log('═══════════════════════════════════════');
            console.log('🌿 STEP 2: Plant Species Classification');

            const predictions = await modelService.predict(tensor);
            disposeTensor(tensor);

            const top1 = predictions[0];
            console.log(`🎯 Species: ${top1.className} (${(top1.confidence * 100).toFixed(1)}%)`);
            console.log('✅ ACCEPTED: Plant identified successfully');

            // Navigate to result screen
            navigation.navigate('Result', {
                imageUri,
                predictions: predictions.slice(0, 5),
            });
        } catch (error) {
            console.error('Image processing failed:', error);
            Alert.alert('Hata', 'Görüntü işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsProcessing(false);
        }
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Kamerayı kullanabilmek için izin vermeniz gerekiyor.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await processImage(result.assets[0].uri);
        }
    };

    const openGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Galeriye erişebilmek için izin vermeniz gerekiyor.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await processImage(result.assets[0].uri);
        }
    };

    if (isModelLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={styles.loadingText}>Yapay Zeka Hazırlanıyor...</Text>
                <Text style={styles.loadingSubText}>Doğa kütüphanesi yükleniyor</Text>
            </View>
        );
    }

    if (modelLoadError) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{modelLoadError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={initializeModel}>
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Merhaba, Gezgin 👋</Text>
                        <Text style={styles.title}>Doğayı Keşfet</Text>
                    </View>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoIcon}>🌿</Text>
                    </View>
                </View>

                {/* Hero Card */}
                <View style={styles.heroCard}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>Bitki Tanıma Asistanı</Text>
                        <Text style={styles.heroSubtitle}>
                            Bilinmeyen bir bitki mi gördün? Fotoğrafını çek, yapay zeka saniyeler içinde tanısın.
                        </Text>
                        <View style={styles.heroTags}>
                            <View style={styles.tag}><Text style={styles.tagText}>⚡ Hızlı</Text></View>
                            <View style={styles.tag}><Text style={styles.tagText}>🧠 Akıllı</Text></View>
                            <View style={styles.tag}><Text style={styles.tagText}>🎯 Hassas</Text></View>
                        </View>
                    </View>
                    <View style={styles.decorCircle1} />
                    <View style={styles.decorCircle2} />
                </View>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>Özellikler</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuresScroll}>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureIcon}>📸</Text>
                            <Text style={styles.featureTitle}>Anında Tanıma</Text>
                            <Text style={styles.featureDesc}>Fotoğraftan tür tahmini</Text>
                        </View>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureIcon}>🧪</Text>
                            <Text style={styles.featureTitle}>Zehirlilik</Text>
                            <Text style={styles.featureDesc}>Güvenlik analizi</Text>
                        </View>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureIcon}>🤖</Text>
                            <Text style={styles.featureTitle}>FloraMentor</Text>
                            <Text style={styles.featureDesc}>AI Botanik asistanı</Text>
                        </View>
                    </ScrollView>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    <TouchableOpacity style={styles.cameraButton} onPress={openCamera} activeOpacity={0.9}>
                        <View style={styles.cameraIconContainer}>
                            <Text style={styles.cameraIcon}>📷</Text>
                        </View>
                        <View style={styles.buttonTexts}>
                            <Text style={styles.cameraButtonTitle}>Fotoğraf Çek</Text>
                            <Text style={styles.cameraButtonSubtitle}>Kamerayı başlat</Text>
                        </View>
                        <Text style={styles.arrowIcon}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.galleryButton} onPress={openGallery} activeOpacity={0.9}>
                        <View style={styles.galleryIconContainer}>
                            <Text style={styles.galleryIcon}>🖼️</Text>
                        </View>
                        <View style={styles.buttonTexts}>
                            <Text style={styles.galleryButtonTitle}>Galeriden Seç</Text>
                            <Text style={styles.galleryButtonSubtitle}>Fotoğraf yükle</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Processing Overlay */}
            {isProcessing && (
                <View style={styles.overlay}>
                    <View style={styles.overlayContent}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={styles.overlayText}>Analiz Ediliyor...</Text>
                        <Text style={styles.overlaySubText}>Yapay Zeka çalışıyor</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        padding: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 20 : 60,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    greeting: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        color: '#111827',
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    logoContainer: {
        width: 50,
        height: 50,
        backgroundColor: '#f0fdf4',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    logoIcon: {
        fontSize: 24,
    },

    // Hero Card
    heroCard: {
        backgroundColor: '#166534',
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
        overflow: 'hidden',
        position: 'relative',
        ...SHADOWS.medium,
    },
    heroContent: {
        zIndex: 2,
    },
    heroTitle: {
        fontSize: 22,
        color: '#ffffff',
        fontWeight: '700',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#dcfce7',
        lineHeight: 22,
        marginBottom: 20,
        opacity: 0.9,
    },
    heroTags: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tagText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    decorCircle1: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: -40,
        left: -20,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },

    // Features
    featuresSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    featuresScroll: {
        gap: 16,
        paddingRight: 20,
    },
    featureCard: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 16,
        width: 130,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    featureIcon: {
        fontSize: 24,
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 12,
        color: '#6b7280',
    },

    // Actions
    actionsSection: {
        gap: 16,
    },
    cameraButton: {
        backgroundColor: '#166534',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        ...SHADOWS.medium,
    },
    cameraIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cameraIcon: {
        fontSize: 24,
    },
    buttonTexts: {
        flex: 1,
    },
    cameraButtonTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    cameraButtonSubtitle: {
        color: '#dcfce7',
        fontSize: 13,
    },
    arrowIcon: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '300',
    },
    galleryButton: {
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    galleryIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#f3f4f6',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    galleryIcon: {
        fontSize: 24,
    },
    galleryButtonTitle: {
        color: '#1f2937',
        fontSize: 18,
        fontWeight: '700',
    },
    galleryButtonSubtitle: {
        color: '#6b7280',
        fontSize: 13,
    },

    // Loaders & Errors
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: '600',
        color: '#166534',
    },
    loadingSubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#6b7280',
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 40,
    },
    retryButton: {
        backgroundColor: '#166534',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    },

    // Overlay
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    overlayContent: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
    },
    overlayText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
    },
    overlaySubText: {
        color: '#dcfce7',
        fontSize: 14,
        marginTop: 8,
    },
});

export default HomeScreen;
