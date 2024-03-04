import React from 'react';
import { useState, useEffect } from 'react'
import { X, Plus } from 'react-feather'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import builtin from './builtInMaps.json'

export const MapsModal = ({open, setOpen}) => {
	const [preset, setPreset] = useState('world');

	return (
		<Modal classNames={{modal: 'mapplic-admin-ui'}} open={open} onClose={() => setOpen(false)} closeIcon={<X size={16}/>} center>
			<div>
				<h3>Maps</h3>
				<small>Switch to a different demo map.</small>
			</div>
			<div className="mapplic-demos">
				<DemoMap title="Shopping mall" url="data.json" desc="Example mall map with 3 SVG layers and a filterable sidebar" />
				<DemoMap title="United States" url="data-us.json" desc="Geocalibrated US map, locations from external CSV" />
				<DemoMap title="World" url="data-world.json" desc="World map with clickable countries and manual markers" />
				<DemoMap title="Residential lots" url="data-lots.json" desc="SVG lot map showcasing different states of lots" />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
				<h4>Geographic maps</h4>
				<select className="admin-input-field" value={preset} size="10" onChange={e => setPreset(e.target.value)}>
					{ Object.keys(builtin).map(id => <option key={id} value={id}>{builtin[id].title}</option>)}
				</select>
				<MapLink id={preset} map={builtin[preset]} file={`data-${preset}.json`} />
			</div>
		</Modal>
	)
}

const MapLink = ({id, map, file}) => {
	const [exists, setExists] = useState(false);
	
	useEffect(() => {
		const checkIfFileExists = async (url) => {
			try {
				const res = await fetch(url, { method: 'HEAD' });
				if (res.status === 200) return true;
				else return false;
			} catch (error) {
				return null; // error occurred, file does not exist
			}
		}
		
		const updateExistsState = async () => {
			const result = await checkIfFileExists(file);
			setExists(result);
		}
	  
		updateExistsState();
	}, [file]);

	const getData = (id, map, json) => {	
		return {
			target: json,
			settings: {
				mapWidth: map.width,
				mapHeight: map.height,
				height: '600px',
				padding: 40,
				zoom: true,
				hoverTooltip: true,
				maxZoom: 3,
				layer: id,
				layerSwitcher: 'top-right',
				resetButton: 'bottom-right',
				zoomButtons: 'bottom-right',
				extent: map.extent,
				geo: false
			},
			breakpoints: [
				{
					name: "all-screens",
					below: 9000,
					container: 600
				},
				{
					name: "mobile",
					below: 480,
					portrait: true
				}
			],
			layers: [
				{
					id: id,
					name: map.title,
					file: `assets/maps/world/${id.toUpperCase()}.svg`
				}
			]
		}
	}
	
	const createMap = async () => {
		try {
			await fetch('http://localhost:3000/mapplic-save', {
				mode: 'no-cors',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(getData(id, map, file))
			});
			setExists(true);
		}
		catch (error) {
			console.error(error);
		}
	}

	if (!id) return null;
	return (
		<div style={{display: 'flex', flexDirection: 'row-reverse'}}>
			{ exists
				? <a className="mapplic-button mapplic-button-primary" href={`./?map=${file}`}>Open {map.title}</a>
				: <button className="mapplic-button" onClick={createMap}>Generate {file}</button>
			}
		</div>
	)
}

const DemoMap = ({title, desc, url}) => {
	return (
		<a className="mapplic-demo-map" href={`./?map=${url}`}>
			<h4>{title}</h4>
			<p>{desc}</p>
		</a>
	)
}