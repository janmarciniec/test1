import React from 'react';
import { useContext, useState, useEffect, useMemo, useRef } from 'react'
import { MapplicContext } from './MapplicContext'
import { motion, useMotionValue } from 'framer-motion'
import { Overlay } from './Overlay'
import { Layers } from './Layers'
import { roundTo } from './utils'

export const PanZoom = ({container, containerSize, aspectRatio}) => {
	const { current, data, setPos, setTransition, setDragging } = useContext(MapplicContext);

	const ref = useRef();
	
	const [abs, setAbs] = useState({ scale: 1, x: 0, y: 0}); // absolute position
	const [focusHeight, setFocusHeight] = useState(0); //height of tooltip and marker for centering

	//const [pinch, setPinch] = useState(false);

	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const scale = useMotionValue(0);

	useEffect(() => { // container resized
		setRelPosition(current.pos.scale, current.pos.x, current.pos.y, {duration: 0});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [containerSize]);
	
	useEffect(() => { // location focused
		const focusX = 0.5 + focusHeight/containerSize?.height/2;
		setRelPosition(current.target.scale, current.target.x, current.target.y, current.transition, focusX ? [0.5, focusX] : undefined);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [current.target, focusHeight]);

	const fitScale = useMemo(() => ( // absolute fit scale
		roundTo(Math.min(containerSize?.height/data.settings.mapHeight, containerSize?.width/data.settings.mapWidth), 4)
	), [containerSize?.height, containerSize?.width, data.settings.mapHeight, data.settings.mapWidth]);

	const constrainScale = (scale = current.pos.scale) => roundTo(Math.min(Math.max(scale, 1), data.settings.maxZoom), 4); // constrain relative scale
	const constrains = (s = abs.scale) => {
		const paddingX = Math.max(s === fitScale ? 0 : containerSize?.width, (containerSize?.width - data.settings.mapWidth * s))/2;
		const paddingY = Math.max(s === fitScale ? 0 : containerSize?.height, (containerSize?.height - data.settings.mapHeight * s))/2;

		return {
			top: Math.round(containerSize?.height - data.settings.mapHeight * s - paddingY),
			bottom: Math.round(paddingY),
			left: Math.round(containerSize?.width - data.settings.mapWidth * s - paddingX),
			right: Math.round(paddingX)
		}
	}

	// convert absolute to relative
	const absToRel = (x = abs.x, y = abs.y, scale = abs.scale, focus = [0.5, 0.5]) => ({
		scale: scale / fitScale,
		x: (containerSize?.width * focus[0] - x) / (data.settings.mapWidth * scale),
		y: (containerSize?.height * focus[1] - y) / (data.settings.mapHeight * scale)
	})

	// convert relative to absolute
	const relToAbs = (x = current.pos.x, y = current.pos.y, scale = current.pos.scale, focus = [0.5, 0.5]) => ({
		scale: scale * fitScale,
		x: Math.round(containerSize?.width * focus[0] - x * data.settings.mapWidth * scale * fitScale),
		y: Math.round(containerSize?.height * focus[1] - y * data.settings.mapHeight * scale * fitScale)
	})

	// set relative position
	const setRelPosition = (newScale = current.pos.scale, newX = current.pos.x, newY = current.pos.y, t = {duration: 0.4}, focus = [0.5, 0.5]) => {
		const a = relToAbs(newX, newY, constrainScale(newScale), focus);
		const c = constrains(a.scale);

		const newAbs = {
			scale: a.scale,
			x: Math.max(Math.min(a.x, c.right), c.left),
			y: Math.max(Math.min(a.y, c.bottom), c.top)
		}

		setTransition(t);
		setAbs(newAbs);
		setPos(absToRel(newAbs.x, newAbs.y, newAbs.scale, focus));
	}

	const mouseWheel = (e) => {
		const containerRect = container.current.getBoundingClientRect();
		const magnitude = 1.6;
		const newZoom = constrainScale((e.deltaY < 0) ? current.pos.scale * magnitude : current.pos.scale / magnitude);
		if (newZoom > data.settings.maxZoom) return;
		const focus = [
			(e.clientX - containerRect.x) / containerRect.width,
			(e.clientY - containerRect.y) / containerRect.height
		]
		const rel = absToRel(abs.x, abs.y, abs.scale, focus);
		setRelPosition(newZoom, rel.x, rel.y, {duration: 0.4}, focus);
	}

	useEffect(() => {
		const element = ref.current;
	
		const handleWheel = (e) => {
			e.preventDefault();
		}
	
		if (element) {
		  element.addEventListener('wheel', handleWheel, { passive: false });
	
		  return () => {
			element.removeEventListener("wheel", handleWheel);
		  };
		}
	  }, [ref]);

	const doubleClick = (e) => {
		if (e.detail === 2) {
			const containerRect = container.current.getBoundingClientRect();
			const focus = [
				(e.clientX - containerRect.x)/containerRect.width,
				(e.clientY - containerRect.y)/containerRect.height
			]
			const rel = absToRel(abs.x, abs.y, abs.scale, focus);
			setRelPosition(constrainScale(current.pos.scale * 2), rel.x, rel.y, {duration: 0.4}, focus);
		}
	}

	const updatePosState = () => {
		const newAbs = {
			...abs,
			x: x.get(),
			y: y.get()
		}
		setAbs(newAbs);
		setPos(absToRel(newAbs.x, newAbs.y, newAbs.scale));	
	}
	
	/*
	const pinchPoint = (e) => {
		const c = container.current.getBoundingClientRect();
		return {
			x: c.width - Math.abs(e.touches[0].clientX + e.touches[1].clientX)/2,
			y: c.height - Math.abs(e.touches[0].clientY + e.touches[1].clientY)/2,
			dist: Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2), Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2))
		}
	}

	const handleTouchStart = (e) => {
		if (e.touches.length > 1 && !pinch) {
			const p = pinchPoint(e);
			setPinch({
				x: abs.x,
				y: abs.y,
				dist: p.dist,
				scale: abs.scale
			});
		}
	}

	const handleTouchMove = (e) => {
		if (e.touches.length > 1) {
			const p = pinchPoint(e);

			const rel = absToRel(pinch.x, pinch.y, (p.dist/pinch.dist)*pinch.scale);
			setRelPosition(rel.scale, rel.x, rel.y, {duration: 0.4});
		} 
	}

	const handleTouchEnd = (e) => {
		if (e.touches.length < 2) setPinch(false);
	}*/


	return (
		<motion.div className="mapplic-panzoom"
			drag/*={!pinch}*/
			onWheel={mouseWheel}
			onClick={doubleClick}
			ref={ref}

			// onTouchStart={handleTouchStart}
			// onTouchMove={handleTouchMove}
			// onTouchEnd={handleTouchEnd}

			style={{x, y, cursor: current.dragging ? 'grabbing' : 'grab'}}
			animate={{ x: abs.x, y: abs.y }}
			transition={current.transition}
			dragTransition={{ bounceStiffness: 100, bounceDamping: 20, timeConstant: 100, power: 0.2}}
			dragElastic={0.3}
			dragConstraints={constrains()}
			onDragStart={() => setDragging(true)}
			onDragEnd={() => setTimeout(() => setDragging(false), 50)}
			onDragTransitionEnd={updatePosState}
		>
			<motion.div className="mapplic-layers" style={{scale, aspectRatio: aspectRatio}} animate={{scale: abs.scale}} transition={current.transition}>
				<Layers list={data.layers} />
			</motion.div>
			<Overlay width={data.settings.mapWidth * abs.scale} setFocusHeight={setFocusHeight} aspectRatio={aspectRatio} />
		</motion.div>
	)
}
