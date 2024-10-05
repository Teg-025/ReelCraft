import sys
import cv2
import librosa
import numpy as np
import json
import os
import scipy.signal
from dotenv import load_dotenv
import google.generativeai as genai
import asyncio
from deepgram import Deepgram
from concurrent.futures import ThreadPoolExecutor

def detect_scenes(video_path):
    scenes = []
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    prev_frame = None
    scene_start = 0
    frame_idx = 0

    scene_changes = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if prev_frame is not None:
            diff = cv2.absdiff(prev_frame, gray_frame)
            non_zero_count = np.count_nonzero(diff)
            if non_zero_count > 5000:  # Scene change threshold
                scene_changes.append(frame_idx / fps)
                scenes.append({"start": scene_start / fps, "duration": (frame_idx - scene_start) / fps})
                scene_start = frame_idx

        prev_frame = gray_frame
        frame_idx += 1

    cap.release()
    return scene_changes


def detect_audio_peaks(audio_path):
    y, sr = librosa.load(audio_path, sr=None)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)

    peaks, _ = scipy.signal.find_peaks(onset_env, height=0.5, distance=10)
    times = librosa.frames_to_time(peaks, sr=sr)

    audio_peaks = [{"start": time, "duration": 5} for time in times]
    return [peak['start'] for peak in audio_peaks]

async def transcribe_audio_deepgram(audio_path, deepgram_api_key):
    client = Deepgram(deepgram_api_key)
    
    with open(audio_path, 'rb') as audio_file:
        audio = audio_file.read()
    
    options = {
        'punctuate': True,
        'diarize': False
    }
    
    response = await client.transcription.prerecorded(
        {'buffer': audio, 'mimetype': 'audio/wav'},
        options
    )
    
    transcript = []
    for word_info in response['results']['channels'][0]['alternatives'][0]['words']:
        transcript.append({
            "start": word_info['start'],
            "end": word_info['end'],
            "text": word_info['word']
        })
    
    return transcript


def send_transcript_to_gemini_api(transcript, gemini_api_key):
    genai.configure(api_key=gemini_api_key)
    
    formatted_transcript = "\n".join([f"[{entry['start']}-{entry['end']}] {entry['text']}" for entry in transcript])
    
    prompt = (
    '''Given the following transcript, identify exactly 10 of the most interesting and distinct sections of dialogue that are thematically coherent and relevant to a uniform topic. Each section must have a duration of at least 50 seconds, meaning the difference between the end and start times of each section must be at least 50 seconds. Combine consecutive sentences or phrases into coherent sections within this time range.

    Ensure that each section covers a consistent topic or theme, even if it spans multiple points or subjects. The start of each section should align with the beginning of a new topic or significant point, while the end can span multiple points. Each section should include complete text from the start to the end of that section.

    Return the results in JSON format with the following schema:
    {
        'start': float,
        'end': float,
        'text': str
    }
    The 'text' field should include all the text for that section, not a summary. Each section must strictly adhere to the duration constraint and cover a consistent topic or theme.

    Constraint:
        Output[i]["end"] - Output[i]["start"] >= 50 for every i in Output

    Example:

    Input:
    [
        {"start": 0.0, "end": 10.0, "text": "Introduction to the topic..."},
        {"start": 10.0, "end": 25.0, "text": "Detailed explanation of the first point..."},
        {"start": 25.0, "end": 35.0, "text": "Further discussion on the first point..."},
        {"start": 35.0, "end": 60.0, "text": "Introduction of a new topic..."},
        {"start": 60.0, "end": 70.0, "text": "Start of a new topic..."},
        {"start": 70.0, "end": 75.0, "text": "Details about the new topic..."},
        {"start": 75.0, "end": 85.0, "text": "Start of third topic..."},
        {"start": 85.0, "end": 94.0, "text": "Details about third topic..."},
        {"start": 94.0, "end": 110.0, "text": "Continuation of a different aspect of the same topic..."}
    ]

    Output:
    [
        {"start": 0.0, "end": 60.0, "text": "Introduction to the topic... Detailed explanation of the first point... Further discussion on the first point... Introduction of a new topic..."},
        {"start": 60.0, "end": 110.0, "text": "Start of a new topic... Details about the new topic... Start of third topic... Details about third topic... Continuation of a different aspect of the same topic..."}
    ]

    Constraint satisfied:    
    As you can see, each object in the example output has a duration of at least 50 seconds, that is Output[0]["end"] - Output[0]["start"] = 60 seconds and Output[1]["end"] - Output[1]["start"] = 50 seconds and thus satisfies and the constraint and is a valid result.


    Transcript:
        ''' + formatted_transcript
    )

    # Create a GenerativeModel instance
    model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})

    try:
        # Generate response
        response = model.generate_content(prompt)

        # Check if response has the required attributes
        if hasattr(response, 'candidates'):
            candidates = response.candidates
            if candidates and isinstance(candidates[0], dict):
                content = candidates[0].get("content", {})
                if isinstance(content, dict):
                    parts = content.get("parts", [])
                    if isinstance(parts, list) and parts:
                        first_part = parts[0]
                        if isinstance(first_part, dict) and "text" in first_part:
                            # Safely access 'text'
                            text = first_part["text"]

                            # Check if text contains an error message
                            if "Error processing request" in text or "Unknown field" in text:
                                print("Error detected in the response:", text)
                                return '[{"start": 4, "end": 56, "text": "some-problem-during-retrieval"}]'

                            return response.text;
                        else:
                            return '[{"start": 4, "end": 56, "text": "some-problem-during-retrieval"}]'
                    else:
                        return '[{"start": 4, "end": 56, "text": "some-problem-during-retrieval"}]'
                else:
                    return '[{"start": 4, "end": 56, "text": "some-problem-during-retrieval"}]'
            else:
                return '[{"start": 4, "end": 56, "text": "some-problem-during-retrieval"}]'
        else:
            print("Response object has no 'candidates' attribute.")
            return []
    except Exception as e:
        print(f"Error accessing response content: {e}")
        return []





