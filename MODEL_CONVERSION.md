# TFLite'dan TensorFlow.js'e Model Dönüşümü

Bu notebook, eğitilmiş `.tflite` modelinizi TensorFlow.js formatına dönüştürür.

## Önemli Not
TFLite modelleri doğrudan TF.js'e dönüştürülemez. Aşağıdaki seçeneklerden birini kullanmanız gerekir:

### Seçenek 1: Orijinal Keras Modeli Varsa (Önerilen)

```python
# Google Colab'da çalıştırın

# 1. Gerekli kütüphaneleri yükle
!pip install tensorflowjs tensorflow

import tensorflow as tf
import tensorflowjs as tfjs

# 2. Keras modelini yükle (.h5 veya SavedModel)
# Eğer .h5 dosyanız varsa:
model = tf.keras.models.load_model('bitki_model.h5')

# VEYA SavedModel klasörünüz varsa:
# model = tf.keras.models.load_model('saved_model_klasoru/')

# 3. Model özetini kontrol et
model.summary()

# 4. TensorFlow.js formatına dönüştür
tfjs.converters.save_keras_model(model, 'tfjs_model')

# 5. Dönüştürülen dosyaları indir
from google.colab import files
import shutil

shutil.make_archive('tfjs_model', 'zip', 'tfjs_model')
files.download('tfjs_model.zip')
```

### Seçenek 2: Sadece TFLite Varsa

TFLite modelini önce geri Keras/SavedModel'e dönüştürmeniz gerekir.
Ancak bu her zaman mümkün olmayabilir (özellikle quantized modellerde).

```python
# Bu yöntem her model için çalışmayabilir!

!pip install tensorflowjs tensorflow

import tensorflow as tf

# TFLite modelini yükle
interpreter = tf.lite.Interpreter(model_path='model.tflite')
interpreter.allocate_tensors()

# Input/Output detaylarını al
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print("Input shape:", input_details[0]['shape'])
print("Output shape:", output_details[0]['shape'])

# NOT: TFLite'ı doğrudan TF.js'e dönüştürmek mümkün değil.
# Orijinal eğitim kodunuzdan Keras modelini export etmeniz gerekiyor.
```

### Seçenek 3: Modeli Yeniden Export Et (En Güvenilir)

Eğer eğitim kodunuz varsa:

```python
# Eğitim sonrası modeli kaydet
model.save('bitki_model.h5')  # Keras H5 format

# VEYA SavedModel olarak
model.save('saved_model/', save_format='tf')

# Sonra TF.js'e dönüştür
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, 'tfjs_model')
```

## Dönüşüm Sonrası

`tfjs_model` klasöründe şu dosyalar oluşacak:
- `model.json` - Model mimarisi ve metadata
- `group1-shard1of1.bin` - Model ağırlıkları (veya birden fazla shard)

Bu dosyaları projenizin `BitkiTanima/assets/tfjs_model/` klasörüne kopyalayın.

## Model Entegrasyonu

1. `tfjs_model/` klasöründeki dosyaları `assets/tfjs_model/` klasörüne kopyalayın
2. `src/services/modelService.ts` dosyasında `DEMO_MODE = false` yapın
3. Uygulamayı yeniden başlatın: `npx expo start --clear`

## Sorun Giderme

### "Cannot read property 'weights' of undefined" hatası
- model.json dosyası geçersiz veya boş
- Shard dosyaları eksik veya yanlış isimlendirilmiş

### Model boyutu çok büyük
```python
# Quantized dönüşüm (model boyutunu küçültür)
tfjs.converters.save_keras_model(
    model, 
    'tfjs_model',
    quantization_dtype_map={'float16': '*'}
)
```
