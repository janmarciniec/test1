import React from 'react';
import { useContext, useEffect, useRef, useState } from 'react'
import { MapplicContext } from './MapplicContext'
import { motion } from 'framer-motion'
import { Controls } from './Controls'
import { PanZoom } from './PanZoom'
import { Overlay } from './Overlay'
import { Layers } from './Layers'
import { useSize } from './hooks/useSize'

export function Container({element}) {
	const { current, data } = useContext(MapplicContext);
	const [aspectRatio, setAspectRatio] = useState(1.6);

	const container = useRef(null);
	const containerSize = useSize(container);
	
	useEffect(() => {
		if (data.settings?.mapWidth && data.settings?.mapHeight) setAspectRatio(data.settings.mapWidth / data.settings.mapHeight);
		else setAspectRatio(1.6);
	}, [data.settings.mapHeight, data.settings.mapWidth])

	useEffect(() => {
		if (data.settings.padding) element.current.style.setProperty('--container-padding', data.settings.padding + 'px');
	}, [element, data.settings.padding]);

	useEffect(() => {
		if (current?.breakpoint?.portrait && container.current.getBoundingClientRect().top < 0) container.current.scrollIntoView({ behavior: 'smooth' });
	}, [current?.breakpoint?.portrait, current.location])

	const getSidebarWidth = () => {
		if (current?.breakpoint?.sidebar) return current?.breakpoint?.sidebar + 'px';
		if (element.current) return getComputedStyle(element.current).getPropertyValue('--sidebar');
		return 0;
	}
	
	return (
		<motion.div
			className="mapplic-container"
			ref={container}
			initial={false}
			transition={{ duration: 0.4 }}
			animate={{
				marginLeft: !current.sidebarClosed && !data.settings.rightSidebar && data.settings.sidebar ? getSidebarWidth() : 0,
				marginRight: !current.sidebarClosed && data.settings.rightSidebar && data.settings.sidebar ? getSidebarWidth() : 0
			}}
			style={{height: current?.breakpoint?.container ? current?.breakpoint?.container + 'px' : 'auto'}}
		>
			{ data.settings.zoom ? <PanZoom container={container} containerSize={containerSize} aspectRatio={aspectRatio} /> : (
				<>
					<motion.div className="mapplic-layers">
						<Layers list={data.layers} />
						<Overlay aspectRatio={aspectRatio} />
					</motion.div>
				</>
			)}
			
			<Controls element={element} />
		</motion.div>
	)
}