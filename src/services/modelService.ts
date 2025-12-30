// Model Service for TensorFlow.js inference
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { PredictionResult } from '../types';
import labels from '../../assets/labels.json';
import { MODEL_CONFIG } from '../constants/theme';

// Demo mode - will be disabled once model files are properly converted
const DEMO_MODE = false; // ✅ Real model is ready!

class ModelService {
    private model: tf.GraphModel | null = null;
    private isLoading: boolean = false;
    private loadPromise: Promise<void> | null = null;
    private isDemoMode: boolean = DEMO_MODE;

    /**
     * Initialize TensorFlow.js and load the model
     */
    async initialize(): Promise<void> {
        if (this.model || this.isDemoMode) {
            console.log(this.isDemoMode ? '🎨 Running in DEMO MODE - UI testing only' : 'Model already loaded');
            return;
        }

        if (this.isLoading && this.loadPromise) {
            console.log('Model is already loading, waiting...');
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
            console.log('Initializing TensorFlow.js...');
            await tf.ready();
            console.log('TensorFlow.js ready, backend:', tf.getBackend());

            console.log('Loading model...');

            // Load model from bundled assets
            const modelJson = require('../../assets/tfjs_model/model.json');
            const modelWeights = [
                require('../../assets/tfjs_model/group1-shard1of6.bin'),
                require('../../assets/tfjs_model/group1-shard2of6.bin'),
                require('../../assets/tfjs_model/group1-shard3of6.bin'),
                require('../../assets/tfjs_model/group1-shard4of6.bin'),
                require('../../assets/tfjs_model/group1-shard5of6.bin'),
                require('../../assets/tfjs_model/group1-shard6of6.bin'),
            ];

            this.model = await tf.loadGraphModel(
                bundleResourceIO(modelJson, modelWeights)
            );

            console.log('✅ Model loaded successfully!');
            await this.warmUp();
            this.isDemoMode = false;
        } catch (error) {
            console.error('Failed to load model:', error);
            console.log('⚠️  Switching to DEMO MODE for UI testing');
            this.isDemoMode = true;
        }
    }

    private async warmUp(): Promise<void> {
        if (!this.model) return;

        console.log('Warming up model...');
        const dummyInput = tf.zeros([1, MODEL_CONFIG.INPUT_SIZE, MODEL_CONFIG.INPUT_SIZE, 3]);

        try {
            const result = this.model.predict(dummyInput) as tf.Tensor;
            result.dispose();
        } catch (error) {
            console.warn('Warm up failed:', error);
        } finally {
            dummyInput.dispose();
        }
        console.log('Model warm up complete');
    }

    isModelLoaded(): boolean {
        return this.model !== null || this.isDemoMode;
    }

    isModelLoading(): boolean {
        return this.isLoading;
    }

    isInDemoMode(): boolean {
        return this.isDemoMode;
    }

    async predict(imageTensor: tf.Tensor): Promise<PredictionResult[]> {
        if (this.isDemoMode) {
            console.log('🎨 Running DEMO prediction (random results for UI testing)');
            return this.generateDemoPredictions();
        }

        if (!this.model) {
            throw new Error('Model is not loaded. Call initialize() first.');
        }

        console.log('Running prediction...');
        const startTime = Date.now();

        try {
            const predictions = this.model.predict(imageTensor) as tf.Tensor;

            // Model output is already softmaxed - do NOT apply softmax again
            const probabilities = await predictions.data();
            predictions.dispose();

            const results = this.processPredictions(Array.from(probabilities));

            // Debug logging - show top 3 predictions
            console.log('📊 Top predictions:');
            results.slice(0, 3).forEach((r, i) => {
                console.log(`   ${i + 1}. ${r.className}: ${(r.confidence * 100).toFixed(1)}%`);
            });

            const endTime = Date.now();
            console.log(`✅ Prediction completed in ${endTime - startTime}ms`);

            return results;
        } catch (error) {
            console.error('Prediction failed:', error);
            throw new Error(`Tahmin yapılamadı: ${error}`);
        }
    }

    private generateDemoPredictions(): PredictionResult[] {
        // labels is a string array
        const labelsList = labels as string[];

        const randomProbs: number[] = [];
        for (let i = 0; i < MODEL_CONFIG.NUM_CLASSES; i++) {
            randomProbs.push(Math.random());
        }

        const sum = randomProbs.reduce((a, b) => a + b, 0);
        const normalizedProbs = randomProbs.map(p => p / sum);

        const results: PredictionResult[] = normalizedProbs.map((prob, index) => ({
            classIndex: index,
            className: labelsList[index] || `Bitki ${index + 1}`,
            confidence: prob,
        }));

        results.sort((a, b) => b.confidence - a.confidence);

        if (results.length > 0) {
            results[0].confidence = 0.65 + Math.random() * 0.30;
            if (results.length > 1) {
                results[1].confidence = 0.05 + Math.random() * 0.15;
            }
            if (results.length > 2) {
                results[2].confidence = 0.02 + Math.random() * 0.08;
            }
        }

        return results;
    }

    private processPredictions(probabilities: number[]): PredictionResult[] {
        // labels is a string array
        const labelsList = labels as string[];

        const results: PredictionResult[] = probabilities.map((prob, index) => ({
            classIndex: index,
            className: labelsList[index] || `Sınıf ${index}`,
            confidence: prob,
        }));

        results.sort((a, b) => b.confidence - a.confidence);

        return results;
    }

    getTopKPredictions(predictions: PredictionResult[], k: number = MODEL_CONFIG.TOP_K): PredictionResult[] {
        return predictions.slice(0, k);
    }

    dispose(): void {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
    }
}

export const modelService = new ModelService();
export default modelService;
