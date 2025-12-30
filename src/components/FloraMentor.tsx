// FloraMentor Component - AI Botanist Chat with Preset Questions
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { getAllAnswers, getWelcomeMessage, PRESET_QUESTIONS } from '../services/floraMentorService';
import { PlantDetails } from '../types';
import { SHADOWS } from '../constants/theme';

interface FloraMentorProps {
    visible: boolean;
    onClose: () => void;
    plantDetails: PlantDetails | null;
    plantName: string;
}

const { height } = Dimensions.get('window');

export const FloraMentor: React.FC<FloraMentorProps> = ({
    visible,
    onClose,
    plantDetails,
    plantName
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [cachedAnswers, setCachedAnswers] = useState<Record<string, string> | null>(null);
    const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch all answers when modal opens (if not already fetched for this plant)
    useEffect(() => {
        if (visible && plantDetails && !cachedAnswers) {
            fetchAllAnswers();
        }
    }, [visible, plantDetails]);

    // Reset loop if plant changes (though normally ResultScreen unmounts)
    useEffect(() => {
        setCachedAnswers(null);
        setCurrentAnswer(null);
        setActiveQuestionId(null);
    }, [plantName]);

    const fetchAllAnswers = async () => {
        if (!plantDetails) return;

        setIsLoading(true);
        setError(null);

        try {
            const answers = await getAllAnswers({
                turkishName: plantDetails.turkishName,
                scientificName: plantDetails.scientificName,
                toxicity: plantDetails.toxicity,
                edible: plantDetails.edible,
                geography: plantDetails.geography,
                description: plantDetails.description,
            });
            setCachedAnswers(answers);
        } catch (err) {
            console.error(err);
            setError('Botanik bilgilerine ulaşılamadı. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuestionPress = (questionId: string) => {
        if (!cachedAnswers) return;

        setActiveQuestionId(questionId);
        const answer = cachedAnswers[questionId];

        if (answer) {
            setCurrentAnswer(answer);
        } else {
            setCurrentAnswer('Bu konuda henüz bir bilgim yok.');
        }
    };

    const handleClose = () => {
        onClose();
    };

    const welcomeMessage = getWelcomeMessage(plantDetails?.turkishName || plantName);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerIcon}>🌿</Text>
                            <View>
                                <Text style={styles.headerTitle}>FloraMentor</Text>
                                <Text style={styles.headerSubtitle}>Bilge Botanikçiniz</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView
                        style={styles.contentScroll}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Initial Loading State */}
                        {isLoading && !cachedAnswers ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#166534" />
                                <Text style={styles.loadingMainText}>Bitki Bilgeliği Toplanıyor...</Text>
                                <Text style={styles.loadingSubText}>Tüm sorular için yanıtlar hazırlanıyor</Text>
                            </View>
                        ) : (
                            <>
                                {/* Message Box */}
                                <View style={styles.messageContainer}>
                                    {error ? (
                                        <View style={styles.errorBox}>
                                            <Text style={styles.errorIcon}>⚠️</Text>
                                            <Text style={styles.errorText}>{error}</Text>
                                            <TouchableOpacity onPress={fetchAllAnswers} style={styles.retryBtn}>
                                                <Text style={styles.retryText}>Tekrar Dene</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : currentAnswer ? (
                                        <View style={styles.answerBox}>
                                            <Text style={styles.answerText}>{currentAnswer}</Text>
                                            <Text style={styles.signature}>— FloraMentor 🌿</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.welcomeBox}>
                                            <Text style={styles.welcomeText}>{welcomeMessage}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Question Buttons */}
                                <Text style={styles.questionsTitle}>Soru Sor (Anında Yanıt)</Text>
                                <View style={styles.questionsGrid}>
                                    {PRESET_QUESTIONS.map((q) => (
                                        <TouchableOpacity
                                            key={q.id}
                                            style={[
                                                styles.questionButton,
                                                activeQuestionId === q.id && styles.questionButtonActive,
                                                !cachedAnswers && styles.questionButtonDisabled
                                            ]}
                                            onPress={() => handleQuestionPress(q.id)}
                                            disabled={!cachedAnswers}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.questionIcon}>
                                                {q.label.split(' ')[0]} {/* Emoji only */}
                                            </Text>
                                            <Text style={[
                                                styles.questionLabel,
                                                activeQuestionId === q.id && styles.questionLabelActive
                                            ]}>
                                                {q.label.split(' ').slice(1).join(' ')} {/* Text only */}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Yapay zeka yanıtları anında cebinizde</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        height: height * 0.85,
        ...SHADOWS.large,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#166534',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#6B7280',
    },
    contentScroll: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },

    // Loading
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    loadingMainText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#166534',
        textAlign: 'center',
    },
    loadingSubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },

    // Messages
    messageContainer: {
        marginBottom: 24,
        minHeight: 120, // Prevent layout shift
    },
    welcomeBox: {
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    welcomeText: {
        fontSize: 15,
        color: '#1F2937',
        lineHeight: 24,
    },
    answerBox: {
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    answerText: {
        fontSize: 15,
        color: '#1F2937',
        lineHeight: 24,
    },
    signature: {
        fontSize: 13,
        fontStyle: 'italic',
        color: '#16A34A',
        marginTop: 12,
        textAlign: 'right',
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#FECACA',
        alignItems: 'center',
    },
    errorIcon: { fontSize: 24, marginBottom: 8 },
    errorText: { color: '#991B1B', textAlign: 'center', marginBottom: 12 },
    retryBtn: { backgroundColor: '#FFFFFF', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
    retryText: { color: '#991B1B', fontWeight: '600' },

    // Questions Grid
    questionsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    questionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    questionButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 16,
        width: '47%', // 2 Columns
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    questionButtonActive: {
        borderColor: '#166534',
        backgroundColor: '#DCFCE7',
    },
    questionButtonDisabled: {
        opacity: 0.5,
    },
    questionIcon: {
        fontSize: 24,
    },
    questionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
    questionLabelActive: {
        color: '#166534',
    },

    // Footer
    footer: {
        paddingVertical: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    footerText: {
        fontSize: 11,
        color: '#9CA3AF',
    },
});

export default FloraMentor;
