"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Textarea } from "@/components/ui/textarea";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-bg border border-border rounded-lg animate-pulse" />,
});

const LANGUAGE_MAP: Record<string, string> = {
  kuery: "plaintext",
  eql: "plaintext",
  lucene: "plaintext",
  esql: "sql",
};

interface MonacoQueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: number;
}

export function MonacoQueryEditor({
  value,
  onChange,
  language = "kuery",
  readOnly = false,
  height = 200,
}: MonacoQueryEditorProps) {
  const [useFallback, setUseFallback] = useState(false);

  if (useFallback) {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(5, Math.ceil(height / 24))}
        className="font-mono text-sm"
        readOnly={readOnly}
      />
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <MonacoEditor
        height={height}
        language={LANGUAGE_MAP[language] || "plaintext"}
        value={value}
        onChange={(v) => onChange(v || "")}
        onMount={(_editor, monaco) => {
          monaco.editor.defineTheme("odosian", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#0D1117",
              "editor.foreground": "#E6EDF3",
              "editor.lineHighlightBackground": "#161B22",
              "editorCursor.foreground": "#4CBDFA",
              "editor.selectionBackground": "#4CBDFA33",
            },
          });
          monaco.editor.setTheme("odosian");
        }}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: "on",
          wordWrap: "on",
          tabSize: 2,
          padding: { top: 8, bottom: 8 },
          renderLineHighlight: "line",
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: { vertical: "auto", horizontal: "auto" },
        }}
      />
      <button
        type="button"
        onClick={() => setUseFallback(true)}
        className="block w-full text-center text-xs text-text-muted py-1 hover:text-text-secondary bg-surface-light border-t border-border"
      >
        Switch to plain editor
      </button>
    </div>
  );
}
