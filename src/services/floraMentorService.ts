// FloraMentor - AI Botanist Service using Gemini API
// Provides wise botanist advice for campers and hikers

import { GEMINI_API_KEY, OPENROUTER_API_KEY } from '@env';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface PlantInfo {
    turkishName: string;
    scientificName: string;
    toxicity: string;
    edible: string;
    geography: string;
    description: string;
}

interface FloraMentorResponse {
    success: boolean;
    message: string;
    error?: string;
}

// Predefined questions for users
export const PRESET_QUESTIONS = [
    {
        id: 'safety',
        label: '⚠️ Güvenlik',
        question: 'Bu bitkiye dokunmak veya yanında olmak güvenli mi? Dikkat etmem gereken şeyler neler?'
    },
    {
        id: 'edibility',
        label: '🍽️ Yenilebilirlik',
        question: 'Bu bitkinin yenilebilir kısımları var mı? Nasıl tüketilir?'
    },
    {
        id: 'medicinal',
        label: '💊 Şifa & Sağlık',
        question: 'Bu bitkinin tıbbi kullanımı var mı? Kimler kullanmamalı veya dikkat etmeli?'
    },
    {
        id: 'fire',
        label: '🔥 Ateş & Yakacak',
        question: 'Bu bitki ateş yakmak için kav veya yakacak olarak kullanılabilir mi?'
    },
    {
        id: 'identify',
        label: '🔍 Tanıma',
        question: 'Bu bitkiyi doğada başka bitkilerden nasıl ayırt edebilirim? Benzerleri var mı?'
    },
    {
        id: 'uses',
        label: '🏕️ Kullanım',
        question: 'Kampçılar ve doğa yürüyüşçüleri bu bitkiyi nasıl kullanabilir?'
    },
    {
        id: 'pests',
        label: '🐛 Böcek & Haşere',
        question: 'Bu bitki böcekleri çeker mi yoksa kovucu özelliği var mı?'
    },
    {
        id: 'signs',
        label: '💧 Su & İşaret',
        question: 'Bu bitkinin varlığı su kaynağına veya belirli bir toprak tipine işaret eder mi?'
    }
];

// Welcome message template
export function getWelcomeMessage(plantName: string): string {
    return `Merhaba Gezginler! 🌿

"${plantName}" hakkında bilgi almak için aşağıdaki sorulardan birini seçin.

Ben FloraMentor, sizin bilge botanik rehberinizim. Doğada bilgi hayat kurtarır!

— FloraMentor 🌿`;
}

/**
 * Get ALL answers in a single API call.
 * Tries Gemini first, falls back to OpenRouter (Amazon Nova) on failure.
 */
export async function getAllAnswers(plantInfo: PlantInfo): Promise<Record<string, string>> {
    const questionsList = PRESET_QUESTIONS.map(q => `- ${q.id}: ${q.question}`).join('\n');

    // Prompt to get JSON response for all questions
    const prompt = `Bitki: ${plantInfo.turkishName} (${plantInfo.scientificName})
Zehirlilik: ${plantInfo.toxicity}
Yenilebilirlik: ${plantInfo.edible}
Yayılış: ${plantInfo.geography}

Aşağıdaki soruların her biri için kısa, net ve bilgece bir yanıt hazırla.
Yanıtların SADECE aşağıdaki formatta saf bir JSON objesi olmalıdır. Başka hiçbir metin veya markdown ekleme.

{
  "safety": "Yanıt...",
  "edibility": "Yanıt...",
  "medicinal": "Yanıt...",
  "fire": "Yanıt...",
  "identify": "Yanıt...",
  "uses": "Yanıt...",
  "pests": "Yanıt...",
  "signs": "Yanıt..."
}

KURALLAR:
1. Her yanıt maksimum 1-2 cümle olsun.
2. Her yanıt maksimum 30 kelime olsun.
3. Asla yarım bırakma, nokta ile bitir.
4. JSON formatı bozulmamalı.

Sorular:
${questionsList}`;

    try {
        console.log('🌿 FloraMentor: Fetching from Gemini...');

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 2048,
                    topP: 0.95,
                    topK: 40,
                    responseMimeType: "application/json"
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ]
            })
        });

        if (!response.ok) {
            console.warn(`Gemini API Error: ${response.status}. Switching to backup...`);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) {
            throw new Error('Empty response from Gemini');
        }

        // Clean up markdown blocks if present (just in case)
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log('✅ FloraMentor: Answers received from Gemini');
        const answers = JSON.parse(jsonText);

        return answers;

    } catch (error) {
        console.warn('Gemini failed, trying OpenRouter backup...', error);
        return await callOpenRouterBackup(prompt);
    }
}

/**
 * Backup API call using OpenRouter (Amazon Nova Lite)
 */
async function callOpenRouterBackup(prompt: string): Promise<Record<string, string>> {
    try {
        console.log('🔄 FloraMentor: Fetching from OpenRouter (Backup)...');

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://bitkitanima.app', // Required by OpenRouter
                'X-Title': 'Bitki Tanıma App', // Optional
            },
            body: JSON.stringify({
                model: 'amazon/nova-2-lite-v1:free',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.4,
                response_format: { type: 'json_object' } // Try to force JSON
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('OpenRouter Error:', errText);
            throw new Error(`Backup API Error: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('Empty response from Backup API');
        }

        // Clean markdown just in case
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log('✅ FloraMentor: Answers received from Backup API');
        return JSON.parse(content);

    } catch (error) {
        console.error('Backup API also failed:', error);
        return {}; // Both failed
    }
}

/**
 * Legacy: Single question fetch (kept for fallback)
 */
export async function askQuestion(plantInfo: PlantInfo, questionText: string): Promise<FloraMentorResponse> {
    const prompt = `Bitki: ${plantInfo.turkishName} (${plantInfo.scientificName})
Soru: ${questionText}
Yanıt (max 30 kelime, 1-2 cümle, tamamlanmış):`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.4, maxOutputTokens: 512 }
            })
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        const message = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return { success: true, message: message.trim() };
    } catch (error) {
        return { success: false, message: '', error: 'Hata oluştu' };
    }
}
