import React from 'react';
import { useContext } from 'react'
import { motion } from 'framer-motion'
import { MapplicContext } from './MapplicContext'
import { Sliders, Plus, X, Search } from 'react-feather'
import classNames from 'classnames'

export const SearchFilter = ({value, anim}) => {
	const { current, data } = useContext(MapplicContext);

	const opened = () => (current.filtersOpened || data.settings.filtersAlwaysVisible) && data.filters?.length > 0;

	return (
		<div className={classNames('mapplic-search-filter', {'opened': opened()})}>
			<SearchBar value={value} />
			{ opened() && <Filters anim={anim} /> }
		</div>
	)
}

export const SearchBar = ({value}) => {
	const { current, data, getFilterCount, toggleFilters, openSidebar, doSearch } = useContext(MapplicContext);

	return (
		<div className="mapplic-search-bar">
			<label className="mapplic-search">
				<Search size={16} />
				<input type="text" placeholder={data.settings.searchText || "Search"} spellCheck={false} onClick={openSidebar} onInput={(e) => doSearch(e.target.value)} value={value}/>
				{ value && <button onClick={() => doSearch('')}><X size={12} /></button> }
			</label>
			<SingleSwitch value={!current.filtersOpened} active={data.filters?.length > 0 && !data.settings.filtersAlwaysVisible}>
				<button onClick={toggleFilters}>
					<Sliders size={16}/>
					{ data.settings.accessibility && <span>Filter</span> }
					<Count nr={getFilterCount()} />
				</button>
			</SingleSwitch>
		</div>
	)
}

const SingleSwitch = ({children, value, active}) => {
	if (!active) return null;
	return (
		<div className="mapplic-switch">
			{ value && <div className="mapplic-switch-background"></div> }
			{ children }
		</div>
	)
}

const Count = ({nr}) => {
	if (nr < 1) return;
	return <small className="mapplic-count">{nr}</small>
}

const Filters = ({anim}) => {
	const { data, current, getFilterCount } = useContext(MapplicContext);

	if (!data.filters) return null;
	return (
		<motion.div key="filters" {...anim} style={{display: 'flex', flexDirection: 'column', overflowY: 'auto'}}>
			<div className="mapplic-filters-body">
				{ data.filters.map((f) => <Filter key={f.id} f={f} />)}
			</div>

			<FiltersFooter shown={getFilterCount() > 0 || current.search } text={data.settings.clearText || 'Clear all'} />
		</motion.div>
	)
}

const FiltersFooter = ({shown, text}) => {
	const { clearFilters, displayList } = useContext(MapplicContext);
	if (!shown) return null;
	return (
		<div className="mapplic-filters-footer">
			<button onClick={clearFilters}>{text} <X size={12} /></button>
			<span>{ displayList(false).length } found</span>
		</div>
	)
}

const Filter = ({f}) => {
	const { data, current, setFilter } = useContext(MapplicContext);
	if (f.disable) return;
	
	switch (f.type) {
		case 'tags':
			return (
				<div className="mapplic-tags">
					{ data.groups && data.groups.map(g => <Tag key={g.name} group={g} active={Array.isArray(current.filters.group) && current.filters.group.includes(g.name)} />) }
				</div>
			)
		case 'checkbox':
			return (
				<label className="mapplic-toggle">
					<span>{f.name}</span>
					<div className="mapplic-toggle-switch">
						<input type="checkbox" checked={current.filters[f.id] || false} onChange={() => setFilter(f.id, !current.filters[f.id])}/><span></span>
					</div>
				</label>
			)
		case 'dropdown':
			return (
				<label>
					<select className="mapplic-dropdown" value={current.filters[f.id]} onChange={e => setFilter(f.id, e.target.value)}>
						{f.value?.split(';').map(v => {
							const pair = v.split(':');
							return <option key={v} value={pair[0]}>{pair[1]}</option>
						})}
					</select>
				</label>
			)
		default:
			return
	}
}

function Tag({group, active}) {
	const { toggleGroup } = useContext(MapplicContext);
	if (group.hide) return false;

	const style = {
		color: active ? '#fff' : group.color
	}

	if (active) {
		style.borderColor = group.color;
		style.backgroundColor = group.color;
	}

	return (
		<button className={classNames('mapplic-tag', {'mapplic-active': active})} style={style} onClick={() => toggleGroup(group, active)}>
			{ !active && <Plus size={12} /> }
			<span>{group.name}</span>
			{ active && <X size={12} /> }
		</button>
	)
}