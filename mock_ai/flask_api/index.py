from flask import Flask, request, jsonify
import os
from deepgram import DeepgramClient, PrerecordedOptions, FileSource  # type: ignore
from flask_cors import CORS
from dotenv import load_dotenv  # type: ignore
from audio_analysis import analyze_audio
from database import init_db, add_user, get_all_users, add_question, get_all_questions, get_user_by_email, save_transcript
import sqlite3
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

load_dotenv()

# Gemini implementation psuedo code:
# Determine the user we are analyzing.
# Find the transcript for the user.
# Is the transcript the one we want to analyze?
# If not, find the correct transcript.
# Make a call to the Gemini API with the transcript.
# Return the results of the Gemini API call.


# NOTE did you forget to add your API keys to the .env file?
#      - path: mock_ai/api/.env
API_KEY = os.getenv("DG_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Gemini configuration
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')


@app.route('/service', methods=['POST'])
def api():
    data = request.get_json()
    return jsonify(data)


@app.route('/service/upload_audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return "No audio file provided", 400

    user = request.form.get('user')

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
            punctuate=True,
            filler_words=True,
            utterances=True,
            utt_split=10000
        )

        # STEP 3: Call the transcribe_file method with the audio payload and options

        response = deepgram.listen.prerecorded.v(
            "1").transcribe_file(payload, options)

        # TODO: We also need to store some of the data.

        # save the transcript to the feedback table and enter the users email.
        user = get_user_by_email(user)
        print(user)
        save_transcript(user, response)

        return analyze_audio(response)

    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"error": str(e)})


@app.route('/service/health', methods=['GET'])
def health():
    return {"status": "ok", "message": "API listening"}


@app.route('/service/add_user', methods=['POST'])
def add_email_route():
    data = request.json
    email = data['email']

    if not email:
        return jsonify({"error": "Email is required"}), 400

# if the user already exists in sqlite3, skip to the next step
    user = add_user(email)
    if user == "User already exists":
        pass

    return jsonify({"message": "Request received"}), 200


# TODO: Possibly protect this route. OR take it out of a route so it isn't accessible.
@app.route('/service/get_users', methods=['GET'])
def get_emails_route():
    emails = get_all_users()
    return jsonify(emails)


@app.route('/service/add_question', methods=['POST'])
def add_question_route():
    data = request.get_json()
    question = data.get('question')

    if not question:
        return jsonify({"error": "Question is required"}), 400

    question_id = add_question(question)

    if question_id == "Question already exists":
        return jsonify({"error": "Question already exists"}), 400

    return jsonify({"id": question_id, "question": question})


@app.route('/service/get_questions', methods=['GET'])
def get_questions_route():
    questions = get_all_questions()
    return jsonify(questions)


@app.route('/service/save_results', methods=['POST'])
def save_results():
    data = request.get_json()
    user = data.get('user')
    results = data.get('results')

    if not user or not results:
        return jsonify({"error": "User and results are required"}), 400

    # Save results in the database
    try:
        with sqlite3.connect('MockAI.db') as conn:
            cursor = conn.cursor()
            for result in results:
                cursor.execute('''
                    INSERT INTO results (user, question, score, transcript, filler_words, long_pauses)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (user, result['question'], result['score'], result['transcript'], ','.join(result['filler_words']), result['long_pauses']))
            conn.commit()
            return jsonify({"message": "Results saved successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/service/get_results', methods=['GET'])
def get_results():
    try:
        with sqlite3.connect('MockAI.db') as conn:
            cursor = conn.cursor()
            results = cursor.execute('''
                SELECT * FROM results WHERE id = 1
            ''').fetchone()
            return jsonify({
                'id': results[0],
                'user': results[1],
                'question': results[2],
                'score': results[3],
                'transcript': results[4],
                'filler_words': results[5],
                'long_pauses': results[6]
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Initialize the database when this script is executed directly
if __name__ == '__main__':
    init_db()
    app.run(port=3001, debug=True)
