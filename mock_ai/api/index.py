from flask import Flask, request, jsonify
import os
from deepgram import (
    DeepgramClient,
    PrerecordedOptions,
    FileSource,
)
from flask_cors import CORS
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()

# did you forget to add your API key to the .env file?
API_KEY = os.getenv("DG_API_KEY")


@app.route('/api', methods=['POST'])
def api():
    data = request.get_json()
    return data


@app.route('/api/upload_audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return "No audio file provided", 400

    audio_file = request.files['audio']
    audio_buffer = audio_file.read()

    # save the audio file
    with open('./audio.webm', 'wb') as f:
        f.write(audio_buffer)

    try:
        # STEP 1 Create a Deepgram client using the API key
        deepgram = DeepgramClient(API_KEY)

        with open('./audio.webm', "rb") as file:
            buffer_data = file.read()

        payload: FileSource = {
            "buffer": buffer_data,
        }

        # STEP 2: Configure Deepgram options for audio analysis
        options = PrerecordedOptions(
            model="nova-2",
            smart_format=True,
            # intents=True,
            # summarize="v2",
            # topics=True,
        )

        # STEP 3: Call the transcribe_file method with the audio payload and options
        response = deepgram.listen.prerecorded.v(
            "1").transcribe_file(payload, options)

        # STEP 4: Print the response
        print(response.to_json(indent=4))
        return jsonify(response.to_json(indent=4))

    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"error": str(e)})


@app.route('/api/health', methods=['GET'])
def health():
    return {"status": "ok", "message": "API listening"}


if __name__ == '__main__':
    app.run(port=3001, debug=True)