import React from 'react';
import { useContext, useRef, useEffect } from 'react'
import { MapplicContext } from './MapplicContext'
import { motion, AnimatePresence } from 'framer-motion'
import { roundTo, fileExtension } from './utils'
import SVG from 'react-inlinesvg'

export const Layers = ({list}) => {
	const { getLayer } = useContext(MapplicContext);

	const anim = {
		initial: { opacity: 0},
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: 0.2 }
	}

	return (
		<AnimatePresence mode="wait">
			{ list.map(l => (l.id === getLayer() &&
				<motion.div className="mapplic-layer" key={l.id} {...anim}>
					{ fileExtension(l.file) === 'svg'
						? <SvgLayer layer={l} />
						: <img src={l.file} alt={l.name} />
					}
				</motion.div>
			))}
		</AnimatePresence>
	)
}

const SvgLayer = ({layer, ...props}) => {
	const { current, setCurrent, data, csv, displayList, getFilterCount, setHovered, openLocation, getLocation, getSampledLocation } = useContext(MapplicContext);
	const ref = useRef(null);

	useEffect(() => {
		if (ref.current) {
			ref.current.querySelectorAll('.mapplic-active').forEach(el => el.classList.remove('mapplic-active'));
			if (current.location) ref.current.getElementById(current.location)?.classList.add('mapplic-active');
		}
	}, [current.location]);

	useEffect(() => {
		if (ref.current) {
			ref.current.querySelectorAll('.mapplic-highlight').forEach(el => el.classList.remove('mapplic-highlight'));
			if (current.hovered) ref.current.getElementById(current.hovered)?.classList.add('mapplic-highlight');
		}
	}, [current.hovered]);

	useEffect(() => {
		if (ref.current) {
			ref.current.querySelectorAll('.mapplic-filtered').forEach(el => el.classList.remove('mapplic-filtered'));
			if (current.search || getFilterCount() > 0) {
				displayList().forEach(l => {
					ref.current.getElementById(l.id)?.classList.add('mapplic-filtered');
				});
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [current.search, current.filters, csv]);

	useEffect(() => {
		if (ref.current && current.admin) {
			ref.current.querySelectorAll('.mapplic-new-location').forEach(el => el.classList.remove('mapplic-new-location'));
			if (current.newLocation) ref.current.getElementById(current.newLocation)?.classList.add('mapplic-new-location');
		}
	}, [current.admin, current.newLocation]);

	useEffect(() => {
		ref.current?.querySelectorAll('[id^=MLOC] > *').forEach(el => {
			settleLocation(el);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data.locations, data.layers, csv]);
	
	const estimatePositions = () => {
		let estimates = {}
		ref.current.querySelectorAll('[id^=MLOC] > *').forEach(el => {
			const bbox = el.getBBox();
			const title = el.getAttribute('data-name');
			
			const pos = {
				coord: [roundTo((bbox.x + bbox.width/2) / data.settings.mapWidth, 4), roundTo((bbox.y + bbox.height/2) / data.settings.mapHeight, 4)],
				zoom: roundTo(Math.min(data.settings.mapWidth / (bbox.width + 40), data.settings.mapHeight / (bbox.height + 40)), 4),
				layer: layer.id,
				...(title && {title: title})
			}
			estimates = {...estimates, [el.id]: pos};

			settleLocation(el);
		});
		setCurrent({...current, estPos: {...current.estPos, ...estimates}})
	}

	const settleLocation = (el) => {
		el.setAttribute('class', layer.style || '');
		const location = getLocation(el.id);
		if (!location) return;
		const sampled = getSampledLocation(location);
		if (sampled.disable) return;
		if (sampled.color) el.setAttribute('fill', sampled.color);
		if (sampled.style) el.classList.add(sampled.style);
		if (current.location === el.id) el.classList.add('mapplic-active');
	}

	const getId = (el) => el.closest('*[id^=MLOC] > *[id]')?.id;

	return (
		<SVG
			{...props}
			width={data.settings.mapWidth}
			height={data.settings.mapHeight}
			innerRef={ref}
			src={layer.file}
			onClick={e => {
				if (!current.dragging) openLocation(getId(e.target));
			}}
			onMouseMove={e => setHovered(getId(e.target))}
			onTouchStart={e => setHovered(getId(e.target))}
			onMouseOut={() => setHovered(false)}
			onTouchEnd={() => setHovered(false)}
			onLoad={() => estimatePositions()}
		/>
	)
}