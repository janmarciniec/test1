import React from 'react';
import { useContext, useState, useEffect } from 'react'
import { MapplicContext } from './MapplicAdmin'
import { MapsModal } from './MapsModal'
import { Layers as LayerIcon, Folder, MapPin, Settings as SettingsIcon, Droplet, Map } from 'react-feather'
import { AnimatePresence } from 'framer-motion'
import { Layers } from './panels/Layers'
import { Locations } from './panels/Locations'
import { Settings } from './panels/Settings'
import { Directory } from './panels/Directory'
import { Appearance } from './panels/Appearance'
import classNames from 'classnames'

export const ControlPanel = ({updateHistory, action, title}) => {
	const { current, data, setData } = useContext(MapplicContext);

	const [opened, setOpened] = useState(false);
	const [mapsModal, setMapsModal] = useState(false);

	useEffect(() => {
		if (current?.location) setOpened('Locations');
	}, [current?.location]);

	const updateSetting = (setting, value = false, step = true) => {
		setData(prev => ({
			...prev,
			settings: {
				...prev.settings,
				[setting]: value
			}
		}));
		updateHistory(step);
	}

	const updateList = (key, list, step = true) => {
		setData(prev => ({
			...prev,
			[key]: list
		}));
		updateHistory(step);
	}

	return (
		<aside>
			<div className="panel main">
				<div className="panel-content">
					<div className="main-panel-header">
						{ action 
							? ( <button onClick={action}><div className="mapplic-menu-icon"><Map size={16} /></div></button> )
							: (
							<>
								<MapsModal open={mapsModal} setOpen={setMapsModal} />
								<button onClick={() => setMapsModal(true)}><div className="mapplic-menu-icon"><Map size={16} /></div></button>
							</>
							)
						}
						<span>{ title || 'Select map' }</span>
					</div>

					<div className="mapplic-panel-group" style={{padding: 12, border: 'none'}}>
						<div style={{display: 'flex', flexDirection: 'column', width: '100%', gap: 12}}>
							<MenuItem title="Layers" icon={<LayerIcon size={16} />} count={data?.layers?.length} opened={opened} setOpened={setOpened} error={data?.layers?.length < 1} />
							<MenuItem title="Locations" icon={<MapPin size={16} />} count={data?.locations?.length - 1} opened={opened} setOpened={setOpened} />
							<MenuItem title="Directory" icon={<Folder size={16} />} opened={opened} setOpened={setOpened} />
							<MenuItem title="Settings" icon={<SettingsIcon size={16} />} opened={opened} setOpened={setOpened} />
							<MenuItem title="Appearance" icon={<Droplet size={16} />} opened={opened} setOpened={setOpened} />
						</div>
					</div>
				</div>
				<div className="panel-child">
					<AnimatePresence mode="popLayout">
						{ opened === 'Layers' && <Layers key="Layers" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ opened === 'Locations' && <Locations key="Locations" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ opened === 'Directory' && <Directory Key="Directory" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ opened === 'Settings' && <Settings key="Settings" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
						{ opened === 'Appearance' && <Appearance key="Appearance" setOpened={setOpened} updateSetting={updateSetting} updateList={updateList} /> }
					</AnimatePresence>
				</div>
			</div>
		</aside>
	)
}

const MenuItem = ({title, icon, count = false, opened, setOpened, error = false}) => {
	const handleClick = () => {
		if (title === opened) setOpened(false);
		else setOpened(title);
	}

	return (
		<button className={classNames('mapplic-menu-button', {'mapplic-active': title === opened})} onClick={handleClick}>
			<div className="mapplic-menu-icon">
				{ error && <span className="mapplic-menu-warning">!</span> }
				{ icon }
			</div>
			<span>{title}</span>
			{ count > 0 && <span className="mapplic-menu-count">{count}</span>}
		</button>
	)
}