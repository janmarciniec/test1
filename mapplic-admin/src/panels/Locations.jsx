import React from 'react';
import { lazy, Suspense, useContext, useState, forwardRef } from 'react'
import { MapplicContext } from '../MapplicAdmin'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { Key, Crosshair } from 'react-feather'
import { Switch, Input, Manual, Dropdown, Upload, Color, Coord } from '../AdminFields'
import { TitleToggle, Tab, Conditional, locationTypes, locationActions, unique, filled } from './utils'
import Papa from 'papaparse'

const Editor = lazy(() => import('../Editor'));

const attributes = ['id', 'title', 'about', 'thumb', 'image', 'link', 'phone', 'desc', 'color', 'style', 'label', 'scale', 'type', 'sample', 'layer', 'group', 'coord', 'latlon', 'zoom', 'action', 'hide', 'disable'];

export const Locations = forwardRef(({setOpened, updateSetting, updateList}, ref) => {
	const { current, data, setData, csv, setCsv } = useContext(MapplicContext);

	const [location, setLocation] = useState(false);
	const [locationTab, setLocationTab] = useState('content');

	const importCsv = () => {
		setData(prev => {
			let ids = new Set(prev.locations.map(l => l.id));
			return {
				...prev,
				settings: {
					...prev.settings,
					csvEnabled: false,
					csv: ''
				},
				locations: [
					...prev.locations,
					...csv.filter(l => !ids.has(l.id))
				]
			}
		});
		setCsv([]);
	}

	const exportCsv = () => {
		let csv = Papa.unparse(data.locations, { columns: getAllKeys()});
		window.open('data:text/csv;charset=utf-8,' + escape(csv));
	}

	const getStyles = (empty = '(Default)') => {
		const def = {'': empty};
		if (!data?.styles) return def;
		return data.styles.reduce((acc, obj) => {
			acc[obj.class] = obj.class;
			return acc;
		}, def);
	}

	const getGroups = () => data?.groups?.reduce((acc, obj) => {
		acc[obj.name] = obj.name;
		return acc;
	}, {});

	const getSamples = (initial = {}) => data?.locations?.reduce((acc, l) => {
		if (l.sample === 'true') acc[l.id] = l.title;
		return acc;
	}, initial);

	const getLayers = (empty = '(All layers)') => data?.layers?.reduce((acc, obj) => {
		acc[obj.id] = obj.name;
		return acc;
	}, {'': empty});

	const getAllKeys = () => Array.from(new Set(data?.locations.flatMap(Object.keys))).filter(key => !['chosen', 'selected'].includes(key));

	const customAttributes = () => getAllKeys().filter(key => !attributes.includes(key));

	const singleLocation = (location, updateProperty, sampled) => (
		<>
			<Switch value={locationTab} values={{content: 'Content', visual: 'Visual', function: 'Function'}} onChange={setLocationTab} />
			<Tab active={locationTab === 'content'} className="option-group">
				<Manual
					label="ID"
					value={location.id}
					onChange={val => updateProperty('id', val)}
					validate={val => unique(val, data.locations, 'id') && filled(val)}
					icon={<Key size={16} />}
				/>
				<Input label="Title" value={location.title} onChange={val => updateProperty('title', val)} autoFocus />
				<Input label="About" value={location.about} onChange={val => updateProperty('about', val)} placeholder={sampled?.about || 'Short description'} />
				<Upload label="Thumbnail" value={location.thumb} onChange={val => updateProperty('thumb', val)} placeholder="URL or text" button={true} />
				<Upload label="Image" value={location.image} onChange={val => updateProperty('image', val)} placeholder="Image URL" button={true} />
				<Input label="Link" value={location.link} onChange={val => updateProperty('link', val)} placeholder="https://" />
				<Input label="Phone" value={location.phone} onChange={val => updateProperty('phone', val)} placeholder="Telephone number" />
				<Suspense fallback={<p>Loading...</p>}>
					<Editor value={location.desc} onChange={val => updateProperty('desc', val)} placeholder={sampled?.desc?.replace(/<[^>]+>/g, '') || 'Description text'} />
				</Suspense>
				{ customAttributes().map(a => <Input key={a} label={a} value={location[a]} onChange={val => updateProperty(a, val)} /> )}
			</Tab>
			<Tab active={locationTab === 'visual'} className="option-group">
				<Color label="Color" value={location.color} onChange={val => updateProperty('color', val)} placeholder="Default" />
				<Dropdown label="Style" value={location.style} values={getStyles()} onChange={val => updateProperty('style', val)} />
				<Input label="Label" value={location.label} onChange={val => updateProperty('label', val)} placeholder="Marker text" />
				<Input label="Scale" type="number" min="0" step="0.1" value={location.scale} onChange={val => updateProperty('scale', parseFloat(val))} placeholder="1" />
				<Dropdown label="Type" value={location.type} values={locationTypes} onChange={val => updateProperty('type', val)} />
			</Tab>
			<Tab active={locationTab === 'function'} className="option-group">
				<Dropdown label="Sample" value={location.sample} values={getSamples({'': '(None)', true: 'Use as sample'})} onChange={val => updateProperty('sample', val)} />
				<Dropdown label="Layer" value={location.layer} values={getLayers()} onChange={val => updateProperty('layer', val)} />
				<Dropdown label="Group" active={data?.groups || data.groups?.length > 0} value={location.group || []} multiple values={getGroups()} onChange={val => updateProperty('group', val)} />
				<Coord label="Coord" value={location.coord} onChange={val => updateProperty('coord', val)} icon={<Crosshair size={16} />} />
				<Coord label="Lat, lon" active={data.settings.geo} value={location.latlon} onChange={val => updateProperty('latlon', val)} icon={<Crosshair size={16} />} />
				<Input label="Zoom" type="number" min="0" step="0.1" value={location.zoom} onChange={val => updateProperty('zoom', parseFloat(val))} placeholder="Auto" />
				<Dropdown label="Action" value={location.action}  values={locationActions} onChange={val => updateProperty('action', val)} />
				<Switch label="Directory" value={location.hide || false} values={{false: 'Show', true: 'Hide'}} onChange={val => updateProperty('hide', val)} />
				<Switch label="Disabled" value={location.disable || false} values={{true: 'True', false: 'False'}} onChange={val => updateProperty('disable', val)} />
			</Tab>
		</>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group" style={{gap: 24}}>
						<AdminItems
							selected={location}
							setSelected={setLocation}
							label="Locations"
							list={data.locations}
							setList={val => updateList('locations', val)}
							preselected={current.location}
							def={{id:'def', title: 'Default values', group:[], sample: true}}
							newItem={{id: 'l' + Date.now(), title: 'New location', desc: 'Add location description here.', coord: [0.5,0.5], layer: current.layer || false}}
							keyAttribute="id"
							nameAttribute="title"
							back={() => setOpened(false)}
							samples={true}
						/>

						<EstimatedCoordinates count={data.locations.filter(l => !l.coord && l.id in current.estPos).length} />
						<LocationRecognizer />
					</div>
					<div className="mapplic-panel-group">
						<TitleToggle title="External CSV" checked={data.settings.csvEnabled} onChange={checked => updateSetting('csvEnabled', checked)} />
						<Conditional active={data.settings.csvEnabled}>
							<Upload label="CSV source" value={data.settings.csv} placeholder="Path to CSV" onChange={(val) => updateSetting('csv', val)} button="true" />
							<div className="mapplic-panel-inline">
								<button className="mapplic-button alt" disabled={!data.settings.csv} onClick={importCsv}>Import CSV</button>
								<button className="mapplic-button alt" disabled={data?.locations?.length < 1} onClick={exportCsv}>Export CSV</button>
							</div>
						</Conditional>
					</div>
				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ location &&
						<AdminItemSingle
							list={data.locations}
							setList={val => updateList('locations', val)}
							selected={location}
							setSelected={setLocation}
							keyAttribute="id" 
							nameAttribute="title"
							render={singleLocation}
							samples={true}
							def={location === 'def'}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});

const EstimatedCoordinates = ({count}) => {
	const { current, setData } = useContext(MapplicContext);
	
	const saveEstimates = () => {
		setData(prev => ({
			...prev,
			locations: prev.locations.map(l => ({...l, ...current.estPos[l?.id]}))
		}))
	}
	
	if (count < 1) return null;
	return (
		<p className="mapplic-notification mapplic-warning">
			<b>{count}</b> locations use estimated coordinates. <button onClick={saveEstimates}>Click here</button> to fix it.
		</p>
	)
}

const LocationRecognizer = () => {
	const { current, data, csv, setData } = useContext(MapplicContext);

	const recognize = () => {
		const unlinked = Object.entries(current.estPos).filter(([k, v]) => data.locations.every(l => l.id !== k) && csv.every(l => l.id !== k) && v.layer === current.layer);

		if (unlinked.length < 1) alert('There are no unlinked interactive elements on this layer.');
		else if (confirm(`There are ${unlinked.length} unlinked interactive elements on this layer. Would you like to auto-populate them?`)) {
			const newLocations = unlinked.map(l => ({id: l[0], title: l[0].toUpperCase(), ...l[1]}));
			setData(prev => ({
				...prev,
				locations: [...newLocations, ...prev.locations]
			}));
		}
	}

	return <button className="mapplic-button alt" onClick={recognize}>Run recognizer</button>
}