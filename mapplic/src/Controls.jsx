import React from 'react';
import { useContext } from 'react'
import { MapplicContext } from './MapplicContext'
import { Fullscreen } from './Fullscreen'
import { ArrowLeft, Maximize, Plus, Minus } from 'react-feather'

export const Controls = (props) => {
	const { current, data, toggleSidebar } = useContext(MapplicContext);

	return (
		<div className="mapplic-controls">
			{ data.settings.sidebar && data.settings.toggleSidebar && (!current.sidebarClosed || !data.settings.filters) &&
				<button className="mapplic-sidebar-close" onClick={toggleSidebar}><ArrowLeft size={16}/></button>
			}

			<ControlZone position="top-left" {...props} style={ current.sidebarClosed && !data.settings.rightSidebar && !current?.breakpoint?.portrait ? {top: '60px'} : {} }/>
			<ControlZone position="top-right" {...props} style={ current.sidebarClosed && data.settings.rightSidebar && !current?.breakpoint?.portrait ? {top: '60px'} : {} }/>
			<ControlZone position="bottom-left" {...props} style={ current.sidebarClosed && current?.breakpoint?.portrait ? {bottom: '60px'} : {} }/>
			<ControlZone position="bottom-right" {...props} />
		</div>
	)
}

const ControlZone = ({position, element, style}) => {
	const { data } = useContext(MapplicContext);

	return (
		<div className={`mapplic-control-zone mapplic-${position}`} style={style}>
			{ data.settings.layerSwitcher === position && data.layers.length > 1 && <LayerSwitcher list={data.layers} /> }
			{ data.settings.zoomButtons === position && data.settings.zoom && <ZoomButtons /> }
			{ data.settings.resetButton === position && data.settings.zoom && <ResetButton accessibility={data.settings.accessibility} /> }
			{ data.settings.fullscreen === position && <Fullscreen element={element} className="mapplic-control-button" accessibility={data.settings.accessibility} />}
		</div>
	)
}

const ResetButton = ({accessibility}) => {
	const { current, setCurrent, closeLocation } = useContext(MapplicContext);

	const resetZoom = () => {
		setCurrent(prev => ({
			...prev,
			transition: {duration: 0.4},
			target: {
				...prev.target,
				scale: 1
			}
		}));
		closeLocation();
	}

	if (current.pos.scale <= 1 && !current.location) return;
	return (
		<button className="mapplic-control-button" onClick={resetZoom}>
			{ accessibility && <span>Reset</span> }
			<Maximize size={16} />
		</button>
	)
}

const ZoomButtons = () => {
	const { current, setCurrent, data } = useContext(MapplicContext);

	const setZoom = (scale) => {
		setCurrent(prev => ({
			...prev,
			transition: {duration: 0.4},
			target: {
				...prev.pos,
				scale: scale
			}
		}));
	}

	return (
		<div className="mapplic-control-group">
			<button className="mapplic-control-button" disabled={current.pos.scale  >= data.settings.maxZoom} onClick={() => setZoom(current.pos.scale  * 1.6)}><Plus size={16} /></button>
			<button className="mapplic-control-button" disabled={current.pos.scale  <= 1} onClick={() => setZoom(current.pos.scale  / 1.6)}><Minus size={16} /></button>
		</div>
	)
}

const LayerSwitcher = ({list}) => {
	const { getLayer, switchLayer } = useContext(MapplicContext);

	return (
		<div className="mapplic-layer-switcher">
			{ list.map(l =>
				<button key={l.id} className={`${l.id === getLayer() ? 'mapplic-active' : ''}`} onClick={() => switchLayer(l.id)}>
					{l.name}
				</button>
			)}
		</div>
	)
}