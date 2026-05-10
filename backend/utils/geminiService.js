import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    // console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
    process.exit(1);
}

/**
 * Generate flashcards from text
 * @param {string} text Document text
 * @param {number} count Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */

export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Generate exactly ${count} educational flashcards from the following text.
    Format each flashcard as:
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: easy, medium, or hard]

    Separate each flashcard with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;

        // Parse the response
        const flashcards = [];
        const cards = generatedText.split('-').filter(c => c.trim());

        for (const card of cards) {
            const lines = card.trim().split('\n');
            let question = '', answer = '', difficulty = 'medium';

            for (const line of lines) {
                if (line.startsWith('Q:')) {
                    question = line.substring(2).trim();
                } else if (line.startsWith('A:')) {
                    answer = line.substring(2).trim();
                } else if (line.startsWith('D:')) {
                    const diff = line.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && answer) {
                flashcards.push({ question, answer, difficulty });
            }
        }

        return flashcards.slice(0, count);
    } catch (error) {
        // console.error('Gemini API error:', error);
        throw new Error('Failed to generate flashcards');
    }
};

/**
 * Generate quiz questions
 * @param {string} text Document text
 * @param {number} numQuestions Number of questions
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
*/

export const generateQuiz = async (text, numQuestions = 5) => {
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each question as:
    Q: [Question]
    01: [Option 1]
    02: [Option 2]
    03: [Option 3]
    04: [Option 4]
    C: [Correct option number, e.g., "01"]
    E: [Brief explanation]
    D: [Difficulty: easy, medium, or hard]

    Separate questions with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        // Use the correct method to generate content
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;
        // console.log('Generated quiz text:', generatedText); // Debug log

        const questions = [];
        const questionBlocks = generatedText.split('---').filter(q => q.trim());

        for (const block of questionBlocks) {
            const lines = block.trim().split('\n');
            let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.match(/^\d+:/)) {
                    // Handle options like "01: Option text"
                    const optionText = trimmed.substring(trimmed.indexOf(':') + 1).trim();
                    options.push(optionText);
                } else if (trimmed.startsWith('C:')) {
                    correctAnswer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('E:')) {
                    explanation = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('D:')) {
                    const diff = trimmed.substring(2).trim().toLowerCase();
                    // Only allow 'easy' or 'hard' as valid difficulty levels
                    if (['easy', 'hard'].includes(diff)) {
                        difficulty = diff;
                    } else {
                        difficulty = 'easy'; // Default to 'easy' if the difficulty is not allowed
                    }
                }
            }

            // Validate we have all required fields
            if (question && options.length === 4 && correctAnswer) {
                // Convert correct answer from "01" to 0-based index
                const correctIndex = parseInt(correctAnswer) - 1;
                if (correctIndex >= 0 && correctIndex < 4) {
                    questions.push({
                        question,
                        options,
                        correctAnswer: correctIndex,
                        explanation,
                        difficulty
                    });
                }
            }
        }

        // console.log('Parsed questions:', questions); // Debug log
        return questions.slice(0, numQuestions);
    } catch (error) {
        // console.error('Gemini API error:', error);
        // console.error('Error details:', error.response?.data || error.message);
        throw new Error(`Failed to generate quiz: ${error.message}`);
    }
};
/**
 * Generate document summary
 * @param {string} text Document text
 * @returns {Promise<string>}
 */

export const generateSummary = async (text) => {
    const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points.
    Keep the summary clear and structured.

    Text:
    ${text.substring(0, 20000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text;
        return generatedText;
    } catch (error) {
        // console.error('Gemini API error:', error);
        throw new Error('Failed to generate summary');
    }
};

/**
 * Chat with document context
 * @param {string} question User question
 * @param {Array<Object>} chunks Relevant document chunks
 * @returns {Promise<string>}
 */

export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

    const prompt = `Based on the following context from a document, Analyse the context and answer the user's quest If the answer is not in the context, say so.
    
    Context:
    ${context}
    
    Question: ${question}
    
    Answer:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text;
        return generatedText
    } catch (error) {
        // console.error('Gemini API error:', error);
        throw new Error('Failed to process chat request');
    }
};

/**
 * Explain a specific concept
 * @param {string} concept Concept to explain
 * @param {string} context Relevant context
 * @returns {Promise<string>}
 */

export const explainConcept = async (concept, context) => {
    const prompt = `Explain the concept of "${concept}" based on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Include examples if relevant.

    Context:
    ${context.substring(0, 10000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text;
        return generatedText;
    } catch (error) {
        // console.error('Gemini API error:', error);
        throw new Error('Failed to explain concept');
    }
};

/**
 * Generate study plan
 * @param {string} text Document text
 * @param {number} days Number of days until exam
 * @param {number} dailyHours Available hours per day
 * @returns {Promise<Array>}
 */
export const generateStudyPlan = async (text, days, dailyHours) => {
    const prompt = `Create a structured study plan based on the following text. 
    The user has ${days} days to study, and can dedicate ${dailyHours} hours per day.
    
    Return ONLY a valid JSON array of days. Do not include any markdown formatting or extra text.
    Each day should have a 'dayNumber' (starting from 1) and an array of 'topics'. 
    Each topic should have a 'title', a brief 'description', and 'estimatedMinutes'.
    The total estimatedMinutes for each day should not exceed ${dailyHours * 60}.
    
    JSON Format Example:
    [
      {
        "dayNumber": 1,
        "topics": [
          {
            "title": "Topic 1",
            "description": "Description of topic 1",
            "estimatedMinutes": 60
          }
        ]
      }
    ]

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        let generatedText = response.text.trim();
        // Clean up markdown formatting if present
        if (generatedText.startsWith('\`\`\`json')) {
            generatedText = generatedText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
        } else if (generatedText.startsWith('\`\`\`')) {
            generatedText = generatedText.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
        }

        const studyPlan = JSON.parse(generatedText);
        return studyPlan;
    } catch (error) {
        throw new Error('Failed to generate study plan: ' + error.message);
    }
};

/**
 * Generate mind map data from text
 * @param {string} text Document text
 * @returns {Promise<Object>}
 */
export const generateMindMapData = async (text) => {
    const prompt = `Analyze the following text and extract the main concepts and their relationships as a hierarchical mind map.
    
    Return ONLY a valid JSON object. Do not include any markdown formatting or extra text.
    The root should be the main topic of the document.
    Each concept can have child concepts.
    
    JSON Format:
    {
      "id": "root",
      "label": "Main Topic",
      "children": [
        {
          "id": "child1",
          "label": "Key Concept 1",
          "children": [
            { "id": "sub1", "label": "Sub-concept A" }
          ]
        }
      ]
    }

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        let generatedText = response.text.trim();
        // Clean up markdown formatting if present
        if (generatedText.startsWith('\`\`\`json')) {
            generatedText = generatedText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
        } else if (generatedText.startsWith('\`\`\`')) {
            generatedText = generatedText.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
        }

        const mindMapData = JSON.parse(generatedText);
        return mindMapData;
    } catch (error) {
        throw new Error('Failed to generate mind map data: ' + error.message);
    }
};