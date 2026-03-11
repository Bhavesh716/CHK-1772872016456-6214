import os
import torch
import open_clip
from PIL import Image
from safetensors.torch import load_file

base = os.path.dirname(__file__)
model_path = os.path.join(base, "..", "Models", "ai_img_detection_model","open_clip_model.safetensors")
#model_path = "timm/vit_base_patch32_clip_224"

model, _, preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32",
    pretrained=None
)

state_dict = load_file(model_path)
model.load_state_dict(state_dict)

model.eval()

tokenizer = open_clip.get_tokenizer("ViT-B-32")

def detect_ai_image(image_path):

    image = preprocess(Image.open(image_path)).unsqueeze(0)

    text = tokenizer([
        "a real photograph",
        "an AI generated image"
    ])

    with torch.no_grad():

        image_features = model.encode_image(image)
        text_features = model.encode_text(text)

        image_features /= image_features.norm(dim=-1, keepdim=True)
        text_features /= text_features.norm(dim=-1, keepdim=True)

        similarity = (image_features @ text_features.T).softmax(dim=-1)

    real_score = similarity[0][0].item()
    ai_score = similarity[0][1].item()

    if ai_score > real_score:
        return {
            "label": "ai_generated",
            "confidence": round(ai_score * 100, 2)
        }

    return {
        "label": "real_image",
        "confidence": round(real_score * 100, 2)
    }