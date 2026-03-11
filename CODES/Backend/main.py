from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import asyncio
import json
import tempfile
import os

from google import genai

from video_analysis import analyze_video
from audio_transcribe import transcribe_audio
from ai_image_detection import detect_ai_image
from deepfake_detection import detect_deepfake
from harmful_links_detection import harmful_links_detector
from img_tampering_detection import ela_score
from ocr_model import extract_text_from_image
from phishing_detection import detect_phishing
from ai_audio_detection import detect_ai_voice


# ---------------- GEMINI SETUP ----------------

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.5-flash"


async def call_llm(prompt: str):

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        text = response.text.strip()

        # ----- JSON extractor -----
        start = text.find("[")
        end = text.rfind("]")

        if start != -1 and end != -1:
            text = text[start:end+1]
        # --------------------------

    except Exception as e:

        text = f"LLM error occurred: {str(e)}"

    # ensure JSON parsing
    try:
        blocks = json.loads(text)

    except:

        blocks = [
            {
                "type": "greeting",
                "content": "I analyzed the content you provided."
            },
            {
                "type": "result",
                "content": "The verification system produced results but the AI response format failed."
            },
            {
                "type": "explanation",
                "content": text[:300]
            },
            {
                "type": "trust_score",
                "score": 50
            },
            {
                "type": "sources",
                "links": ["AI verification models"]
            }
        ]

    return blocks


# ---------------- FASTAPI ----------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- PIPELINE ----------------

async def ai_pipeline(text: str, files: List[UploadFile]):

    detector_name = None
    detector_output = None
    user_input_description = ""

    # -------- FILE INPUT --------

    if files:

        file = files[0]

        suffix = os.path.splitext(file.filename)[1]

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            content = await file.read()
            temp.write(content)
            temp_path = temp.name

        # IMAGE
        if file.content_type.startswith("image"):

            detector_name = "AI Image Detection Model"
            detector_output = detect_ai_image(temp_path)

            user_input_description = "An image uploaded by the user."

        # VIDEO
        elif file.content_type.startswith("video"):

            detector_name = "Video Authenticity Analysis Model"
            detector_output = analyze_video(temp_path)

            user_input_description = "A video uploaded by the user."

        # AUDIO
        elif file.content_type.startswith("audio"):

            detector_name = "AI Voice Detection Model"
            detector_output = detect_ai_voice(temp_path)

            transcription = transcribe_audio(temp_path)

            if transcription["text_detected"]:
                text += " " + transcription["text"]

            user_input_description = "An audio file uploaded by the user."

        os.remove(temp_path)

    # -------- TEXT INPUT --------

    elif text:

        # simple heuristic: short conversational messages should not trigger detectors
        conversational = len(text.split()) <= 4 and "?" not in text

        if conversational:

            detector_name = None
            detector_output = None
            user_input_description = text

        else:

            detector_name = "Phishing and Malicious Content Detection"

            phishing = detect_phishing(text)
            malicious = harmful_links_detector(text)

            detector_output = {
                "phishing_detection": phishing,
                "malicious_link_detection": malicious
            }

            user_input_description = text

    # -------- PROMPT --------

    prompt = f"""
You are an AI verification assistant and chatbot.

User input:
{user_input_description}

Detector used:
{detector_name}

Detector output:
{detector_output}

FIRST determine the intent.

------------------------------------------------

If the user is simply talking to you or asking a question,
answer normally like a chatbot.

Return JSON:

[
  {{
    "type":"answer",
    "content":"your helpful answer here"
  }}
]

Do NOT include verification blocks.

------------------------------------------------

If the user submitted content to verify (image/video/audio/text claim):

Return JSON array EXACTLY like this structure and order.
Do not change wording of keys.

[
  {{
    "type":"greeting",
    "content":"Short friendly message indicating analysis started."
  }},
  {{
    "type":"result",
    "content":"Clear but very short summary of detector output ,  her you dont have to explain them in detail , js take the detector output extract its meanign and write it in plain simple words here."
  }},
  {{
    "type":"explanation",
    "content":"Here you have to explain the user what actually was the problem or if not then in shrot reply yes everyhting was correct or something like that . Here u need to use bulleted answers , like first line could be normal line like opening of a explanation but the u should prefer to explain in easy bullets divided in diff lines and starting by '-' (dash)."
  }},
  {{
    "type":"trust_score",
    "score": this is the confidence score that the detector provided after its analization , if u think other wise u can write it urself , suppose for example for a text . the values hould be strictly between 0 and 100.
  }},
  {{
    "type":"sources",
    "topics":[
      "AI Image Detection Models (HuggingFace)",
      "Video Forensics Research",
      "Speech Deepfake Detection Models"
    ],
    "links":[
      "working Link to the website",
      "Working link to Video Forensics Research Paper",
      "Speech Deepfake Detection Models Working Links"
    ]
  }}
]

------------------------------------------------

Rules:

• Always return VALID JSON
• No markdown
• No code blocks
• No extra text outside JSON
"""

    blocks = await call_llm(prompt)

    # -------- STREAM RESPONSE --------

    for block in blocks:
        await asyncio.sleep(1)
        yield json.dumps(block, ensure_ascii=False) + "\n"


# ---------------- ENDPOINT ----------------

@app.post("/analyze")
async def analyze(
    text: str = Form(""),
    files: List[UploadFile] = File(default=[])
):

    print("Received text:", text)
    print("Received files:", [file.filename for file in files])

    return StreamingResponse(
        ai_pipeline(text, files),
        media_type="text/plain"
    )