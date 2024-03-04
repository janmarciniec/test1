import React from 'react';
import { useState, useEffect, forwardRef } from 'react'
import { ReactSortable } from 'react-sortablejs'
import { Panel } from './Panel'
import { Plus, Trash2, ArrowLeft, CornerLeftDown, Code } from 'react-feather'
import { CodePopup } from './CodePopup'

export const AdminItems = ({setSelected, label, list = [], setList, def = false, preselected = false, keyAttribute, nameAttribute, newItem, back}) => {

	const [codePopup, setCodePopup] = useState(false);

	if (!newItem) newItem = {[keyAttribute]: 'item' + Date.now(), [nameAttribute]: 'New item'};

	const createItem = (item) => {
		setList([item, ...list]);
		setSelected(item[keyAttribute]);
	}

	useEffect(() => {
		if (def && !list.some(i => i[keyAttribute] === def[keyAttribute])) setList([def, ...list]);
	}, []);

	useEffect(() => {
		if (preselected && list.find(i => i.id === preselected)) setSelected(preselected);
	}, [preselected]);

	const setListSort = (l, sortable, store) => {
		if (!store.dragging) return;
		setList(l);
	}

	return (
		<div className="mapplic-admin-list">
			<CodePopup open={codePopup} setOpen={setCodePopup} mode="json" title={`${label} - data`} content={list.map(({ chosen, selected, ...rest }) => rest)} setContent={setList} />
			<div className="mapplic-admin-list-header">
				<div style={{display: 'flex', alignItems: 'center', gap: 4, marginLeft: back ? -8 : 0}}>
					{ back && <button className="mapplic-admin-button" onClick={back}><ArrowLeft size={16} /></button> }
					<h4>{label}</h4>
					<button className="code-button" onClick={() => setCodePopup(true)}><Code size={12} /></button>
				</div>
				<button className="mapplic-admin-button" onClick={() => createItem(newItem)}><Plus size={16} /></button>
			</div>
			<div className="mapplic-admin-list-body">
				{ list.length < 1 && <i className="mapplic-empty-message">There are no {label.toLowerCase()} yet.</i> }
				{ def && <ul><ListItem item={def} nameAttribute={nameAttribute} onClick={() => setSelected(def[keyAttribute])} def={true} /></ul> }
				<ReactSortable tag="ul" list={list} setList={setListSort} animation={150} className="mapplic-admin-list-items" delayOnTouchStart={true} delay={1}>
					{ list.map(i =>
						<ListItem key={i[keyAttribute]} item={i} nameAttribute={nameAttribute} onClick={() => setSelected(i[keyAttribute])} hide={def && i[keyAttribute] === def[keyAttribute]} />
					)}
				</ReactSortable>
			</div>
		</div>
	)
}

const ListItem = ({item, nameAttribute, onClick, def, hide}) => {
	return (
		<li className="mapplic-admin-list-item" style={{display: hide ? 'none' : 'flex'}}>
			<button onClick={onClick} style={{ paddingLeft: def ? 4 : 10, }}>
				{ def && <CornerLeftDown size={12} color="var(--neutral-500)" /> }
				{ item[nameAttribute] || <i>Untitled</i> }
			</button>
		</li>
	)
}

export const AdminItemSingle = forwardRef(({list, setList, selected, setSelected, keyAttribute, nameAttribute, render, def = false, samples = false}, ref) => {
	const [changed, setChanged] = useState(false);
	
	const getSelected = () => list.find(i => i[keyAttribute] === selected);
	const getSample = (list, location, field = 'sample') =>  list.find(l => l.id === location?.[field]) || list.find(l => l.id === 'def') || {};
	const sampleValues = () => samples ? getSample(list, getSelected()) : {};

	const updateItem = (item, id = selected) => {
		setList( list.map(i => {
			if (i[keyAttribute] === id) return item;
			else return i;
		}), !changed);
		setChanged(true);

		if (id === selected && item[keyAttribute] !== id) setSelected(item[keyAttribute]); // update selected
	}

	const deleteItem = (id = selected) => {
		if (def && selected === def[keyAttribute]) return; // don't delete default
		setList(list.filter(i => i[keyAttribute] !== id));
		setSelected(false);
	}

	const updateProperty = (key, value) => {
		let updated = {...getSelected(), [key]: value };
		if (value === '') delete updated[key];
		updateItem(updated);
	}
	
	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="panel-header" style={{padding: ' 16px 12px 0 12px'}}>
						<button className="mapplic-admin-button" onClick={() => setSelected(false)}><ArrowLeft size={16} /></button>
						<b>{ getSelected()[nameAttribute] || <i>Untitled</i> }</b>
						<button className="mapplic-admin-button warn" disabled={def} onClick={() => deleteItem()}><Trash2 size={16} /></button>
					</div>
					<div className="mapplic-panel-group">
						{ render(getSelected(), updateProperty, sampleValues()) }
					</div>
				</div>
			</div>
		</Panel>
	)
})