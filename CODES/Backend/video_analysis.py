import cv2
import os
import shutil

from ai_image_detection import detect_ai_image
from deepfake_detection import detect_deepfake


TEMP_FRAME_DIR = "temp_video_frames"


def extract_frames(video_path, frame_interval=30):

    if os.path.exists(TEMP_FRAME_DIR):
        shutil.rmtree(TEMP_FRAME_DIR)

    os.makedirs(TEMP_FRAME_DIR)

    cap = cv2.VideoCapture(video_path)

    frame_count = 0
    saved_count = 0

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        if frame_count % frame_interval == 0:

            frame_path = os.path.join(
                TEMP_FRAME_DIR,
                f"frame_{saved_count}.jpg"
            )

            cv2.imwrite(frame_path, frame)

            saved_count += 1

        frame_count += 1

    cap.release()

    return saved_count


def analyze_video(video_path):

    total_frames = extract_frames(video_path)

    ai_count = 0
    deepfake_count = 0

    for frame_file in os.listdir(TEMP_FRAME_DIR):

        frame_path = os.path.join(TEMP_FRAME_DIR, frame_file)

        ai_result = detect_ai_image(frame_path)

        if ai_result["label"] == "ai_generated":
            ai_count += 1

        deepfake_result = detect_deepfake(frame_path)

        if deepfake_result["label"] == "deepfake":
            deepfake_count += 1


    ai_ratio = ai_count / total_frames
    deepfake_ratio = deepfake_count / total_frames


    ai_video = ai_ratio >= 0.75
    deepfake_video = deepfake_ratio >= 0.5

     # 🔥 CLEANUP
    shutil.rmtree(TEMP_FRAME_DIR)

    return {
        "total_frames": total_frames,
        "ai_frames": ai_count,
        "deepfake_frames": deepfake_count,
        "ai_generated_video": ai_video,
        "deepfake_video": deepfake_video
    }    