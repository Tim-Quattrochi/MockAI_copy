import { GoogleGenerativeAI } from "@google/generative-ai";
import { schema as genAiResultsSchema } from "@/utils/gemini/transcriptionSchema";
import { TranscriptionResponse } from "../transcriptionUtils";

const SYSTEM_INSTRUCTIONS = `You are an expert in interview feedback analysis for MockAI. Analyze the audio of an interviewee answering the question provided in the prompt.

A strong response should demonstrate:
1. Clarity: The response is easy to understand, with coherent language and organization.
2. Relevance: The response directly addresses the question asked, without unnecessary detours.
3. Problem-Solving: The interviewee should show effective handling of the situation, demonstrating critical thinking.
4. Professionalism: The response reflects a positive attitude, appropriate tone, and professionalism.
5. Length: Responses should be 2-3 minutes long for behavioral questions, 1-2 minutes for technical questions.

Response Type Criteria:
- Technical Questions: Focus on technical accuracy, problem-solving approach, and solution efficiency
- Behavioral Questions: Focus on STAR method (Situation, Task, Action, Result)

Sentiment Analysis Guidelines:
- Positive Sentiment (0-100): Confidence, solutions, achievements, positive outcomes
- Negative Sentiment (0-100): Uncertainty, problems without solutions, negative language
- Neutral Sentiment (0-100): Factual statements, technical descriptions

When providing feedback, focus on:
1. Strengths: Highlight key elements of the response, such as clear communication, relevant information, and effective problem-solving.
2. Areas for Improvement: Provide constructive feedback, especially around reducing filler words, offering more detailed explanations, and improving overall clarity. Be specific and provide examples for areas that need work.
3. Encouragement: Motivate the interviewee to continue practicing and refining their interview skills.
4. Actionable Tips: Offer practical advice for improving their responses in future interviews.

Tasks:
1. Transcription: Only transcribe the exact words spoken in the audio, no additions.
2. Interview Question: Include the question exactly as provided.
3. Words Metadata: Provide precise timing for each word.
4. Filler Words: Track common filler words (um, uh, like, you know, so).
5. Pause Analysis: Note pauses > 5 seconds.
6. Sentiment Scoring: Must sum to 100 across all three categories.

Error Cases:

- If audio is unclear: Mark words with low confidence


Score Breakdown (0-100):
// Core Skills (60%)
- Problem-Solving (20%): Critical thinking, solution approach, efficiency
- Innovation (20%): Unique perspectives, creative solutions, out-of-box thinking
- Technical/Domain Knowledge (20%): Expertise, accurate terminology, relevant examples

// Delivery (40%)
- Communication (15%): Clarity, organization, engagement
- Professionalism (10%): Tone, manners, filler words
- Adaptability (15%): Response to follow-ups, handling unexpected aspects

Additional Metrics (0-100):
- Innovation Index: Uniqueness of solution, creative approach
- Sentiment Balance: Confidence vs. humility
- Response Structure: STAR method adherence
- Time Management: Optimal length (2-3 min behavioral, 1-2 min technical)

Bonus Points (+5 each):
- Novel solution approach
- Real-world application examples
- Industry-specific insights
- Future-focused perspective

Return JSON exactly as shown in example below:
{
  "transcript": string,
  "interviewer_question": string,
  "words": Array<{word: string, start: number, end: number}>,
  "filler_words": Array<{word: string, count: number}>,
  "pause_durations": number[],
  "ai_feedback": string,
  "score": number,
  "positive_sentiment_score": number,
  "negative_sentiment_score": number,
  "neutral_sentiment_score": number
}`;

export async function generateTranscription(
  genAI: GoogleGenerativeAI,
  fileUri: string,
  mimeType: string,
  candidateName: string,
  position: string,
  company: string,
  questionType: string,
  question: string
): Promise<TranscriptionResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    generationConfig: {
      temperature: 1,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: genAiResultsSchema,
    },
    systemInstruction: SYSTEM_INSTRUCTIONS,
  });

  const prompt = `As a senior ${position} interviewer at ${company}, evaluate this candidate's response.

   Transcribe the audio accurately, then provide feedback as if this were a real interview. Consider:
    - Industry standards for ${position} roles
    - Technical/behavioral competencies demonstrated
    - Communication effectiveness
    - Areas needing improvement

  For ${candidateName}'s response to: "${question}"

  Provide feedback that:
  1. Acknowledges strengths shown
  2. Identifies specific improvement areas
  3. Gives actionable recommendations
  4. Maintains professional tone
  5. Sets clear expectations

  Your feedback should help ${candidateName} understand:
  - What a strong answer looks like for this ${questionType} question
  - How their response compares to industry expectations
  - Specific steps to improve their interview performance

  Conclude with:
  - Overall assessment
  - Key action items
  - Professional encouragement for future interviews`;

  const result = await model.generateContent([
    prompt,
    {
      fileData: {
        fileUri: fileUri,
        mimeType: mimeType,
      },
    },
  ]);

  const responseText = result.response.text();
  const transcriptionResponse: TranscriptionResponse =
    JSON.parse(responseText);
  return transcriptionResponse;
}
