import React from 'react';
import { useContext, useEffect, useRef } from 'react'
import { MapplicContext } from './MapplicContext'
import { motion } from 'framer-motion'
import { ArrowUpRight, X, Phone } from 'react-feather'
import { replaceVars } from './utils'
import classNames from 'classnames'

export const Tooltip = ({cond = true, location, hover = false, offset = 0, layer, setFocusHeight}) => {
	const { data, closeLocation } = useContext(MapplicContext);
	const ref = useRef(null);

	useEffect(() => {
		if (cond && setFocusHeight) setFocusHeight(ref.current?.offsetHeight - offset);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.id]);
	
	if (!cond) return null;
	if (!location.id || !location.coord || location.disable || (location.layer && location.layer !== layer)) return;

	const style = {
		maxWidth: '320px',
		maxHeight: '240px',
		top: `calc(${location.coord[1] * 100}% + ${offset - 16}px)`,
		left: (location.coord[0] * 100) + '%'
	}

	const tooltipAction = () => !location.action || location.action === 'tooltip';

	return (
		<motion.div className={classNames('mapplic-tooltip', {'mapplic-tooltip-hover' : hover})} style={style}
			initial={{ scale: 0.4, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			exit={{ scale: 0.4, opacity: 0 }}
			transition={{ duration: 0.2 }}
			onPointerDownCapture={e => e.stopPropagation()}
			ref={ref}
			onWheel={e => e.stopPropagation()}
		>
			{ location.image && !hover && tooltipAction() && (
				<div className="mapplic-tooltip-image">
					<img src={location.image} alt={location.title} />
				</div>
			)}
			<div className="mapplic-tooltip-content">
				{ !hover && <button className="mapplic-tooltip-close" onClick={closeLocation}><X size={12}/></button> }
				<div className="mapplic-tooltip-title">
					<h4>{location.title}</h4>
					{ !hover && <h5 dangerouslySetInnerHTML={{__html: replaceVars(location, 'about')}}></h5> }
				</div>
				{ location.desc && !hover && tooltipAction() && <div className="mapplic-tooltip-desc" dangerouslySetInnerHTML={{__html: replaceVars(location, 'desc')}}></div> }
				{ location.link && !hover && tooltipAction() && (
					<div className="mapplic-tooltip-footer">
						{ location.link &&
							<a href={location.link} style={{backgroundColor: location.color}} target="_blank" className="mapplic-button mapplic-button-primary" rel="noreferrer">
								{ data.settings.moreText || 'More' }
								<ArrowUpRight size={16}/>
							</a>
						}
						{ location.phone && <a className="mapplic-button mapplic-button-icon" href={`tel:${location.phone}`}><Phone size={16} /></a> }
					</div>
				)}
			</div>
		</motion.div>
	)
}