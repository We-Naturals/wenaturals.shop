"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Quote, Undo, Redo,
    Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
    Heading1, Heading2, Heading3, Minus, Video
} from "lucide-react";
import { VideoExtension } from "./VideoExtension";

interface ProductDescriptionEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt("Enter image URL");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addVideo = () => {
        const url = window.prompt("Enter Video URL");
        if (url) {
            editor.chain().focus().setVideo({ src: url }).run();
        }
    };

    const addYoutube = () => {
        const url = window.prompt("Enter YouTube URL");
        if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    const openCloudinaryWidget = () => {
        if (!(window as any).cloudinary) {
            alert("Cloudinary script not loaded yet.");
            return;
        }

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            alert("Cloudinary configuration missing.");
            return;
        }

        const widget = (window as any).cloudinary.createUploadWidget(
            {
                cloudName,
                uploadPreset,
                sources: ["local", "url", "camera"],
                resourceType: "video",
                clientAllowedFormats: ["mp4", "webm", "ogg"],
                maxFileSize: 50000000, // 50MB
            },
            (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    editor.chain().focus().setVideo({ src: result.info.secure_url }).run();
                }
            }
        );

        widget.open();
    };

    const setLink = () => {
        const url = window.prompt("Enter URL");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const ToolbarButton = ({ onClick, isActive = false, icon: Icon, title }: any) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded-md transition-all hover:bg-white/10 ${isActive ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    const ToolbarDivider = () => <div className="w-px h-4 bg-white/10 self-center mx-1" />;

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-white/5 bg-white/[0.02] sticky top-0 z-10 items-center">
            {/* History */}
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Undo" />
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Redo" />
            <ToolbarDivider />

            {/* Typography */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} icon={Heading1} title="Heading 1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} icon={Heading2} title="Heading 2" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} icon={Heading3} title="Heading 3" />
            <ToolbarDivider />

            {/* Formatting */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} icon={Bold} title="Bold" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} icon={Italic} title="Italic" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} icon={UnderlineIcon} title="Underline" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} icon={Strikethrough} title="Strike" />
            <ToolbarDivider />

            {/* Alignment */}
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} icon={AlignLeft} title="Align Left" />
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} icon={AlignCenter} title="Align Center" />
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} icon={AlignRight} title="Align Right" />
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} isActive={editor.isActive({ textAlign: "justify" })} icon={AlignJustify} title="Justify" />
            <ToolbarDivider />

            {/* Lists */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} icon={List} title="Bullet List" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} icon={ListOrdered} title="Ordered List" />
            <ToolbarDivider />

            {/* Media & Inserts */}
            <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} icon={LinkIcon} title="Link" />
            <ToolbarButton onClick={addImage} icon={ImageIcon} title="Image" />
            <ToolbarButton onClick={addYoutube} icon={YoutubeIcon} title="YouTube" />
            <ToolbarButton onClick={openCloudinaryWidget} icon={Video} title="Upload Video" />
            <ToolbarButton onClick={addVideo} icon={LinkIcon} title="Video Link" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} icon={Quote} title="Quote" />
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} title="Horizontal Rule" />
        </div>
    );
};

export function ProductDescriptionEditor({ content, onChange }: ProductDescriptionEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            VideoExtension,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Youtube.configure({
                controls: false,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-xl border border-white/10 my-4 max-w-full h-auto shadow-2xl",
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-400 underline",
                },
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-invert prose-sm max-w-none min-h-[300px] outline-none p-6 font-geist",
            },
        },
    });

    return (
        <div className="glass rounded-2xl border-white/5 overflow-hidden flex flex-col">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
