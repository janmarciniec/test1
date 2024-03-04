import React from 'react';
import { useState, useContext, useRef } from 'react'
import { MapplicContext } from './MapplicContext'
import { Tooltip } from './Tooltip'
import { Marker } from './Marker'
import { TooltipNewLocation } from './TooltipNewLocation'
import { LocationDrag } from './LocationDrag'
import { motion, AnimatePresence } from 'framer-motion'

export const Overlay = ({width, setFocusHeight, aspectRatio}) => {
	const { current, data, getLocation, getSampledLocation, displayList } = useContext(MapplicContext);
	const [offsets, setOffsets] = useState({});

	const ref = useRef(null);

	return (
		<motion.div className="mapplic-overlay" ref={ref} style={{aspectRatio: aspectRatio}} animate={{width: width}} transition={current.transition}>
			<AnimatePresence>
				{ displayList().map(l => (!l.layer || (l.layer === current.layer)) &&
					<Marker
						key={l.id}
						location={getSampledLocation(l)}
						setOffsets={setOffsets}
					/>
				)}
				
				{ current.admin && current.location && <LocationDrag location={getLocation()} layer={current.layer} dragConstraints={ref} /> }
				{ current.admin && current.newLocation && <TooltipNewLocation key="new" location={{id: current.newLocation, ...current.estPos[current.newLocation]}} layer={current.layer} /> }

				<Tooltip 
					key="hovered"
					cond={data.settings.hoverTooltip && current.hovered && current.hovered !== current.location}	
					hover={true}
					location={getSampledLocation(getLocation(current.hovered))}
					offset={offsets[current.hovered]}
					layer={current.layer}
				/>

				<Tooltip
					key="focused"
					cond={current.location} 
					location={getSampledLocation()}
					offset={offsets[current.location]}
					layer={current.layer}
					setFocusHeight={setFocusHeight}
				/>
			</AnimatePresence>
		</motion.div>
	)
}