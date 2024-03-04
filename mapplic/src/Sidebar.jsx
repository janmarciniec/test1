import React from 'react';
import { useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapplicContext } from './MapplicContext'
import { SearchFilter } from './Filters'
import { Directory } from './Directory'
import { replaceVars } from './utils'
import { ArrowUpRight } from 'react-feather'

export const Sidebar = ({element, location}) => {
	const { current, data } = useContext(MapplicContext);
	const [scrollPosition, setScrollPosition] = useState(0);

	const anim = {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: 0.2 }
	}

	useEffect(() => {
		if (current?.breakpoint?.sidebar) element.current.style.setProperty('--sidebar', current.breakpoint.sidebar + 'px');
	}, [element, data.breakpoints, current?.breakpoint?.sidebar]);

	return (
		<div className="mapplic-sidebar">
			<AnimatePresence mode="wait">
				{ location.action !== 'sidebar' &&
					<>
						{ data.settings.filters &&  <SearchFilter value={current.search  || ''} anim={anim} /> }
						{ !current.sidebarClosed && <Directory scrollPosition={scrollPosition} setScrollPosition={setScrollPosition} /> }
					</>
				}
				{ location.action === 'sidebar' &&
					<SidebarPopup key="tooltip" location={location} anim={anim}/>
				}
			</AnimatePresence>
		</div>
	)
}

const SidebarPopup = ({location, anim}) => {
	const { data, closeLocation } = useContext(MapplicContext);

	return (
		<motion.div className="mapplic-sidebar-popup" key="popup" {...anim}>
			{ location.image &&
				<div className="mapplic-image">
					<img src={location.image} alt={location?.title} />
				</div>
			}
			{ location.title && <h3>{location.title}</h3> }
			{ location.about && <h4 dangerouslySetInnerHTML={{__html: replaceVars(location, 'about')}}></h4> }
			{ location.desc && <div className="mapplic-sidebar-popup-body" dangerouslySetInnerHTML={{__html: replaceVars(location)}}></div> }
			<div className="mapplic-sidebar-footer">
				<button className="mapplic-button" onClick={closeLocation}>Close</button>
				{ location.link &&
					<a href={location.link} style={{backgroundColor: location.color}} target="_blank" className="mapplic-button mapplic-button-primary" rel="noreferrer">
						{ data.settings.moreText || 'More' }
						<ArrowUpRight size={16}/>
					</a>
				}
			</div>
		</motion.div>
	)
}