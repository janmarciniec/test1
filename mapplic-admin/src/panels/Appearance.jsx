import React from 'react';
import { lazy, Suspense, useContext, useState, forwardRef } from 'react'
import { MapplicContext } from '../MapplicAdmin'
import { AnimatePresence } from 'framer-motion'
import { Panel } from '../Panel'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { ArrowLeft, Key } from 'react-feather'
import { Switch, Input, Manual, Color } from '../AdminFields'
import { Tab, unique, filled, validClass } from './utils'

const CodeEditor = lazy(() => import('../CodeEditor'))

export const Appearance = forwardRef(({setOpened, updateSetting, updateList}, ref) => {
	const { data } = useContext(MapplicContext);

	const [style, setStyle] = useState(false);
	const [styleTab, setStyleTab] = useState('base');

	const singleStyle = (style, updateProperty) => (
		<>
			<Switch value={styleTab} values={{base: 'Base', hover: 'Hover', active: 'Active'}} onChange={setStyleTab} />
			<Tab active={styleTab === 'base'} className="option-group">
				<Manual
					label="Class"
					value={style.class}
					onChange={val => updateProperty('class', val)}
					validate={val => unique(val, data.styles, 'class') && filled(val) && validClass(val)}
					icon={<Key size={16} />}
					autoFocus
				/>
				<Color label="Fill" value={style['base-color']} onChange={val => updateProperty('base-color', val)} placeholder="Inherit" />
				<Color label="Stroke" value={style['base-stroke']} onChange={val => updateProperty('base-stroke', val)} placeholder="Inherit" />
				<Input label="Stroke width" type="number" min="0" value={style['stroke-width']} onChange={val => updateProperty('stroke-width', parseFloat(val))} placeholder="Inherit" />
				<Color label="Text color" value={style['text-color']} onChange={val => updateProperty('text-color', val)} placeholder="Default" />
				<Switch label="Marker" value={style.marker} onChange={val => updateProperty('marker', val)} />
				<Switch label="SVG" value={style.svg} onChange={val => updateProperty('svg', val)} />
			</Tab>
			<Tab active={styleTab === 'hover'} className="option-group">
				<Color label="Fill" value={style['hover-color']} onChange={val => updateProperty('hover-color', val)} placeholder="Inherit" />
				<Color label="Stroke" value={style['hover-stroke']} onChange={val => updateProperty('hover-stroke', val)} placeholder="Inherit" />
			</Tab>
			<Tab active={styleTab === 'active'} className="option-group">
				<Color label="Fill" value={style['active-color']} onChange={val => updateProperty('active-color', val)} placeholder="Inherit" />
				<Color label="Stroke" value={style['active-stroke']} onChange={val => updateProperty('active-stroke', val)} placeholder="Inherit" />
			</Tab>
		</>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group">
						<div style={{display: 'flex', alignItems: 'center', gap: 4, marginLeft: -8, marginTop: -8}}>
							<button className="mapplic-admin-button" onClick={() => setOpened(false)}><ArrowLeft size={16} /></button>
							<h4>Appearance</h4>
						</div>
						<Color label="Primary color" value={data.settings.primaryColor} onChange={color => updateSetting('primaryColor', color)} placeholder="Default" />
						<label className="field-label above">
							<span>Custom CSS</span>
							<div className="field" style={{backgroundColor: '#fff'}}>
								<Suspense fallback={<p>loading</p>}>
									<CodeEditor
										value={data.settings.css}
										mode="css"
										theme="xcode"
										name="custom-css"
										width="100%"
										height="160px"
										showGutter={false}
										onChange={val => updateSetting('css', val)}
									/>
								</Suspense>
							</div>
						</label>
					</div>
					<div className="mapplic-panel-group">
						<AdminItems
							selected={style}
							setSelected={setStyle}
							label="Location styles"
							list={data.styles}
							setList={val => updateList('styles', val)}
							newItem={{class: 'class' + Date.now(), svg: true, marker: true}}
							keyAttribute="class"
							nameAttribute="class"
						/>
					</div>
				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ style && 
						<AdminItemSingle
							list={data.styles}
							setList={val => updateList('styles', val)}
							selected={style}
							setSelected={setStyle}
							keyAttribute="class" 
							nameAttribute="class"
							render={singleStyle}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});