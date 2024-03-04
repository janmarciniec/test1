import React from 'react';
import { useEffect, useRef } from 'react'
import AceEditor from 'react-ace'

ace.config.set('basePath', '/codeeditor');

const CodeEditor = (props) => {
	const editorRef = useRef(null);

	// search
	useEffect(() => {
		const handleKeyPress = (event) => {
			if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
				event.preventDefault();
				editorRef.current.editor.execCommand('find');
			}
		};
	
		window.addEventListener('keydown', handleKeyPress);
	
		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	return <AceEditor ref={editorRef} {...props} setOptions={{ useWorker: false }} editorProps={{ $blockScrolling: true }} />
}

export default CodeEditor