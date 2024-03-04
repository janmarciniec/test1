import React from 'react';
import { useContext, useState, forwardRef } from 'react'
import { MapplicContext } from '../MapplicAdmin'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { ArrowLeft, Key } from 'react-feather'
import { Switch, Input, Manual, Dropdown } from '../AdminFields'
import { controlZones, TitleToggle, unique, filled, validClass } from './utils'

export const Settings = forwardRef(({setOpened, updateSetting, updateList}, ref) => {
	const { data, setCurrent } = useContext(MapplicContext);

	const [breakpoint, setBreakpoint] = useState(false);

	const singleBreakpoint = (breakpoint, updateProperty) => (
		<div className="option-group">
			<Manual
				label="Name"
				value={breakpoint.name}
				onChange={val => updateProperty('name', val)}
				validate={val => unique(val, data?.breakpoints, 'name') && filled(val) && validClass(val)}
				icon={<Key size={16} />}
				autoFocus
			/>
			<Input label="Below" type="number" value={breakpoint.below} min="1" onChange={val => updateProperty('below', parseFloat(val))} suffix="PX" />
			<Switch label="Portrait" value={breakpoint.portrait || false} onChange={val => updateProperty('portrait', val)} />
			<Input label="Sidebar" type="number" active={!breakpoint.portrait} value={breakpoint.sidebar} min="1" placeholder="Default" onChange={val => updateProperty('sidebar', parseFloat(val))} suffix="W" />
			<Dropdown label="Type" value={breakpoint.type} values={{list: 'List', grid: 'Grid'}} onChange={val => updateProperty('type', val)} />
			<Input label="Column" type="number" value={breakpoint.column} min="1" placeholder="1" onChange={val => updateProperty('column', parseInt(val))} suffix="NR" />
			<Input label="Container" type="number" value={breakpoint.container} min="1" placeholder="Auto" onChange={val => updateProperty('container', parseFloat(val))} suffix="H" />
			<Input label="Element" active={breakpoint.portrait} type="number" value={breakpoint.element} min="1" placeholder="Auto" onChange={val => updateProperty('element', parseFloat(val))} suffix="H" />
		</div>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group">
						<div style={{display: 'flex', alignItems: 'center', gap: 4, marginLeft: -8, marginTop: -8}}>
							<button className="mapplic-admin-button" onClick={() => setOpened(false)}><ArrowLeft size={16} /></button>
							<h4>Settings</h4>
						</div>
						<div className="mapplic-panel-options">
							<Switch label="Fullscreen" value={data.settings.fullscreen} values={controlZones} onChange={val => updateSetting('fullscreen', val)} nullValue="" />
							<Switch label="Hover tooltip" value={data.settings.hoverTooltip} onChange={checked => updateSetting('hoverTooltip', checked)} />
							<Switch label="Deeplinking" value={data.settings.deeplinking || false} onChange={checked => updateSetting('deeplinking', checked)} />
							<Input label="Padding" type="number" min="0" value={data.settings.padding} suffix="PX" onChange={(val, step) => updateSetting('padding', parseFloat(val), step)} placeholder="0" />
							<Switch label="Accessibility" value={data.settings.accessibility || false} values={{true: 'Plus', false: 'Normal'}} onChange={val => updateSetting('accessibility', val)}/>
						</div>
					</div>

					<div className="mapplic-panel-group">
						<AdminItems
							selected={breakpoint}
							setSelected={setBreakpoint}
							label="Responsivity"
							list={data.breakpoints}
							setList={val => updateList('breakpoints', val)}
							def={{name: 'all-screens', below: 8000}}
							newItem={{name: 'Breakpoint ' + Date.now()}}
							keyAttribute="name"
							nameAttribute="name"
						/>
					</div>

					<div className="mapplic-panel-group">
						<TitleToggle title="Zoom and pan" checked={data.settings.zoom} onChange={checked => updateSetting('zoom', checked)} />
						<div className="mapplic-panel-options">
							<Input
								label="Max zoom"
								type="number"
								min="1"
								active={data.settings.zoom}
								value={data.settings.maxZoom}
								onChange={(val, step) => {
									const safeVal = Math.max(parseFloat(val), 1);
									updateSetting('maxZoom', safeVal, step);
									setCurrent(prev => ({
										...prev, 
										transition: { duration: 0.4 },
										target: {...prev.pos, scale: safeVal}
									}));
								}}
							/>
							<Switch label="Reset button" active={data.settings.zoom} value={data.settings.resetButton} values={controlZones} onChange={val => updateSetting('resetButton', val)} nullValue="" />
							<Switch label="Zoom buttons" active={data.settings.zoom} value={data.settings.zoomButtons} values={controlZones} onChange={val => updateSetting('zoomButtons', val)} nullValue="" />
						</div>
					</div>

					<div className="mapplic-panel-group">
						<h4>Translations</h4>
						<div className="mapplic-panel-options">
							<Input label="Button" value={data.settings.moreText} onChange={val => updateSetting('moreText', val)} placeholder="More" />
							<Input label="Search" value={data.settings.searchText} onChange={val => updateSetting('searchText', val)} placeholder="Search" />
							<Input label="Clear all" value={data.settings.clearText} onChange={val => updateSetting('clearText', val)} placeholder="Clear all" />
						</div>
					</div>
				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ breakpoint &&
						<AdminItemSingle
							list={data.breakpoints}
							setList={val => updateList('breakpoints', val)}
							selected={breakpoint}
							setSelected={setBreakpoint}
							keyAttribute="name" 
							nameAttribute="name"
							render={singleBreakpoint}
							def={breakpoint === 'all-screens'}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});