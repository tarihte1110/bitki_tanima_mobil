// Plant Detector Service - Uses MobileNet to detect if image contains a plant
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// ImageNet plant/nature related keywords
// If any top prediction contains these words, it's likely a plant image
const PLANT_KEYWORDS = [
    // Trees & Plants
    'plant', 'tree', 'flower', 'leaf', 'bush', 'shrub', 'vine', 'fern', 'moss', 'grass',
    'oak', 'pine', 'palm', 'fig', 'maple', 'willow', 'birch', 'cedar', 'cypress', 'spruce',
    'acacia', 'eucalyptus', 'bamboo', 'cactus', 'succulent',

    // Flowers
    'daisy', 'rose', 'tulip', 'sunflower', 'dandelion', 'lily', 'orchid', 'iris',
    'poppy', 'lavender', 'carnation', 'marigold', 'daffodil', 'peony', 'chrysanthemum',
    'hibiscus', 'jasmine', 'magnolia', 'lotus', 'violet', 'buttercup',

    // Fruits & Vegetables (often indicate plant presence)
    'apple', 'orange', 'banana', 'grape', 'strawberry', 'cherry', 'peach', 'pear',
    'lemon', 'lime', 'mango', 'pineapple', 'watermelon', 'pomegranate', 'fig',
    'tomato', 'pepper', 'cucumber', 'corn', 'pumpkin', 'squash', 'cabbage',
    'broccoli', 'cauliflower', 'carrot', 'potato', 'onion', 'garlic', 'mushroom',

    // Mushrooms
    'mushroom', 'fungus', 'agaric', 'bolete', 'chanterelle', 'toadstool',

    // Nature/Garden related
    'garden', 'forest', 'woodland', 'meadow', 'pot', 'vase', 'bouquet',
    'greenhouse', 'botanical', 'herb', 'foliage', 'blossom', 'petal', 'stem',
    'acorn', 'seed', 'berry', 'nut', 'cone', 'bark',
];

class PlantDetectorService {
    private model: mobilenet.MobileNet | null = null;
    private isLoading: boolean = false;
    private loadPromise: Promise<void> | null = null;

    /**
     * Initialize MobileNet model
     */
    async initialize(): Promise<void> {
        if (this.model) {
            console.log('MobileNet already loaded');
            return;
        }

        if (this.isLoading && this.loadPromise) {
            return this.loadPromise;
        }

        this.isLoading = true;
        this.loadPromise = this._loadModel();

        try {
            await this.loadPromise;
        } finally {
            this.isLoading = false;
            this.loadPromise = null;
        }
    }

    private async _loadModel(): Promise<void> {
        try {
            console.log('🔍 Loading MobileNet for plant detection...');
            // Load MobileNet v2 (smaller and faster)
            this.model = await mobilenet.load({ version: 2, alpha: 0.5 });
            console.log('✅ MobileNet loaded successfully!');
        } catch (error) {
            console.error('Failed to load MobileNet:', error);
            throw error;
        }
    }

    isLoaded(): boolean {
        return this.model !== null;
    }

    /**
     * Check if an image contains a plant/nature subject
     * @param imageTensor - Preprocessed image tensor
     * @returns Object with isPlant boolean and top predictions
     */
    async isPlantImage(imageTensor: tf.Tensor3D | tf.Tensor4D): Promise<{
        isPlant: boolean;
        confidence: number;
        topPredictions: Array<{ className: string; probability: number }>;
        matchedKeyword: string | null;
    }> {
        if (!this.model) {
            throw new Error('MobileNet not loaded. Call initialize() first.');
        }

        try {
            // Get predictions from MobileNet
            const predictions = await this.model.classify(imageTensor as tf.Tensor3D, 5);

            console.log('🔍 MobileNet predictions:');
            predictions.forEach((p, i) => {
                console.log(`   ${i + 1}. ${p.className} (${(p.probability * 100).toFixed(1)}%)`);
            });

            // Check if any top prediction contains plant-related keywords
            let isPlant = false;
            let matchedKeyword: string | null = null;
            let matchedProbability = 0;

            for (const prediction of predictions) {
                const className = prediction.className.toLowerCase();

                for (const keyword of PLANT_KEYWORDS) {
                    if (className.includes(keyword)) {
                        isPlant = true;
                        matchedKeyword = keyword;
                        matchedProbability = prediction.probability;
                        break;
                    }
                }

                if (isPlant) break;
            }

            console.log(isPlant
                ? `✅ Plant detected! Matched: "${matchedKeyword}"`
                : '❌ No plant detected in image');

            return {
                isPlant,
                confidence: matchedProbability,
                topPredictions: predictions,
                matchedKeyword,
            };
        } catch (error) {
            console.error('Plant detection failed:', error);
            throw error;
        }
    }

    dispose(): void {
        // MobileNet doesn't have a dispose method, but we can null the reference
        this.model = null;
    }
}

export const plantDetectorService = new PlantDetectorService();
export default plantDetectorService;
