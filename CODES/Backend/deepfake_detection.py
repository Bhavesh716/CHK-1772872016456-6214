from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
import os

base = os.path.dirname(__file__)
model_path = os.path.join(base, "..", "Models", "deepfake_detection_model")
#model_name = "prithivMLmods/Deep-Fake-Detector-v2-Model"

processor = AutoImageProcessor.from_pretrained(model_path)
model = AutoModelForImageClassification.from_pretrained(model_path)

def detect_deepfake(image_path):

    image = Image.open(image_path).convert("RGB")

    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.softmax(outputs.logits, dim=1)[0]

    fake_score = probs[1].item()

    if fake_score > 0.6:
        return {
            "label": "deepfake",
            "confidence": round(fake_score*100,2)
        }

    return {
        "label": "real",
        "confidence": round((1-fake_score)*100,2)
    }