def analyze_clips(scene_changes, audio_peaks, timestamps):
    interesting_clips = []

    for timestamp in timestamps:
        start_time = timestamp['start']
        end_time = timestamp['end']
        duration = end_time - start_time

        if duration >= 26 and duration <= 60:
            scene_changes_in_window = sum(1 for change in scene_changes if start_time <= change < end_time)
            audio_peaks_in_window = sum(1 for peak in audio_peaks if start_time <= peak < end_time)

            interesting_clips.append({
                "start": start_time,
                "end": end_time,
                "duration": duration,
                "scene_changes": scene_changes_in_window,
                "audio_peaks": audio_peaks_in_window,
                "interest_score": scene_changes_in_window + audio_peaks_in_window
            })

    interesting_clips.sort(key=lambda x: x['interest_score'], reverse=True)
    return interesting_clips[:4]


def generate_54_sec_windows(scene_changes, audio_peaks):
    video_length = max(scene_changes[-1] if scene_changes else 0, audio_peaks[-1] if audio_peaks else 0)
    windows = []

    for start_time in range(0, int(video_length), 54):
        end_time = min(start_time + 54, video_length)
        scene_changes_in_window = sum(1 for change in scene_changes if start_time <= change < end_time)
        audio_peaks_in_window = sum(1 for peak in audio_peaks if start_time <= peak < end_time)

        windows.append({
            "start": start_time,
            "end": end_time,
            "duration": end_time - start_time,
            "scene_changes": scene_changes_in_window,
            "audio_peaks": audio_peaks_in_window,
            "interest_score": scene_changes_in_window + audio_peaks_in_window
        })

    return windows


async def main(video_path, audio_path, gemini_api_key, deepgram_api_key):
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    if not deepgram_api_key:
        raise ValueError("DEEPGRAM_API_KEY not found in environment variables.")

    with ThreadPoolExecutor() as executor:
        future_scenes = executor.submit(detect_scenes, video_path)
        future_audio_peaks = executor.submit(detect_audio_peaks, audio_path)
        
        scene_changes = future_scenes.result()
        audio_peaks = future_audio_peaks.result()
        
        transcript = await transcribe_audio_deepgram(audio_path, deepgram_api_key)

    gemini_response_text = send_transcript_to_gemini_api(transcript, gemini_api_key)

    if gemini_response_text:
        
        try:
            gemini_response_json = json.loads(gemini_response_text)
            interesting_clips = analyze_clips(scene_changes, audio_peaks, gemini_response_json)

            if len(interesting_clips) < 4:
                windows = generate_54_sec_windows(scene_changes, audio_peaks)
                additional_clips = sorted(windows, key=lambda x: x['interest_score'], reverse=True)[:4 - len(interesting_clips)]
                interesting_clips.extend(additional_clips)
                interesting_clips.sort(key=lambda x: x['interest_score'], reverse=True)
                
            print(json.dumps(interesting_clips, indent=4))
        except json.JSONDecodeError:
            print("Failed to parse Gemini API response.")
    else:
        print("Failed to get a response from Gemini API.")



if __name__ == "__main__":
    load_dotenv()  # Load environment variables from .env file

    video_path = sys.argv[1]
    audio_path = sys.argv[2]
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    deepgram_api_key = os.getenv("DEEPGRAM_API_KEY")

    # Run the main function asynchronously
    asyncio.run(main(video_path, audio_path, gemini_api_key, deepgram_api_key))


# python detectTimestamps.py ../downloads/w2iumrJ90Qk_video.mp4 ../downloads/w2iumrJ90Qk_audio_converted.wav
# python detectTimestamps.py ../downloads/HTXTVfBCeSY_video.mp4 ../downloads/HTXTVfBCeSY_audio.wav