"""
Convert Keras model to TensorFlow.js format
This script handles Keras 3 compatibility issues
"""
import os
import sys

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

try:
    import keras
    import tensorflow as tf
    print(f"✅ Keras version: {keras.__version__}")
    print(f"✅ TensorFlow version: {tf.__version__}")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Installing required packages...")
    os.system("pip install tensorflow keras --quiet")
    import keras
    import tensorflow as tf

# Model paths
KERAS_MODEL_PATH = "assets/tfjs_model/plants_best_model.keras"
OUTPUT_DIR = "assets/tfjs_model"

print(f"\n📂 Loading Keras model from: {KERAS_MODEL_PATH}")

try:
    # Load Keras model
    model = keras.saving.load_model(KERAS_MODEL_PATH)
    
    print("\n📊 Model Information:")
    print(f"   Input shape: {model.input_shape}")
    print(f"   Output shape: {model.output_shape}")
    print(f"   Total parameters: {model.count_params():,}")
    
    # Save as SavedModel first (Keras 3 requirement)
    saved_model_path = "temp_saved_model"
    print(f"\n💾 Exporting to SavedModel format...")
    model.export(saved_model_path, format="tf_saved_model")
    print(f"✅ SavedModel created")
    
    # Convert to TensorFlow.js using command line tool
    print(f"\n🔄 Converting to TensorFlow.js...")
    cmd = f'python -m tensorflowjs.converters.converter --input_format=tf_saved_model --output_format=tfjs_graph_model --signature_name=serving_default --saved_model_tags=serve "{saved_model_path}" "{OUTPUT_DIR}"'
    
    result = os.system(cmd)
    
    if result == 0:
        print("\n✅ Conversion successful!")
        print(f"\n📁 Generated files in {OUTPUT_DIR}:")
        for f in sorted(os.listdir(OUTPUT_DIR)):
            if f.endswith('.json') or f.endswith('.bin'):
                filepath = os.path.join(OUTPUT_DIR, f)
                size = os.path.getsize(filepath)
                print(f"   - {f} ({size:,} bytes)")
        
        # Clean up temp directory
        import shutil
        shutil.rmtree(saved_model_path)
        print("\n🎉 Model is ready for the mobile app!")
    else:
        print("\n❌ Conversion failed!")
        sys.exit(1)
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
