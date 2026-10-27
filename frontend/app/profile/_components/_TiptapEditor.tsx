/**
 * Copyright (c) 2026 AURA FARMING 20 PRO MAX
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import "@/components/styles/tiptap.css";
// import SafeImage from "@/components/ui/SafeImage";

type TiptapEditorProps = {
    content: string;
    onChange: (html: string) => void;
};

type Alignment = "left" | "center" | "right";

export const TiptapEditor = ({
    content,
    onChange,
}: TiptapEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ["heading", "paragraph"],
                alignments: ["left", "center", "right"],
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "tiptap min-h-[260px] p-4 focus:outline-none text-text bg-bg",
                role: "textbox",
                "aria-label": "Nội dung mô tả công việc",
                "aria-multiline": "true",
            },
        },
    });

    if (!editor) {
        return (
            <div className="min-h-[320px] animate-pulse rounded-md bg-surface-2" />
        );
    }

    const buttonClass = (active = false) =>
        [
            "inline-flex h-8 min-w-8 shrink-0 items-center justify-center",
            "rounded px-2 text-sm transition-colors",
            "hover:bg-surface-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:pointer-events-none disabled:opacity-35",
            active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-text",
        ].join(" ");

    const divider = (
        <span
            aria-hidden="true"
            className="mx-1 h-6 w-px shrink-0 bg-border"
        />
    );

    const currentHeading = editor.isActive("heading", { level: 1 })
        ? "h1"
        : editor.isActive("heading", { level: 2 })
          ? "h2"
          : editor.isActive("heading", { level: 3 })
            ? "h3"
            : "paragraph";

    const setAlignment = (alignment: Alignment) => {
        editor.chain().focus().setTextAlign(alignment).run();
    };

    return (
        <div className="overflow-hidden rounded-md border border-border bg-bg focus-within:ring-1 focus-within:ring-primary">
            {/* Toolbar */}
            <div
                className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-2/50 p-2"
                role="toolbar"
                aria-label="Công cụ định dạng văn bản"
            >
                {/* Undo / Redo */}
                <button
                    type="button"
                    title="Hoàn tác (Ctrl+Z)"
                    aria-label="Hoàn tác"
                    className={buttonClass()}
                    disabled={!editor.can().undo()}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    <span className="text-xl leading-none">↶</span>
                </button>

                <button
                    type="button"
                    title="Làm lại (Ctrl+Y)"
                    aria-label="Làm lại"
                    className={buttonClass()}
                    disabled={!editor.can().redo()}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    <span className="text-xl leading-none">↷</span>
                </button>

                {divider}

                {/* Paragraph / Heading */}
                <select
                    aria-label="Kiểu đoạn văn"
                    value={currentHeading}
                    onMouseDown={(event) => event.stopPropagation()}
                    onChange={(event) => {
                        const value = event.target.value;
                        const chain = editor.chain().focus();

                        if (value === "paragraph") {
                            chain.setParagraph().run();
                        } else {
                            const level = Number(value.slice(1)) as 1 | 2 | 3;
                            chain.setHeading({ level }).run();
                        }
                    }}
                    className="h-8 max-w-40 rounded border border-border bg-bg px-2 text-xs text-text outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="paragraph">Văn bản thường</option>
                    <option value="h1">Tiêu đề 1</option>
                    <option value="h2">Tiêu đề 2</option>
                    <option value="h3">Tiêu đề 3</option>
                </select>

                {divider}

                {/* Bold */}
                <button
                    type="button"
                    title="In đậm (Ctrl+B)"
                    aria-label="In đậm"
                    aria-pressed={editor.isActive("bold")}
                    className={buttonClass(editor.isActive("bold"))}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <strong>B</strong>
                </button>

                {/* Italic */}
                <button
                    type="button"
                    title="In nghiêng (Ctrl+I)"
                    aria-label="In nghiêng"
                    aria-pressed={editor.isActive("italic")}
                    className={buttonClass(editor.isActive("italic"))}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <em>I</em>
                </button>

                {/* Strike */}
                <button
                    type="button"
                    title="Gạch ngang"
                    aria-label="Gạch ngang"
                    aria-pressed={editor.isActive("strike")}
                    className={buttonClass(editor.isActive("strike"))}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <s>S</s>
                </button>

                {/* Clear formatting */}
                <button
                    type="button"
                    title="Xóa định dạng"
                    aria-label="Xóa định dạng"
                    className={buttonClass()}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        editor
                            .chain()
                            .focus()
                            .unsetAllMarks()
                            .clearNodes()
                            .run();
                    }}
                >
                    <span className="font-semibold">T<span className="text-red-500">×</span></span>
                </button>

                {divider}

                {/* Text alignment */}
                {(
                    [
                        ["left", "⇤", "Căn trái"],
                        ["center", "↔", "Căn giữa"],
                        ["right", "⇥", "Căn phải"],
                    ] as const
                ).map(([alignment, symbol, label]) => (
                    <button
                        key={alignment}
                        type="button"
                        title={label}
                        aria-label={label}
                        aria-pressed={editor.isActive({
                            textAlign: alignment,
                        })}
                        className={buttonClass(
                            editor.isActive({ textAlign: alignment })
                        )}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setAlignment(alignment)}
                    >
                        <span className="text-base">{symbol}</span>
                    </button>
                ))}

                {divider}

                {/* Bullet list */}
                <button
                    type="button"
                    title="Danh sách dấu đầu dòng"
                    aria-label="Danh sách dấu đầu dòng"
                    aria-pressed={editor.isActive("bulletList")}
                    className={buttonClass(editor.isActive("bulletList"))}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        editor.chain().focus().toggleBulletList().run();
                    }}
                >
                    <span className="font-bold">•</span>
                    <span className="ml-1">☰</span>
                </button>

                {/* Ordered list */}
                <button
                    type="button"
                    title="Danh sách đánh số"
                    aria-label="Danh sách đánh số"
                    aria-pressed={editor.isActive("orderedList")}
                    className={buttonClass(editor.isActive("orderedList"))}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        editor.chain().focus().toggleOrderedList().run();
                    }}
                >
                    <span className="font-semibold">1.</span>
                    <span className="ml-1">☰</span>
                </button>

                {/* Blockquote */}
                <button
                    type="button"
                    title="Trích dẫn"
                    aria-label="Trích dẫn"
                    aria-pressed={editor.isActive("blockquote")}
                    className={buttonClass(editor.isActive("blockquote"))}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        editor.chain().focus().toggleBlockquote().run();
                    }}
                >
                    <span className="text-lg">❝</span>
                </button>

                {/* Horizontal rule */}
                <button
                    type="button"
                    title="Chèn đường phân cách"
                    aria-label="Chèn đường phân cách"
                    className={buttonClass()}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        editor.chain().focus().setHorizontalRule().run();
                    }}
                >
                    <span className="text-lg">―</span>
                </button>
            </div>

            {/* Editable area */}
            <EditorContent editor={editor} />
        </div>
    );
};
