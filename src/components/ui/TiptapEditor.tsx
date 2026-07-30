"use client";

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, 
  List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon 
} from 'lucide-react';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const btnStyle = (active: boolean) => ({
    background: active ? 'var(--clr-surface-3)' : 'transparent',
    border: 'none',
    padding: '6px',
    cursor: 'pointer',
    borderRadius: '4px',
    color: active ? 'var(--clr-primary)' : 'var(--clr-text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  return (
    <div style={{ 
      display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px', 
      borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-surface-2)',
      borderTopLeftRadius: '8px', borderTopRightRadius: '8px'
    }}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))}><Bold size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))}><Italic size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} style={btnStyle(editor.isActive('strike'))}><Strikethrough size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} style={btnStyle(editor.isActive('code'))}><Code size={18} /></button>
      
      <div style={{ width: '1px', background: 'var(--clr-border)', margin: '0 4px' }} />

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={btnStyle(editor.isActive('heading', { level: 1 }))}><Heading1 size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle(editor.isActive('heading', { level: 2 }))}><Heading2 size={18} /></button>
      
      <div style={{ width: '1px', background: 'var(--clr-border)', margin: '0 4px' }} />

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))}><List size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))}><ListOrdered size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btnStyle(editor.isActive('blockquote'))}><Quote size={18} /></button>
      
      <div style={{ width: '1px', background: 'var(--clr-border)', margin: '0 4px' }} />

      <button type="button" onClick={setLink} style={btnStyle(editor.isActive('link'))}><LinkIcon size={18} /></button>

      <div style={{ flex: 1 }} />

      <button type="button" onClick={() => editor.chain().focus().undo().run()} style={btnStyle(false)}><Undo size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} style={btnStyle(false)}><Redo size={18} /></button>
    </div>
  );
};

export default function TiptapEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false })
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-prose',
        style: 'min-height: 400px; padding: 16px; outline: none; color: #000; background: #fff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;'
      }
    }
  });

  return (
    <div style={{ border: '1px solid var(--clr-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style dangerouslySetInnerHTML={{__html: `
        .tiptap-prose p { margin-bottom: 1em; }
        .tiptap-prose h1, .tiptap-prose h2, .tiptap-prose h3 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
        .tiptap-prose h1 { font-size: 2em; }
        .tiptap-prose h2 { font-size: 1.5em; }
        .tiptap-prose ul, .tiptap-prose ol { padding-left: 20px; margin-bottom: 1em; }
        .tiptap-prose ul { list-style-type: disc; }
        .tiptap-prose ol { list-style-type: decimal; }
        .tiptap-prose blockquote { border-left: 3px solid #ccc; padding-left: 10px; color: #666; font-style: italic; }
        .tiptap-prose a { color: #0066cc; text-decoration: underline; }
      `}} />
    </div>
  );
}
