import React from 'react';
import { useContext, useEffect, useRef } from 'react'
import { MapplicContext } from './MapplicContext'
import { replaceVars } from './utils'
import classNames from 'classnames'

export const Directory = ({scrollPosition, setScrollPosition = () => false}) => {
	const { displayList } = useContext(MapplicContext);
	const list = useRef(null);

	const handleScroll = () => {
		const position = list.current?.scrollTop;
		setScrollPosition(position);
	};

	useEffect(() => {
		if (list.current) {
			list.current.scrollTop = scrollPosition;
			list.current.addEventListener('scroll', handleScroll, { passive: true });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
		return () => { list.current?.removeEventListener('scroll', handleScroll);};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [list.current]);

	return (
		<div className="mapplic-dir" ref={list}>
			<DirectoryItems locations={displayList(false)} />
		</div>
	)
}

const DirectoryItems = ({locations}) => {
	const { data, current, getFilterCount } = useContext(MapplicContext);

	const groupBy = (groups, condition) => {
		if (!groups || !condition) return {};

		const grouped = groups.reduce((result, g) => {
			result[g] = locations.filter(l => condition(l, g));
			return result;
		}, {});

		return Object.entries(grouped);
	}

	if (locations.length < 1) return <i className="mapplic-empty-message">No results found.</i>
	if (!data.settings.groupBy || getFilterCount() > 0 || current.search ) return <DirectoryGroup locations={locations} />
	else return groupBy(
			data.groups.map(g => g.name), // groups
			(l, g) => l.group.includes(g) // condition
		).map(([group, items]) => <DirectoryGroup key={group} locations={items} group={group} />
	)
}

const DirectoryGroup = ({locations, group = null}) => {
	const { current, getSampledLocation } = useContext(MapplicContext);

	if (locations.length < 1) return null;
	return (
		<div className="mapplic-dir-group">
			<DirectoryGroupTitle group={group} count={locations.length} />
			<ul
				className={classNames('mapplic-dir-items', `mapplic-${current?.breakpoint?.type}-items`)}
				style={{gridTemplateColumns: current?.breakpoint?.column ? `repeat(${current.breakpoint.column}, 1fr)` : '100%'}}
			>
				{ locations.map(l =>
					<Item key={l.id} location={getSampledLocation(l)} />
				)}
			</ul>
		</div>
	)
}

const DirectoryGroupTitle = ({group, count}) => {
	if (!group) return null;
	return (
		<div className="mapplic-dir-group-title">
			<span>{group}</span>
			<div className="mapplic-line"></div>
			<span>{count}</span>
		</div>
	)
}

const Item = ({location, ...attributes}) => {
	const { current, openLocation, setHovered } = useContext(MapplicContext);

	const handleClick = (e) => {
		e.preventDefault();
		openLocation(location.id);
	}

	const mark = (text) => text?.replace(new RegExp(current.search, 'gi'), match => `<mark>${match}</mark>`);

	return (
		<li>
			<a 
				{...attributes}
				className={classNames('mapplic-dir-item', `mapplic-${current?.breakpoint?.type}-item`, {
					'mapplic-highlight': current.hovered === location.id,
					'mapplic-active': current.location === location.id
				})}
				data-location={location.id}
				onClick={handleClick} 
				onMouseEnter={() => setHovered(location.id)}
				onTouchStart={() => setHovered(location.id)}
				onMouseLeave={() => setHovered(false)}
				onTouchEnd={() => setHovered(false)}
			>
				<ItemBody location={location} mark={mark} type={current?.breakpoint?.type} />
			</a>
		</li>
	)
}

const ItemBody = ({location, mark, type = 'list'}) => {
	const { data } = useContext(MapplicContext);

	if (type === 'grid') return (
		<>
			{ data.settings.thumbnails && <Thumbnail location={location} /> }
			<div className="mapplic-item-body">
				<h3 dangerouslySetInnerHTML={{__html: mark(location.title)}}></h3>
				<h5 dangerouslySetInnerHTML={{__html: replaceVars(location, 'about')}}></h5>
			</div>
		</>
	)

	return (
		<>
			{ data.settings.thumbnails && <Thumbnail location={location} /> }
			<div className="mapplic-item-body">
				<h4 dangerouslySetInnerHTML={{__html: mark(location.title)}}></h4>
				<h5 dangerouslySetInnerHTML={{__html: replaceVars(location, 'about')}}></h5>
			</div>
		</>
	)
}

const Thumbnail = ({location}) => {
	const thumbContent = () => {
		if (!location.thumb) return <span>{location.title?.charAt(0)}</span>
		if (location.thumb.length <= 2) return <span>{location.thumb.toUpperCase()}</span>
		return <img src={location.thumb} alt={location.title} />
	}

	return (
		<div className="mapplic-thumbnail">{thumbContent()}</div>
	)
}