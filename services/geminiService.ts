
import { GoogleGenAI, Type } from "@google/genai";
import type { CodeReviewResult } from '../types';

const API_KEY = "AIzaSyA2AxXSThVuydgEpQYxBKlbUeY6maIf2Mk";

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const codeReviewSchema = {
    type: Type.OBJECT,
    properties: {
        overallExplanation: {
            type: Type.STRING,
            description: "A brief, high-level explanation of what the code does, written in simple terms."
        },
        errors: {
            type: Type.ARRAY,
            description: "An array detailing specific bugs or syntax errors that would prevent the code from running correctly.",
            items: {
                type: Type.OBJECT,
                properties: {
                    lineNumber: { type: Type.INTEGER, description: "The exact line number of the error." },
                    errorDescription: { type: Type.STRING, description: "A concise description of the error." },
                    suggestedFix: { type: Type.STRING, description: "The corrected line of code." },
                    fixExplanation: { type: Type.STRING, description: "A simple explanation of why the fix is correct." }
                },
                required: ["lineNumber", "errorDescription", "suggestedFix", "fixExplanation"]
            }
        },
        suggestions: {
            type: Type.ARRAY,
            description: "An array of suggestions for code that is functionally correct but could be improved (e.g., for performance, style, or best practices).",
            items: {
                type: Type.OBJECT,
                properties: {
                    lineNumber: { type: Type.INTEGER, description: "The line number for the suggested improvement." },
                    suggestion: { type: Type.STRING, description: "The suggested improved code." },
                    explanation: { type: Type.STRING, description: "An explanation of why the suggestion is an improvement." }
                },
                required: ["lineNumber", "suggestion", "explanation"]
            }
        },
        lineExplanations: {
            type: Type.ARRAY,
            description: "An array providing a simple, one-liner explanation for each corresponding line of code.",
            items: {
                type: Type.OBJECT,
                properties: {
                     lineNumber: { type: Type.INTEGER, description: "The line number this explanation corresponds to." },
                    explanation: { type: Type.STRING, description: "A simple, one-liner explanation of what this line does." }
                },
                required: ["lineNumber", "explanation"]
            }
        },
        output: {
            type: Type.STRING,
            description: "The predicted standard output of the code when executed. If the code has errors, this may describe the expected error message."
        },
        timeComplexity: {
            type: Type.STRING,
            description: "The time complexity of the code in Big O notation (e.g., 'O(n)')."
        },
        spaceComplexity: {
            type: Type.STRING,
            description: "The space complexity of the code in Big O notation (e.g., 'O(1)')."
        }
    },
    required: ["overallExplanation", "errors", "suggestions", "lineExplanations", "output", "timeComplexity", "spaceComplexity"]
};

export const analyzeCode = async (code: string, language: string): Promise<CodeReviewResult> => {
    const prompt = `
        As an expert code reviewing agent, your task is to analyze the following ${language} code.
        Your analysis must be comprehensive:
        1.  Provide a high-level explanation of the code's purpose.
        2.  Identify critical bugs and errors. Distinguish these from suggestions. For each error, provide the line number, description, suggested fix, and an explanation.
        3.  Provide suggestions for improvement on code that is functionally correct but could be better (e.g., performance, readability, best practices). For each suggestion, provide the line number, the suggested code, and an explanation.
        4.  Provide a simple, one-liner explanation for **every single line of code**. The number of explanations must match the number of lines in the code.
        5.  Execute the code and provide its exact standard output. If there are errors, describe the output.
        6.  Provide the time and space complexity analysis in Big O notation.

        Respond ONLY with a valid JSON object that adheres to the provided schema. Do not include any text or markdown formatting outside of the JSON object.

        Code to review:
        \`\`\`${language}
        ${code}
        \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: codeReviewSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as CodeReviewResult;
        
        // Ensure arrays are sorted by line number for consistent display
        result.errors?.sort((a, b) => a.lineNumber - b.lineNumber);
        result.suggestions?.sort((a, b) => a.lineNumber - b.lineNumber);
        result.lineExplanations?.sort((a, b) => a.lineNumber - b.lineNumber);

        return result;
    } catch (error) {
        console.error("Error analyzing code with Gemini API:", error);
        throw new Error("Failed to get a valid review from the AI. The response may be malformed.");
    }
};
