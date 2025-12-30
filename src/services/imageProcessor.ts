// Image Processor for preprocessing images before model inference
import * as tf from '@tensorflow/tfjs';
// @ts-ignore - legacy import to fix deprecation error
import { readAsStringAsync } from 'expo-file-system/legacy';
import jpeg from 'jpeg-js';
import { MODEL_CONFIG } from '../constants/theme';

// Base64 to Uint8Array conversion for React Native
function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Decode image from URI to raw pixel data
 */
async function decodeImageFromUri(uri: string): Promise<{
    data: Uint8Array;
    width: number;
    height: number;
}> {
    console.log('Decoding image from URI:', uri);

    // Read the image as base64 using the API
    // Using string 'base64' as EncodingType might be deprecated in types but required in runtime
    const base64Data = await readAsStringAsync(uri, {
        encoding: 'base64',
    });

    // Convert base64 to binary
    const bytes = base64ToUint8Array(base64Data);

    // Decode JPEG
    const rawImageData = jpeg.decode(bytes as any, { useTArray: true });

    console.log(`Image decoded: ${rawImageData.width}x${rawImageData.height}`);

    return {
        data: rawImageData.data as unknown as Uint8Array,
        width: rawImageData.width,
        height: rawImageData.height,
    };
}

/**
 * Preprocess an image from URI for model inference
 * @param imageUri - URI of the image to process
 * @returns Preprocessed tensor ready for model input [1, 224, 224, 3]
 */
export async function preprocessImage(imageUri: string): Promise<tf.Tensor> {
    console.log('Preprocessing image:', imageUri);

    try {
        // Decode image
        const { data, width, height } = await decodeImageFromUri(imageUri);

        // Create tensor from raw pixel data (RGBA)
        const imageTensor = tf.tensor3d(data, [height, width, 4]);

        // Remove alpha channel (keep only RGB)
        const rgbTensor = imageTensor.slice([0, 0, 0], [-1, -1, 3]);
        imageTensor.dispose();

        // Resize to model input size
        const resized = tf.image.resizeBilinear(
            rgbTensor as tf.Tensor3D,
            [MODEL_CONFIG.INPUT_SIZE, MODEL_CONFIG.INPUT_SIZE]
        );
        rgbTensor.dispose();

        // EfficientNetV2 usually expects pixels in range [0, 255]
        // Removing normalization to [0, 1] as it causes the model to see black images
        // const normalized = resized.div(255.0);

        // Add batch dimension [1, 224, 224, 3]
        const batched = resized.expandDims(0);
        resized.dispose();

        console.log('Image preprocessed, tensor shape:', batched.shape);

        return batched;
    } catch (error) {
        console.error('Image preprocessing failed:', error);
        throw new Error(`Görüntü işlenemedi: ${error}`);
    }
}

/**
 * Cleanup tensor to free memory
 */
export function disposeTensor(tensor: tf.Tensor): void {
    if (tensor) {
        tensor.dispose();
    }
}

/**
 * Get current memory info
 */
export function getMemoryInfo(): tf.MemoryInfo {
    return tf.memory();
}
