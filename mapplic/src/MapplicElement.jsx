import React from 'react';
import { useContext, useEffect, useRef } from 'react'
import { MapplicContext } from './MapplicContext'
import { Sidebar } from './Sidebar'
import { Container } from './Container'
import { Styles } from './Styles'
import { useSize } from './hooks/useSize'
import classNames from 'classnames'
import './mapplic.css'

const MapplicElement = (props) => {
	const { current, data, getSampledLocation, setBreakpoint } = useContext(MapplicContext);
	const element = useRef(null);
	const size = useSize(element);

	useEffect(() => {
		const closestBreakpoint = data?.breakpoints?.reduce(
			(max, curr) => size?.width <= curr.below && curr.below < max.below ? curr : max,
			{ below: 10000 }
		);
		
		setBreakpoint(closestBreakpoint);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [size, data?.breakpoints]);
	
	if (!current || !data) return <div ref={element} className="mapplic-placeholder"><div className="mapplic-loader"></div></div>
	if (current.error) return <div ref={element} className="mapplic-placeholder"><i>Something went wrong, unable to load the map.</i></div>
	return (
		<div
			{...props}
			ref={element}
			style={{height: current?.breakpoint?.element ? current?.breakpoint?.element + 'px' : 'auto'}}
			className={classNames('mapplic-element', current?.breakpoint?.name, {
				'mapplic-portrait': current?.breakpoint?.portrait,
				'mapplic-sidebar-right': data.settings.rightSidebar,
				'mapplic-sidebar-closed': current.sidebarClosed && data.settings.toggleSidebar,
				'mapplic-sidebar-toggle': data.settings.toggleSidebar
			})}
		>
			<Styles element={element} />
			<Container element={element}/>
			{ data.settings.sidebar && <Sidebar element={element} location={getSampledLocation()} /> }
		</div>
	)
}

export default MapplicElement