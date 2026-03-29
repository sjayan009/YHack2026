"use client";

import { useEffect, useRef, useState } from "react";

interface WorkspacePreviewProps {
  code: string;
  runTrigger: number;
  onError: (msg: string) => void;
}

export function WorkspacePreview({ code, runTrigger, onError }: WorkspacePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeUrl, setIframeUrl] = useState<string>("");

  useEffect(() => {
    if (runTrigger > 0) {
      const injectedCode = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; font-family: sans-serif; background: #fff; color: #000; padding: 10px; }
            </style>
          </head>
          <body>
            ${code}
            <script>
              window.onerror = function(msg, url, line, col, error) {
                window.parent.postMessage({ type: 'error', message: msg }, '*');
                return false;
              };
            </script>
          </body>
        </html>
      `;
      const blob = new Blob([injectedCode], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setIframeUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [runTrigger, code]);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "error") {
        onError(event.data.message);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onError]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 bg-white shadow-inner flex flex-col relative">
      <div className="bg-black text-white/50 text-xs px-2 py-1 flex items-center gap-2 border-b border-white/10">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>
        Preview Sandbox
      </div>
      {runTrigger === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 flex-col gap-2">
          <span>Awaiting execution...</span>
        </div>
      ) : (
        <iframe
          key={runTrigger}
          ref={iframeRef}
          src={iframeUrl}
          title="output"          className="w-full flex-1"
          sandbox="allow-scripts allow-modals allow-pointer-lock allow-same-origin"
        />
      )}    </div>
  );
}
