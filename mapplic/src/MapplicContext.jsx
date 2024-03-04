import React from 'react';
import { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import Papa from 'papaparse'
import { useQueryParamsState } from './hooks/useQueryParamsState'

const MapplicContext = createContext();

const convertData = (old) => {
	const converted = {
		settings: {
			mapWidth: parseFloat(old.mapwidth),
			mapHeight: parseFloat(old.mapheight),
			zoom: true,
			maxZoom: 6,
			hoverTooltip: true,
			sidebar: true,
			filters: true,
			layerSwitcher: "top-right",
			resetButton: "bottom-right",
			zoomButtons: "bottom-right",
			height: '500px'
		},
		...(old.categories && {
			groups: old.categories.map(category => ({
				id: category.id,
				name: category.title,
				...(category.color && { color: category.color })
			}))
		}),
		...(old.styles && {
			styles: old.styles.map(style => ({
				class: style.class,
				...(style?.base?.fill && { 'base-color': style.base.fill }),
				...(style?.hover?.fill && { 'hover-color': style.hover.fill }),
				...(style?.active?.fill && { 'active-color': style.active.fill }),
				marker: true,
				svg: true
			}))
		}),
		layers: old.levels?.map(level => ({
			id: level.id,
			name: level.title,
			file: level.map
		})),
		locations: [...(old.levels?.reduce((acc, level) => level.locations ? [...acc, ...level.locations] : acc, [])), ...old.locations].map(loc => ({
			id: loc.id,
			...(loc.title && { title: loc.title }),
			...(loc.description && { desc: loc.description }),
			...(loc.pin && { type: loc.pin }),
			...(loc.thumbnail && { thumb: loc.thumbnail }),
			...(loc.category && { group: loc.category.split(',') }),
			...(loc.style && { style: loc.style }),
			...(loc.fill && { color: loc.fill}),
			...(loc.x && loc.y && {coord: [parseFloat(loc.x), parseFloat(loc.y)]})
		}))
	}

	return converted;
}

const MapplicContextProvider = ({json, children, location, admin = false}) => {
	const [loaded, setLoaded] = useState(false);
	const [data, setData] = useState();
	const [current, setCurrent] = useState();
	const [csv, setCsv] = useState([]);
	const [filterLogic, setFilterLogic] = useState({});
	const [locationParam, setLocationParam] = useQueryParamsState('location');

	// fetching json
	useEffect(() => {
		const fetchData = async () => {
			try {
				const jsonResponse = await fetch(json);
				let mapData = await jsonResponse.json();

				processData(mapData);
				
				setTimeout(() => { setLoaded(true) }, 400);
			} catch (error) {
				console.error('An error occurred while fetching map data: ', error);
				setCurrent({error: 'Something went wrong.'});
			}
		}

		const processData = (mapData) => {
			if (mapData.settings?.csv && mapData.settings?.csvEnabled) {
				fetchCSV(mapData.settings.csv).then(res => {
				}).catch(error => {
					console.error(error);
				})
			}

			setConvertedData(mapData);

			if (!mapData.locations) mapData.locations = [];
			if (!mapData.layers) mapData.layers = [];

			setCurrent({
				admin: admin,
				source: json,
				hovered: false,
				target: { scale: 1, x: 0.5, y: 0.5 },
				pos: { scale: 1, x: 0.5, y: 0.5},
				transition: { duration: 0 },
				breakpoint: {},
				dragging: false,
				sidebarClosed: mapData.settings?.sidebarClosed && mapData.settings?.toggleSidebar,
				portrait: false,
				layer: mapData.settings?.layer /*|| mapData.layers[0].id*/,
				filters: mapData.filters ? Object.fromEntries(mapData.filters.filter(f => !f.disable).map(f => [f.id, f.default])) : {},
				filtersOpened: (mapData.settings?.filtersOpened && !mapData.settings?.sidebarClosed) || false,
				estPos: {},
			});
			
			setTimeout(() => { setLoaded(true) }, 400);
		}

		if (typeof json === 'object' && json !== null) processData(json);
		else fetchData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [json]);

	useEffect(() => {
		if (!loaded) return;
		if (location) openLocation(location);
		if (data.settings?.deeplinking) openLocation(locationParam);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loaded]);

	const fetchCSV = (path) => {
		return new Promise((resolve, reject) => {
			Papa.parse(path, {
				header: true,
				download: true,
				encoding: 'UTF-8',
				skipEmptyLines: true,
				transformHeader: (h) => { return h.trim().toLowerCase(); },
				transform: (val, col) => {
					if (col === 'coord') return val.split(',').map(parseFloat);
					if (col === 'latlon') return val.split(',').map(parseFloat);
					return val;
				},
				complete: (results) => {
					resolve(results.data);
				},
				error: (err) => {
					reject(err);
				}
			});
		});
	}

	// fetching csv
	useEffect(() => {
		const fetchData = async (path) => {
			try {
				const csvResponse = await fetchCSV(path);
				setCsv(csvResponse);
			} catch (error) {
				setCsv([]);
				console.error('An error occured while fetching the CSV file: ', error);
			}
		}

		if (data?.settings?.csv && data?.settings?.csvEnabled) fetchData(data?.settings?.csv);
		else setCsv([]);
	}, [data?.settings?.csv, data?.settings?.csvEnabled]);

	// filter logic
	useEffect(() => {
		let changed = false;
		const applyFunction = (id, logic) => {
			if (logic === filterLogic[id]?.logic) return filterLogic.apply;
			try {
				changed = true;

				// eslint-disable-next-line no-new-func
				return new Function('l', 'value', `return !value || ${logic} ? true : false`);
			}
			catch (e) {
				console.error(e.message);
				return undefined;
			}
		}
		
		let newLogic;
		if (data?.filters) newLogic = Object.fromEntries(data.filters.filter(i => !i.disable).map(i => [i.id, {'logic': i.logic, 'apply': applyFunction(i.id, i.logic) }]));
		if (changed) setFilterLogic(newLogic);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.filters]);

	// deeplinking
	useEffect(() => {
		if (data?.settings?.deeplinking && locationParam !== current?.location) setCurrent({...current, location: locationParam});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [locationParam]);

	// geocalibration
	const latLonCache = useMemo(() => {
		if (!data?.settings.geo || !data?.settings?.extent) return {};
		let deltaLon = data.settings.extent[2] - data.settings.extent[0],
			bottomLatDegree = data.settings.extent[1] * Math.PI / 180,
			mapWidth = ((data.settings.mapWidth / deltaLon) * 360) / (2 * Math.PI),
			mapOffsetY = (mapWidth / 2 * Math.log((1 + Math.sin(bottomLatDegree)) / (1 - Math.sin(bottomLatDegree))));
		return { deltaLon, mapWidth, mapOffsetY };
	}, [data?.settings?.geo, data?.settings?.extent, data?.settings?.mapWidth]);

	const latLonToXY = useCallback((latlon) => {
		if (!latlon || !data.settings.geo || !data.settings.extent) return false;
		const lat = latlon[0] * Math.PI / 180;
		return [
			((latlon[1] - data.settings.extent[0]) * (data.settings.mapWidth / latLonCache.deltaLon)) / data.settings.mapWidth,
			(data.settings.mapHeight - ((latLonCache.mapWidth / 2 * Math.log((1 + Math.sin(lat)) / (1 - Math.sin(lat)))) - latLonCache.mapOffsetY)) / data.settings.mapHeight
		]
	}, [data?.settings.extent, data?.settings?.geo, data?.settings.mapHeight, data?.settings.mapWidth, latLonCache.deltaLon, latLonCache.mapOffsetY, latLonCache.mapWidth]);

	// methods
	const setConvertedData = (data) => {
		if (!data.settings) data = convertData(data);
		setData(data);
	}

	const setPos = (val) => {
		setCurrent(prev => ({...prev, pos: val}));
	}

	const setPortrait = (portrait) => {
		setCurrent(prev => ({...prev, portrait: portrait}));
	}

	const setBreakpoint = (breakpoint) => {
		setCurrent(prev => ({...prev, breakpoint: breakpoint}));
	}

	const setDragging = (dragging) => {
		setCurrent(prev => ({...prev, dragging: dragging}));
	}

	const setTransition = (transition) => {
		setCurrent(prev => ({...prev, transition: transition }));
	}
	
	const toggleFilters = () => {
		setCurrent(prev => ({
			...prev,
			sidebarClosed: false,
			filtersOpened: !prev.filtersOpened
		}));
	}

	const clearFilters = () => {
		setCurrent(prev => ({
			...prev,
			search: '',
			sidebarClosed: false,
			filtersOpened: false,
			filters: Object.keys(prev.filters).reduce((a, k) => { return {...a, [k]: false}}, {})
		}));
	}

	const setFilter = (key, value) => {
		setCurrent(prev => ({
			...prev,
			filters: {
				...prev.filters,
				[key]: value
			}
		}));
	}

	const getFilterCount = () => {
		return Object.values(current.filters).filter(f => f === true || f?.length > 0).length;
	}

	const toggleGroup = (group, active) => {
		setCurrent(prev => ({
			...prev,
			filters: {
				...prev.filters,
				group: active ? prev.filters.group.filter(g => g !== group.name) : (prev.filters.group ? [ ...prev.filters.group, group.name ] : [group.name])
			}
		}));
	}

	const openLocation = (id) => {
		const l = getLocation(id);
		if (!l?.id) { // location doesn't exist
			setCurrent(prev => ({...prev, newLocation: id}));
			return;
		}
		
		const sampled = getSampledLocation(l);
		setCurrent(prev => ({
			...prev,
			location: sampled.id,
			newLocation: false,
			layer: sampled.layer || prev.layer,
			transition: { duration: 0.8 },
			target: sampled.coord ? {scale: sampled?.zoom || data.settings.maxZoom, x: sampled.coord[0], y: sampled.coord[1]} : prev.target,
			sidebarClosed: !prev.sidebarClosed ? false : sampled.action !== 'sidebar'
		}));

		if (data.settings.deeplinking) setLocationParam(id);
	}

	const closeLocation = () => {
		setCurrent(prev => ({...prev, location: false}));
		if (data.settings.deeplinking) setLocationParam('');
	}

	const setHovered = (target) => {
		const loc = getLocation(target)?.id || false;
		if (current.hovered !== loc) setCurrent(prev => ({...prev, hovered: loc}));
	}

	const getLocation = (id = current.location) => [...data.locations, ...csv].find(l => l.id === id);

	const getGlobalSample = () => {
		return data.locations.find(l => l.id === 'def');
	}

	const getSample = (location, field = 'sample') => {
		return data.locations.find(l => l.id === location?.[field]) || (location && getGlobalSample()) || {};
	}

	const getSampledLocation = (location = getLocation(), field = 'sample') => {
		return {...getCoord(location), ...getSample(location, field), ...location};
	}

	const getCoord = (location) => ({ coord: location?.coord || current.estPos[location?.id]?.coord || latLonToXY(location?.latlon) })

	const switchLayer = (layer) => {
		setCurrent(prev => ({...prev, layer: layer}));
	}

	const getLayer = () => data.layers.some(l => (l.id === current.layer) && !l.disable) ? current.layer : data.layers[0].id;

	const openSidebar = () => {
		setCurrent(prev => ({
			...prev,
			transition: { duration: 0 },
			sidebarClosed: false
		}));
	}

	const closeSidebar = () => {
		setCurrent(prev => ({
			...prev,
			location: getSampledLocation()?.action === 'sidebar' ? false : prev.location,
			transition: { duration: 0 },
			filtersOpened: false,
			sidebarClosed: true
		}));
	}

	const toggleSidebar = () => {
		setCurrent(prev => ({
			...prev,
			location: false,
			filtersOpened: false,
			transition: { duration: 0 },
			sidebarClosed: !prev.sidebarClosed
		}));
	}

	const doSearch = (keyword) => {
		setCurrent(prev => ({
			...prev,
			search: keyword
		}));
	}

	const displayList = (hidden = true) => {
		let ids = new Set(data.locations.map(l => l.id));

		let list = [...data.locations, ...csv.filter(l => !ids.has(l.id))]
			.filter(l => l.sample !== 'true') // remove samples
			.map(l => getSampledLocation(l)) // apply samples
			.filter(l => l.disable !== true && (l.hide !== true || hidden)); // remove disabled and hidden
		
			// develop applyfilters
			list = applyFilters(list);
			if (current.filters.group) list = applyGroups(list); // apply group search
			if (current.search) list = list.filter(appliedSearch); // apply search
			if (data.settings.ordered) list = list.sort((a,b) => a.title.localeCompare(b.title)); // apply ordering

		return list;
	}

	const applyFilters = (list) => {
		if (!data.filters) return list;
		return data.filters.reduce((filteredArray, filter) => {
			if (!filterLogic[filter.id]?.apply) return filteredArray;

			try {
				const value = current.filters[filter.id];
				return filteredArray.filter(l => {
					return filterLogic[filter.id].apply(l, value);
				});
			}
			catch (e) { return filteredArray; }
		}, [...list])
	}

	const applyGroups = (list) => {
		if (current.filters.group.length < 1) return list;

		return list.filter(l => {
			if (!l.group) return false;
			return current.filters.group.some(g => l.group.includes(g));
		});
	}

	const appliedSearch = (l) => {
		if (!l.title) return true;
		return l?.title?.toLowerCase().normalize('NFD').includes(current.search.toLowerCase().normalize('NFD'));
	}

	return (
		<MapplicContext.Provider value={{
			data,
			setData,
			current,
			setCurrent,
			csv,
			setCsv,
			setConvertedData,
			// currents
			setPos,
			setPortrait,
			setBreakpoint,
			setDragging,
			setTransition,
			toggleFilters,
			clearFilters,
			setFilter,
			getFilterCount,
			toggleGroup,
			openLocation,
			closeLocation,
			setHovered,
			getLocation,
			getSample,
			getSampledLocation,
			switchLayer,
			getLayer,
			openSidebar,
			closeSidebar,
			toggleSidebar,
			doSearch,
			displayList
		}}>
			{ children }
		</MapplicContext.Provider>
	)
}

export { MapplicContext, MapplicContextProvider }