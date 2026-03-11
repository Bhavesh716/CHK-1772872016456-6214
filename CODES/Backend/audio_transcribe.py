import whisper
import os

base = os.path.dirname(__file__)
model_path = os.path.join(base, "..", "Models", "whisper_model","base.pt")

model = whisper.load_model(model_path)

def transcribe_audio(audio_path):

    result = model.transcribe(audio_path)

    return {
        "text_detected": True,
        "text": result["text"]
    }