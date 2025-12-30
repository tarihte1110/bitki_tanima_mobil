
import zipfile
import json
import os

model_path = "assets/tfjs_model/plants_best_model.keras"

def find_key(obj, key):
    if isinstance(obj, dict):
        if key in obj:
            return obj[key]
        for k, v in obj.items():
            result = find_key(v, key)
            if result:
                return result
    elif isinstance(obj, list):
        for item in obj:
            result = find_key(item, key)
            if result:
                return result
    return None

try:
    with zipfile.ZipFile(model_path, 'r') as zip_ref:
        # metadata.json tara
        if "metadata.json" in zip_ref.namelist():
            with zip_ref.open("metadata.json") as f:
                metadata = json.load(f)
                print(f"metadata.json keys: {list(metadata.keys())}")
                
        # config.json tara
        if "config.json" in zip_ref.namelist():
            with zip_ref.open("config.json") as f:
                config = json.load(f)
                print(f"config.json keys: {list(config.keys())}")
                
                # 'class_names' veya 'names' ara
                class_names = find_key(config, "class_names")
                if class_names:
                    print("\n✅ class_names BULUNDU!")
                    print(class_names)
                else:
                    print("\n❌ class_names bulunamadı.")
                    
                    # Belki 'vocabulary' adında saklanıyordur (StringLookup layer varsa)
                    vocab = find_key(config, "vocabulary")
                    if vocab:
                         print("\n✅ vocabulary BULUNDU (olası sınıf isimleri):")
                         print(vocab)

except Exception as e:
    print(f"Hata: {e}")
