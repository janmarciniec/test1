import { useContext, useRef } from 'react'
import { MapplicContext } from './MapplicContext'
import { motion } from 'framer-motion'
import { Plus, X } from 'react-feather'

export const TooltipNewLocation = ({location, layer}) => {
	const { setData, setCurrent } = useContext(MapplicContext);
	const ref = useRef(null);

	const style = {
		maxWidth: '320px',
		maxHeight: '200px',
		top: `calc(${location.coord[1] * 100}% + ${0 - 16}px)`,
		left: (location.coord[0] * 100) + '%'
	}

	const closeTooltip = () => {
		setCurrent(prev => ({...prev, newLocation: false}));
	}

	const capitalize = (str) => str.replace(/-/g, ' ').replace(/\b[a-z]/g, (c) => c.toUpperCase());

	const addLocation = () => {
		setData(data => {
			return {
			...data,
			locations: [ { title: location.title || capitalize(location.id), ...location}, ...data.locations ]
		}});
		setCurrent(prev => { return {...prev, newLocation: false, location: location.id}});
	}

	if (location.layer && location.layer !== layer) return;

	return (
		<motion.div className="mapplic-tooltip" style={style}
			initial={{ scale: 0.4, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			exit={{ scale: 0.4, opacity: 0 }}
			transition={{ duration: 0.2 }}
			ref={ref}
		>
			<div className="mapplic-tooltip-content">
				<button className="mapplic-tooltip-close" onClick={closeTooltip}><X size={12}/></button>
				<div className="mapplic-tooltip-title">
					<h5>Add location</h5>
				</div>
				<div className="mapplic-tooltip-footer">
					<button className="mapplic-button-small" style={{backgroundColor: '#9747FF'}} onClick={addLocation}><Plus size={16}/></button>
					<code>{location.id}</code>
				</div>
			</div>
			<StripePattern />
		</motion.div>
	)
}

const StripePattern = () => {
	return (
		<svg width="100%" height="100%" style={{position:'absolute', pointerEvents: 'none'}}>
			<defs>
				<pattern id="mapplic-stripe-pattern" patternTransform="rotate(135)" width="100%" height="2" x="0" y="0" patternUnits="userSpaceOnUse">
						<rect x="0" y="0" width="100%" height="1" fill="rgba(151, 71, 255, 0.2)"></rect>
						<rect x="0" y="1" width="100%" height="1" fill="#fafafa"></rect>
				</pattern>
			</defs>
		</svg>
	)
}