import React from 'react';
import { useContext, useState, useEffect } from 'react'
import { MapplicContext } from './MapplicContext'
import { motion, useMotionValue } from 'framer-motion'

export function LocationDrag({location, layer, dragConstraints}) {
	const { current, data, setData } = useContext(MapplicContext);
	const [initCoord, setInitCoord] = useState(location?.coord);
	const [dragging, setDragging] = useState(false);
	
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	
	useEffect(() => {
		setInitCoord(location?.coord);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [current.location]);
	
	if (!initCoord || (location?.layer && location?.layer !== layer)) return;
	
	const updateLocationProperty = (id, property, value) => {
		setData({
			...data,
			locations: data.locations.map(l => (l.id === id) ? { ...l, [property]: value } : l)
		})
	}

	const applyDrag = (offset) => {
		const newCoord = [
			Math.round((initCoord[0] + offset.x / dragConstraints.current.offsetWidth) * 10000)/10000,
			Math.round((initCoord[1] + offset.y / dragConstraints.current.offsetHeight) * 10000)/10000
		]
		updateLocationProperty(location?.id, 'coord', newCoord);
		setInitCoord(newCoord);
	}

	const resetDrag = () => {
		x.set(0);
		y.set(0);
	}

	return (
		<motion.div
			className="mapplic-location-drag"
			style={{
				x,
				y,
				top: (initCoord[1] * 100) + '%',
				left: (initCoord[0] * 100) + '%',
				cursor: dragging ? 'grabbing' : 'grab'
			}}
			
			drag 
			onTapStart={() => setDragging(true)}
			onDragEnd={(e, i) => {
				setDragging(false);
				applyDrag(i.offset);
			}}
			onTap={resetDrag}
			onTapCancel={resetDrag}
			dragConstraints={dragConstraints}
			dragMomentum={false}
		></motion.div>
	)
}