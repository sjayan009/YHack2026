"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { BehaviorEvent, CognitiveState, MentorMode, MentorState } from "../../../types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function processMentorAction(
  allEvents: BehaviorEvent[],
  currentCode: string,
  missionContext: any,
  userMessage?: string,
  manualModeOverride?: MentorMode
): Promise<{ state: MentorState; response: string | null }> {
  // Analyze only the short-term memory (last 25 events) to prevent getting permanently stuck in one persona
  const recentEvents = allEvents.slice(-25);

  let errorCount = recentEvents.filter(e => e.type === "error").length;
  let keystrokes = recentEvents.filter(e => e.type === "keystroke").length;
  let idles = recentEvents.filter(e => e.type === "idle").length;
  let deleteBursts = recentEvents.filter(e => e.type === "delete_burst").length;
  let runs = recentEvents.filter(e => e.type === "run").length;

  const lastEvent = recentEvents[recentEvents.length - 1];
  const secondLastEvent = recentEvents[recentEvents.length - 2];
  const lastTwoAreRuns = lastEvent?.type === "run" && secondLastEvent?.type === "run";

  let inferredState: CognitiveState = "productive_flow";
  let mode: MentorMode = "Senior Dev";
  let response: string | null = null;
  let reasoning = "Consistent typing with few errors.";
  let promptTrigger: string | null = null;

  if (userMessage) {
    // If the user explicitly asks a question, always respond as Senior Dev
    inferredState = "productive_flow";
    mode = manualModeOverride || "Senior Dev";
    reasoning = "User asked a direct question.";
    promptTrigger = `The user asked a direct question: "${userMessage}". Give a helpful, mentoring response based on their current code.`;
  } else if (errorCount >= 1) {
    inferredState = "deep_confusion";
    mode = "Rubber Duck";
    reasoning = "Error detected. Switching to Rubber Duck to encourage reflection.";
    if (lastEvent?.type === "error") {
      promptTrigger = "The user just triggered a persistent bug. Ask them to walk you through what they currently expect the code to do when 'Corrupt Data' is clicked, to encourage reflection.";
    }
  } else if (lastTwoAreRuns) {
    inferredState = "premature_closure";
    mode = "Skeptical User";
    reasoning = "User hit Run twice consecutively without changing any code.";
    promptTrigger = "The user just clicked 'Run' multiple times without making any new keystrokes. Playfully call them out for just guessing, or ask them what they were hoping would magically change!";
  } else if (idles >= 2 && keystrokes < 10) {    
    inferredState = "surface_confusion";
    mode = "Senior Dev";
    reasoning = "User is pausing a lot. Offering a gentle nudge.";
    if (idles % 3 === 0) {
      promptTrigger = "The user has been idle and might be stuck. Gently suggest they consider using an 'if' statement to block negative scores.";
    }
  } else if (deleteBursts >= 1) {
    inferredState = "deep_confusion";
    mode = "Rubber Duck";
    reasoning = "A large block of code was deleted. User might be thrashing.";
    if (lastEvent?.type === "idle") {
      promptTrigger = "The user deleted a chunk of code and now stopped typing. Check in and gently ask: 'Are you finished making edits to the code? Run me through what you kept vs deleted!'";
    }
  } else if (keystrokes > 10 && errorCount === 0) {
    inferredState = "productive_flow";
    mode = "Senior Dev";
    reasoning = "High output, no recent errors. Pure flow state.";
  }

  // Apply manual override at the end
  if (manualModeOverride) {
    mode = manualModeOverride;
  }

  if (promptTrigger) {
    try {
      // Use Gemini to generate the dynamic mentor response based on context
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `You are Atlas, a friendly, encouraging AI coding mentor for tweens learning to code.
Current Mode: ${mode}
User's Cognitive State: ${inferredState}

Current Code:
\`\`\`html
${currentCode}
\`\`\`

Reason for speaking now:
${promptTrigger}

Task: Respond directly to the user in a short, conversational, and energetic tone (1-3 sentences max). Don't give them the explicit code answer; guide them to it! Speak in character as Atlas.`;

      const result = await model.generateContent(prompt);
      response = result.response.text().trim();
    } catch (e) {
      console.error("Gemini API Error:", e);
      response = "I hit a snag parsing that on my end. Give it another try!";
    }
  }

  return {
    state: {
      currentMode: mode,
      inferredCognitiveState: inferredState,
      isVisible: true,
      insightMetadata: {
        recentSignals: [
          `Errors: ${errorCount}`,
          `Keystrokes: ${keystrokes}`,
          `Idles: ${idles}`,
          `Deletions: ${deleteBursts}`,
          `Runs: ${runs}`
        ],
        reasoning
      }
    },
    response
  };
}
