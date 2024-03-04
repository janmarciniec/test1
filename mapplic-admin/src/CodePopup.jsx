import React from 'react';
import { lazy, Suspense, useEffect, useState } from 'react'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import { X } from 'react-feather'
import beautify from 'js-beautify'

const CodeEditor = lazy(() => import('./CodeEditor'))

export const CodePopup = ({open, setOpen, mode, title = 'Code Editor', content, setContent}) => {
	const [value, setValue] = useState('');
	const [modified, setModified] = useState(false);

	useEffect(() => {
		const indent = (value) => {
			if (mode === 'json') return JSON.stringify(value, null, '\t');
			if (mode === 'html') return beautify.html(value, { indent_size: 4 });
		}

		if (open === true) setValue(indent(content));
	}, [open]);

	const handleChange = (val) => {
		setValue(val);
		setModified(true);
	}

	const handleUpdate = () => {
		try {
			if (mode === 'json') setContent(JSON.parse(value));
			else setContent(value);
			setOpen(false);
			setModified(false);
		}
		catch (error) {
			alert('The JSON is invalid, therefore it cannot be saved.');
		}
	}

	return (
		<Modal classNames={{modal: 'mapplic-admin-ui'}} open={open} onClose={() => setOpen(false)} closeIcon={<X size={16}/>} center>
			<h3>{title}</h3>
			<div className="field" style={{backgroundColor: '#E8E8E8'}}>
				<Suspense fallback={<p>loading</p>}>
					<CodeEditor
						value={value}
						mode={mode}
						theme="xcode"
						fontSize={13}
						name="code-editor"
						width="800px"
						height="480px"
						wrapEnabled={true}
						wrapBehaviours={true}
						wrap="free"
						showGutter={true}
						showPrintMargin={false}
						onChange={handleChange}
					/>
				</Suspense>
			</div>
			<div className="auto-layout align-center space-between">
				<small>Code editing zone for expert users only.</small>
				<div className="auto-layout">
					<button className="mapplic-button" onClick={() => { setOpen(false) }}>Cancel</button>
					<button className="mapplic-button mapplic-button-primary" disabled={!modified} onClick={handleUpdate}>Update</button>
				</div>
			</div>
		</Modal>
	)
}