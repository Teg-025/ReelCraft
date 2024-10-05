import asyncio
import os
from dotenv import load_dotenv
from deepgram import Deepgram

# Load environment variables
load_dotenv()
deepgram_api_key = os.getenv("DEEPGRAM_API_KEY")

async def transcribe_audio_deepgram(audio_path, deepgram_api_key):
    # Create a Deepgram client using the API key
    client = Deepgram(deepgram_api_key)
    
    # Read the audio file
    with open(audio_path, 'rb') as audio_file:
        audio = audio_file.read()
    
    # Configure Deepgram options
    options = {
        'punctuate': True,
        'diarize': False
    }
    
    # Send the audio data to Deepgram for transcription
    response = await client.transcription.prerecorded(
        {'buffer': audio, 'mimetype': 'audio/wav'},
        options
    )
    
    # Extract and format the transcript
    transcript = []
    for word_info in response['results']['channels'][0]['alternatives'][0]['words']:
        transcript.append({
            "start": word_info['start'],
            "end": word_info['end'],
            "text": word_info['word']
        })
    
    return transcript

async def main():
    audio_path = "../downloads/w2iumrJ90Qk_audio_converted.wav"
    transcript = await transcribe_audio_deepgram(audio_path, deepgram_api_key)
    
    # Print the transcript
    print(transcript)

# Run the main function in the event loop
if __name__ == "__main__":
    asyncio.run(main())

