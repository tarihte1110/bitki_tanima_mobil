# Bitki Tanıma Mobil Uygulaması

86 farklı bitki türünü tanıyabilen, React Native + Expo tabanlı mobil uygulama.

## 🌿 Özellikler

- **Offline Çalışma**: TensorFlow.js ile cihaz üzerinde inference
- **Kamera Desteği**: Anlık fotoğraf çekip analiz
- **Galeri Desteği**: Mevcut fotoğrafları analiz etme
- **Yüksek Doğruluk**: %97+ doğruluk oranı
- **Top-K Tahmin**: En olası 3 tahmini gösterme
- **Güven Skoru**: Her tahmin için güvenilirlik göstergesi

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Model Dosyalarını Ekle
Model dosyalarınızı `assets/tfjs_model/` klasörüne koyun:
- `model.json`
- `group1-shard1of1.bin` (veya birden fazla shard dosyası)

### 3. Uygulamayı Başlat
```bash
npx expo start
```

## 🔄 TFLite'dan TF.js'e Model Dönüşümü

### Colab'da Dönüşüm (Önerilen)

```python
# TensorFlow ve TensorFlow.js kurulumu
!pip install tensorflow tensorflowjs

import tensorflowjs as tfjs
import tensorflow as tf

# TFLite modelini yükle
interpreter = tf.lite.Interpreter(model_path='model.tflite')
interpreter.allocate_tensors()

# TFLite'ı SavedModel'e dönüştür
# Not: TFLite doğrudan TF.js'e dönüştürülemez, önce SavedModel yapılmalı

# Alternatif: Eğer orijinal Keras/TF modeliniz varsa:
# model = tf.keras.models.load_model('model.h5')
# tfjs.converters.save_keras_model(model, 'tfjs_model')

# SavedModel'den TF.js'e dönüştürme
!tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    ./saved_model \
    ./tfjs_model
```

### Dosyaları Uygulamaya Ekle
Dönüşüm sonrası oluşan dosyaları `assets/tfjs_model/` klasörüne kopyalayın.

## 📁 Proje Yapısı

```
BitkiTanima/
├── App.tsx                    # Ana uygulama girişi
├── app.json                   # Expo yapılandırması
├── assets/
│   ├── labels.json           # 86 sınıf etiketi
│   └── tfjs_model/           # TF.js model dosyaları
│       ├── model.json
│       └── group1-shard1of1.bin
├── src/
│   ├── components/
│   │   ├── ConfidenceBar.tsx
│   │   ├── Header.tsx
│   │   ├── PredictionCard.tsx
│   │   └── TopKList.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   └── ResultScreen.tsx
│   ├── services/
│   │   ├── imageProcessor.ts
│   │   └── modelService.ts
│   ├── constants/
│   │   └── theme.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   └── types/
│       └── index.ts
└── metro.config.js
```

## 🏷️ Etiketleri Güncelleme

`assets/labels.json` dosyasını gerçek bitki isimleriyle güncelleyin:

```json
{
  "LABEL_0": "Gül",
  "LABEL_1": "Papatya",
  "LABEL_2": "Lale",
  ...
}
```

## 📱 Test Etme

1. Expo Go uygulamasını telefonunuza indirin
2. `npx expo start` ile geliştirme sunucusunu başlatın
3. QR kodu tarayarak uygulamayı açın

## ⚠️ Önemli Notlar

- Model dosyaları olmadan uygulama hata verecektir
- İlk çalıştırmada model yüklemesi birkaç saniye sürebilir
- Büyük model dosyaları uygulama boyutunu artıracaktır

## 📄 Lisans

MIT License
