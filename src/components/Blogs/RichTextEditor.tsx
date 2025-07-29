'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImageIcon,
  Link2,
  Undo,
  Redo,
  Type,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children, 
  title 
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    } ${
      disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer'
    }`}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
);

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] p-4 border-0',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter the URL of the image:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="border rounded-lg">
        <div className="border-b bg-gray-50 dark:bg-gray-800 p-3">
          <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="min-h-[400px] p-4 flex items-center justify-center">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 dark:bg-gray-800 p-3">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Quote and Code Block */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Type className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Media and Links */}
          <ToolbarButton onClick={addImage} title="Insert Image">
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={addLink} 
            isActive={editor.isActive('link')}
            title="Insert/Edit Link"
          >
            <Link2 className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Horizontal Rule */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative bg-white dark:bg-gray-900">
        <div className="min-h-[400px] relative">
          <EditorContent 
            editor={editor}
            className="prose-editor-content"
          />
          
          {/* Bubble Menu for selected text */}
          {editor && (
            <BubbleMenu 
              editor={editor} 
              tippyOptions={{ duration: 100 }}
              className="flex items-center gap-1 p-2 bg-gray-900 text-white rounded-lg shadow-lg z-50"
            >
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Bold"
              >
                <Bold className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Italic"
              >
                <Italic className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1 rounded ${editor.isActive('strike') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Strikethrough"
              >
                <Strikethrough className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={addLink}
                className={`p-1 rounded ${editor.isActive('link') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Add Link"
              >
                <Link2 className="h-3 w-3" />
              </button>
            </BubbleMenu>
          )}

          {/* Placeholder */}
          {placeholder && editor.isEmpty && (
            <div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-base">
              {placeholder}
            </div>
          )}
        </div>
      </div>

      {/* Footer with word count */}
      <div className="border-t bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <div>
          {editor.storage.characterCount?.characters() || 0} characters, {editor.storage.characterCount?.words() || 0} words
        </div>
        <div className="text-xs text-gray-400">
          Use Ctrl+B for bold, Ctrl+I for italic
        </div>
      </div>

      {/* Custom CSS for better prose styling */}
      <style jsx global>{`
        .prose-editor-content .ProseMirror {
          outline: none;
          padding: 16px;
          min-height: 400px;
        }
        
        .prose-editor-content .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          line-height: 1.2;
        }
        
        .prose-editor-content .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          line-height: 1.3;
        }
        
        .prose-editor-content .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          line-height: 1.4;
        }
        
        .prose-editor-content .ProseMirror p {
          margin: 1em 0;
          line-height: 1.6;
        }
        
        .prose-editor-content .ProseMirror ul, 
        .prose-editor-content .ProseMirror ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        
        .prose-editor-content .ProseMirror li {
          margin: 0.5em 0;
        }
        
        .prose-editor-content .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .prose-editor-content .ProseMirror pre {
          background: #f3f4f6;
          border-radius: 0.5em;
          padding: 1em;
          margin: 1em 0;
          overflow-x: auto;
        }
        
        .prose-editor-content .ProseMirror code {
          background: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-size: 0.9em;
        }
        
        .prose-editor-content .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        
        .prose-editor-content .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2em 0;
        }
        
        .prose-editor-content .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          margin: 1em 0;
        }
        
        .prose-editor-content .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .prose-editor-content .ProseMirror a:hover {
          color: #1d4ed8;
        }
        
        .prose-editor-content .ProseMirror strong {
          font-weight: bold;
        }
        
        .prose-editor-content .ProseMirror em {
          font-style: italic;
        }
        
        .prose-editor-content .ProseMirror s {
          text-decoration: line-through;
        }
        
        /* Dark mode styles */
        .dark .prose-editor-content .ProseMirror blockquote {
          border-left-color: #4b5563;
          color: #9ca3af;
        }
        
        .dark .prose-editor-content .ProseMirror pre {
          background: #374151;
        }
        
        .dark .prose-editor-content .ProseMirror code {
          background: #374151;
        }
        
        .dark .prose-editor-content .ProseMirror hr {
          border-top-color: #4b5563;
        }
        
        .dark .prose-editor-content .ProseMirror a {
          color: #60a5fa;
        }
        
        .dark .prose-editor-content .ProseMirror a:hover {
          color: #93c5fd;
        }
      `}</style>
    </div>
  );
}