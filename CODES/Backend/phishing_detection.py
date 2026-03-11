import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

base = os.path.dirname(__file__)
model_path = os.path.join(base, "..", "Models", "phishing_model")

tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

def detect_phishing(text):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.softmax(outputs.logits, dim=1)
    score = probs[0].tolist()

    phishing_score = score[1]

    if phishing_score > 0.6:
        return {
            "label": "phishing",
            "confidence": round(phishing_score * 100, 2)
        }
    else:
        return {
            "label": "safe",
            "confidence": round((1 - phishing_score) * 100, 2)
        }