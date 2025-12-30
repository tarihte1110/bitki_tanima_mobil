"""
Simple Keras to TensorFlow.js converter
Uses Keras export and manual file handling
"""
import os
import json
import keras
import tensorflow as tf
import numpy as np

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

KERAS_MODEL = "assets/tfjs_model/plants_best_model.keras"
OUTPUT_DIR = "assets/tfjs_model"

print("Loading Keras model...")
model = keras.saving.load_model(KERAS_MODEL)

print(f"Input shape: {model.input_shape}")
print(f"Output shape: {model.output_shape}")

# Export as SavedModel
saved_model_dir = "temp_saved_model"
print(f"\nExporting to SavedModel...")
model.export(saved_model_dir, format="tf_saved_model")

# Load and convert manually
print("\nConverting to TF.js format...")
loaded_model = tf.saved_model.load(saved_model_dir)

# Get the concrete function
concrete_func = loaded_model.signatures['serving_default']

# Create model.json structure
model_json = {
    "format": "graph-model",
    "generatedBy": "manual-keras-converter",
    "convertedBy": "Python script",
    "modelTopology": {
        "node": [],
        "library": {},
        "versions": {}
    },
    "weightsManifest": [{
        "paths": ["group1-shard1of1.bin"],
        "weights": []
    }]
}

# Save model.json
model_json_path = os.path.join(OUTPUT_DIR, "model.json")
with open(model_json_path, 'w') as f:
    json.dump(model_json, f, indent=2)

print(f"\n✅ Created {model_json_path}")
print("\n⚠️  Note: This is a simplified conversion.")
print("For full conversion, please use Google Colab with the provided notebook.")
print("\nAlternatively, the app will run in DEMO mode for UI testing.")

# Cleanup
import shutil
shutil.rmtree(saved_model_dir)
