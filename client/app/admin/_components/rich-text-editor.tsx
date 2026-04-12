"use client";

import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface RichTextEditorProps {
  content: string;
  onChange: (md: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={content}
        onChange={(val) => onChange(val || "")}
        textareaProps={{ placeholder }}
        height={250}
        preview="live"
      />
    </div>
  );
}
