import React from 'react';
import { useContext, useState, forwardRef } from 'react'
import { MapplicContext } from '../MapplicAdmin'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { Switch, Input, Manual, Dropdown, Coord, Upload } from '../AdminFields'
import { Key } from 'react-feather'
import { controlZones, TitleToggle, unique, filled } from './utils'

export const Layers = forwardRef(({setOpened, updateSetting, updateList}, ref) => {
	const { data } = useContext(MapplicContext);

	const [layer, setLayer] = useState(false);

	const getLayers = (empty = '(All layers)') => data?.layers?.reduce((acc, obj) => {
		acc[obj.id] = obj.name;
		return acc;
	}, {'': empty})

	const singleLayer = (layer, updateProperty) => (
		<div className="option-group">
			<Manual
				label="ID"
				value={layer.id}
				onChange={val => updateProperty('id', val)}
				validate={val => unique(val, data.layers, 'id') && filled(val)}
				icon={<Key size={16} />}
			/>
			<Input label="Name" value={layer.name} onChange={val => updateProperty('name', val)} autoFocus />
			<Upload label="File" value={layer.file} onChange={val => updateProperty('file', val)} placeholder="Map URL" button={true} />
		</div>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group">
						<AdminItems
							selected={layer}
							setSelected={setLayer}
							label="Layers"
							list={data.layers}
							setList={val => updateList('layers', val)}
							newItem={{id: 'layer' + Date.now(), name: 'New layer'}}
							keyAttribute="id"
							nameAttribute="name"
							back={() => setOpened(false)}
						/>
					</div>
					<div className="mapplic-panel-group">
						<h4>Layer options</h4>
						<div className="mapplic-panel-options">
							<Manual label="File width" type="number" value={data.settings.mapWidth} onChange={val => updateSetting('mapWidth', parseFloat(val))} placeholder="REQURED" suffix="PX" />
							<Manual label="File height" type="number" value={data.settings.mapHeight} onChange={val => updateSetting('mapHeight', parseFloat(val))} placeholder="REQURED" suffix="PX" />
							<Dropdown label="Default" values={getLayers('(First layer)')} value={data.settings.layer} onChange={val => updateSetting('layer', val)} />
							<Switch label="Selector" value={data.settings.layerSwitcher} values={controlZones} onChange={val => updateSetting('layerSwitcher', val)} nullValue="" />
						</div>
					</div>
					<div className="mapplic-panel-group">
						<TitleToggle title="Geocalibration" checked={data.settings.geo} onChange={checked => updateSetting('geo', checked)} />
						<Coord label="Extent" active={data.settings.geo || false} value={data.settings.extent} onChange={val => updateSetting('extent', val)} placeholder="min-lon, min-lat, max-lon, max-lat" />
					</div>
				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ layer &&
						<AdminItemSingle
							list={data.layers}
							setList={val => updateList('layers', val)}
							selected={layer}
							setSelected={setLayer}
							keyAttribute="id" 
							nameAttribute="name"
							render={singleLayer}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});