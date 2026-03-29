export type WorldType = "Game Studio" | "Space Agency" | "Music Tech Startup" | "Wildlife Conservation Lab";

export interface User {
  id: string;
  name: string;
  selectedWorld: WorldType;
}

export interface LearnerProfile {
  tendencyToRush: number;      // 0.0 to 1.0
  tendencyToFreeze: number;    // 0.0 to 1.0
  confidenceLevel: number;     // 0.0 to 1.0
  recentStates: CognitiveState[];
  completedMissions: string[]; // Mission IDs
}

export interface Mission {
  id: string;
  world: WorldType;
  title: string;
  briefing: string;
  objective: string;
  checklist: { id: string; label: string; completed: boolean }[];
  starterCode: string;
  expectedOutputFiles?: string[];
}

export type MentorMode = "Senior Dev" | "Rubber Duck" | "Skeptical User";
export type CognitiveState = "productive_flow" | "surface_confusion" | "deep_confusion" | "premature_closure";

export interface MentorState {
  currentMode: MentorMode;
  inferredCognitiveState: CognitiveState;
  isVisible: boolean;
  insightMetadata?: {
    recentSignals: string[];
    reasoning: string;
  };
}

export type BehaviorEventType = "keystroke" | "run" | "error" | "delete_burst" | "idle";

export type BehaviorEvent =
  | { type: "keystroke"; timestamp: number; charsAdded: number }
  | { type: "run"; timestamp: number }
  | { type: "error"; timestamp: number; message: string }
  | { type: "delete_burst"; timestamp: number; charsDeleted: number }
  | { type: "idle"; timestamp: number; durationMs: number };

export interface ProjectSession {
  id: string;
  missionId: string;
  currentCode: string;
  events: BehaviorEvent[];
  startTime: number;
}

export interface LaunchFeedback {
  id: string;
  author: string; // e.g., "QA Tester", "Player123"
  content: string;
  type: "bug" | "praise" | "feature_request";
}
