import React from 'react';
import { useState, useEffect } from 'react'
import { Maximize2, Minimize2 } from 'react-feather'

export const Fullscreen = ({element, accessibility, ...props}) => {
	const [fullscreen, setFullscreen] = useState(false);
	const fullscreenSupported = useState(document.fullscreenEnabled);

	useEffect(() => {
		const onFullscreenChange = () => { setFullscreen(Boolean(document.fullscreenElement)) }
		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
	}, []);

	const handleClick = () => {
		if (fullscreen) document.exitFullscreen();
		else element.current.requestFullscreen();
	}

	if (!fullscreenSupported) return null;
	return (
		<button onClick={handleClick} {...props}>
			{ !fullscreen && <Maximize2 size={16} /> }
			{ fullscreen && <Minimize2 size={16} /> }
			{ accessibility && <span>{fullscreen && 'Exit'} Fullscreen</span> }
		</button>
	)
}