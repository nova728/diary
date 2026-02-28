import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import { useCallback, useRef } from "react";
import { uploadApi } from "../api/upload";

// Toolbar button component
function ToolBtn({ onClick, active, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: "5px 9px",
        borderRadius: "5px",
        border: "none",
        background: active ? "var(--accent-subtle)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        transition: "background 0.1s, color 0.1s",
        lineHeight: 1,
        minWidth: "30px",
      }}
    >
      {children}
    </button>
  );
}

export default function RichEditor({ content, onChange }) {
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const handleImageUpload = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const data = await uploadApi.uploadImage(file);
      if (data.url && editorRef.current) {
        editorRef.current.chain().focus().setImage({ src: data.url }).run();
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "把今天的故事写下来吧……",
      }),
      CharacterCount,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
    editorProps: {
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          const imageFile = Array.from(files).find((f) => f.type.startsWith("image/"));
          if (imageFile) {
            event.preventDefault();
            handleImageUpload(imageFile);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) handleImageUpload(file);
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  // Keep ref in sync for the upload callback
  editorRef.current = editor;

  const charCount = editor.storage.characterCount?.characters?.() || 0;

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      background: "var(--surface)",
      overflow: "hidden",
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        padding: "8px 10px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-2)",
        flexWrap: "wrap",
      }}>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="粗体"
        ><b>B</b></ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="斜体"
        ><i>I</i></ToolBtn>
        <div style={{ width: "1px", height: "18px", background: "var(--border)", margin: "0 4px" }} />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="一级标题"
        >H1</ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="二级标题"
        >H2</ToolBtn>
        <div style={{ width: "1px", height: "18px", background: "var(--border)", margin: "0 4px" }} />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="无序列表"
        >≡</ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="有序列表"
        >1.</ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="引用"
        >&ldquo;&rdquo;</ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="代码"
        >{"`"}</ToolBtn>
        <div style={{ width: "1px", height: "18px", background: "var(--border)", margin: "0 4px" }} />
        <ToolBtn
          onClick={() => fileInputRef.current?.click()}
          title="插入图片"
        >🖼</ToolBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = "";
          }}
        />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "11px", color: "var(--text-muted)", padding: "0 4px" }}>
          {charCount} 字
        </span>
      </div>

      {/* Editor content */}
      <div style={{ padding: "16px 20px", minHeight: "320px" }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
