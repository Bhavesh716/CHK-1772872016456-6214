import easyocr
import cv2
import os

base = os.path.dirname(__file__)
model_path = os.path.join(base, "..", "Models", "ocr_model")

reader = easyocr.Reader(['en'], gpu=False,model_storage_directory=model_path)

def extract_text_from_image(image_path):

    img = cv2.imread(image_path)

    results = reader.readtext(img)

    detected_text = []

    for bbox, text, confidence in results:
        if confidence > 0.5:
            detected_text.append(text)

    final_text = " ".join(detected_text)

    if len(final_text) > 3:
        return {
            "text_detected": True,
            "text": final_text
        }

    return {
        "text_detected": False,
        "text": ""
    }