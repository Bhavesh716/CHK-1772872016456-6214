from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
import torch
import librosa
import os

base = os.path.dirname(__file__)
model_path = os.path.join(base, "..", "Models", "ai_audio_detection_model")
#model_name = "Gustking/wav2vec2-large-xlsr-deepfake-audio-classification"

feature_extractor = AutoFeatureExtractor.from_pretrained(model_path)
model = AutoModelForAudioClassification.from_pretrained(model_path)

def detect_ai_voice(audio_path):

    audio, sr = librosa.load(audio_path, sr=16000)

    inputs = feature_extractor(
        audio,
        sampling_rate=16000,
        return_tensors="pt"
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.softmax(outputs.logits, dim=1)[0]

    fake_score = probs[1].item()

    if fake_score > 0.6:
        return {
            "label": "ai_voice",
            "confidence": round(fake_score*100,2)
        }

    return {
        "label": "real_voice",
        "confidence": round((1-fake_score)*100,2)
    }