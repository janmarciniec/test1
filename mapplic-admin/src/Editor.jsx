import React from 'react';
import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Code, Link2 } from 'react-feather'
import { CodePopup } from './CodePopup'

const Editor = ({value, placeholder, onChange}) => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Placeholder.configure({
				placeholder: placeholder
			}),
			Link.configure({
				autolink: true,
				openOnClick: false
			})
		],
		content: value,
		onUpdate({editor}) {
			onChange(editor.getHTML());
		}
	});

	useEffect(() => {
		const currentContent = editor?.getHTML();
		if (value !== currentContent) editor?.commands.setContent(value);
	}, [value]);

	if (!editor) return null;
	return (
		<div className="editor">
			<EditorMenu editor={editor} onChange={onChange} />
			<EditorContent editor={editor} className="editor" spellCheck={false} />
		</div>
	)
}

const EditorMenu = ({editor, onChange}) => {
	const [codePopup, setCodePopup] = useState(false);

	const setLink = useCallback(() => {
		if (editor.isActive('link')) {
			editor.chain().focus().unsetLink().run();
			return;
		}

		const url = window.prompt('URL');
	
		// cancelled
		if (url === null) return;
	
		// empty
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
	
		// update link
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
	}, [editor]);

	const onSetContent = (content) => {
		editor.commands.setContent(content);
		onChange(content);
	}

	if (!editor) return null;
	return (
		<div className="editor-menu auto-layout space-between">
			<CodePopup open={codePopup} setOpen={setCodePopup} mode="html" title="HTML Editor" content={editor.getHTML()} setContent={onSetContent} />
			<div className="auto-layout g4">
				<button
					onClick={() => editor.chain().focus().toggleBold().run()}
					disabled={
					!editor.can()
						.chain()
						.focus()
						.toggleBold()
						.run()
					}
					className={editor.isActive('bold') ? 'is-active' : ''}
				>
					<Bold size={16} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleItalic().run()}
					disabled={
					!editor.can()
						.chain()
						.focus()
						.toggleItalic()
						.run()
					}
					className={editor.isActive('italic') ? 'is-active' : ''}
				>
					<Italic size={16} />
				</button>
				<button
					onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
					className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
				>
					H4
				</button>
				<button
					onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
					className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
				>
					H5
				</button>
				<button onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}>
					<Link2 size={16} />
				</button>
			</div>
			<button onClick={() => setCodePopup(true)}>
				<Code size={16} />
			</button>
		</div>
	)
}

export default Editor