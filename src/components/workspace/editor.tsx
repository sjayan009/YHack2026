"use client";

import { useRef, useEffect, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { BehaviorEvent } from "../../../types";

interface WorkspaceEditorProps {
  initialCode: string;
  onChange: (value: string) => void;
  onEvent: (event: BehaviorEvent) => void;
}

export function WorkspaceEditor({ initialCode, onChange, onEvent }: WorkspaceEditorProps) {
  const monaco = useMonaco();
  const [code, setCode] = useState(initialCode);
  const lastActiveTime = useRef(Date.now());
  const idleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("forge-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#00000000", // Transparent to match workspace
        },
      });
      monaco.editor.setTheme("forge-dark");
    }
  }, [monaco]);

  useEffect(() => {
    idleIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActiveTime.current;
      if (idleTime > 5000) {
        onEvent({ type: "idle", timestamp: now, durationMs: idleTime });
        // reset to avoid spam
        lastActiveTime.current = now; 
      }
    }, 5000);
    return () => {
      if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
    };
  }, [onEvent]);

  const handleEditorChange = (value: string | undefined, event: any) => {
    const newVal = value || "";
    setCode(newVal);
    onChange(newVal);

    lastActiveTime.current = Date.now();

    // Instrument events
    if (event.changes && event.changes.length > 0) {
      const change = event.changes[0];
      if (change.text.length > 5) {
        onEvent({ type: "keystroke", timestamp: Date.now(), charsAdded: change.text.length });
      } else if (change.rangeLength > 10 && change.text === "") {
        onEvent({ type: "delete_burst", timestamp: Date.now(), charsDeleted: change.rangeLength });
      } else {
        onEvent({ type: "keystroke", timestamp: Date.now(), charsAdded: 1 });
      }
    }
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md">
      <Editor
        height="100%"
        defaultLanguage="html"
        theme="forge-dark"
        value={code}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-mono)",
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
        }}
      />
    </div>
  );
}
