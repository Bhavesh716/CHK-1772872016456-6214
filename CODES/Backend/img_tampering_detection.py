from PIL import Image, ImageChops, ImageEnhance
import numpy as np
import os


def ela_score(image_path, quality=90):

    original = Image.open(image_path).convert("RGB")

    temp_path = "temp_resaved.jpg"
    original.save(temp_path, "JPEG", quality=quality)

    resaved = Image.open(temp_path)

    ela = ImageChops.difference(original, resaved)

    extrema = ela.getextrema()
    max_diff = max([e[1] for e in extrema])

    if max_diff == 0:
        max_diff = 1

    scale = 255.0 / max_diff
    ela = ImageEnhance.Brightness(ela).enhance(scale)

    score = np.mean(np.array(ela))
     
    os.remove("temp_resaved.jpg")

    if score > 15:
        return {"label": "possible_manipulation", "confidence": round(score,2)}

    return {"label": "clean_image", "confidence": round(100-score,2)}