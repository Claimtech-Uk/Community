import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import type { JSONContent } from "@tiptap/react";

const lowlight = createLowlight(common);

// Use the same extensions as the editor for consistent rendering
const extensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      class: "text-primary underline hover:text-primary/80",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: "rounded-lg max-w-full my-4",
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: "rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto",
    },
  }),
];

interface TipTapRendererProps {
  content: JSONContent | null;
  className?: string;
}

export function TipTapRenderer({ content, className = "" }: TipTapRendererProps) {
  if (!content || Object.keys(content).length === 0) {
    return (
      <div className="text-muted-foreground italic">
        No content available yet.
      </div>
    );
  }

  const html = generateHTML(content, extensions);

  return (
    <div
      className={`prose prose-sm sm:prose dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
