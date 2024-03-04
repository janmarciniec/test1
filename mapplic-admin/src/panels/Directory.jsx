import React from 'react';
import { useContext, useState, forwardRef } from 'react'
import { MapplicContext } from '../MapplicAdmin'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { Key } from 'react-feather'
import { Switch, Input, Manual, Dropdown, Color } from '../AdminFields'
import { TitleToggle, Conditional, getGroups, unique, filled } from './utils'

export const Directory = forwardRef(({setOpened, updateSetting, updateList}, ref) => {
	const { data } = useContext(MapplicContext);

	const [group, setGroup] = useState(false);
	const [filter, setFilter] = useState(false);

	const singleGroup = (group, updateProperty) => (
		<div className="option-group">
			<Manual
				label="Name"
				value={group.name}
				onChange={val => updateProperty('name', val)}
				validate={val => unique(val, data.groups, 'name') && filled(val)}
				icon={<Key size={16} />}
				autoFocus
			/>
			<Color label="Color" value={group.color} onChange={val => updateProperty('color', val)} />
			<Switch label="Hide" value={group.hide || false} onChange={val => updateProperty('hide', val)} />
		</div>
	)

	const singleFilter = (filter, updateProperty) => (
		<div className="option-group">
			<Manual
				label="ID"
				value={filter.id}
				onChange={val => updateProperty('id', val)}
				validate={val => unique(val, data.filters, 'id') && filled(val)}
				icon={<Key size={16} />}
				autoFocus
			/>
			<Input label="Name" value={filter.name} onChange={val => updateProperty('name', val)} />
			<Dropdown label="Type" value={filter.type} values={{checkbox: 'Checkbox', tags: 'Groups', dropdown: 'Dropdown'}} onChange={val => updateProperty('type', val)} />
			
			<Conditional active={filter.type === 'tags'}>
				<Dropdown label="Default" value={filter.default || []} multiple values={getGroups(data?.groups)} onChange={val => updateProperty('default', val)} />
			</Conditional>
		
			<Conditional active={filter.type === 'checkbox'} >
				<Manual label="Condition" value={filter.logic} onChange={val => updateProperty('logic', val)} />
				<Switch label="Default" value={filter.default || false} onChange={val => updateProperty('default', val)} />
			</Conditional>

			<Conditional active={filter.type === 'dropdown'} >
				<Manual label="Condition" value={filter.logic} onChange={val => updateProperty('logic', val)} />
				<Input label="Default" value={filter.default} onChange={val => updateProperty('default', val)} />
				<Input label="Value" value={filter.value} onChange={val => updateProperty('value', val)} />
			</Conditional>

			<Switch label="Disable" value={filter.disable || false} onChange={val => updateProperty('disable', val)} />
		</div>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group">
						<TitleToggle title="Directory" checked={data.settings.sidebar} onChange={checked => updateSetting('sidebar', checked)} back={() => setOpened(false)} />
						<Conditional active={data.settings.sidebar || false}>
							<div className="mapplic-panel-options">
								<Switch label="Order by title" value={data.settings.ordered || false} onChange={checked => updateSetting('ordered', checked)} />
								<Switch label="Group by" value={data.settings.groupBy || false} onChange={checked => updateSetting('groupBy', checked)} />
								<Switch label="Thumbnails" value={data.settings.thumbnails || false} onChange={checked => updateSetting('thumbnails', checked)} />
								<Switch label="Toggle" value={data.settings.toggleSidebar || false} onChange={checked => updateSetting('toggleSidebar', checked)} />
								<Switch label="By default" active={data.settings.toggleSidebar || false} value={data.settings.sidebarClosed} values={{false: 'Opened', true: 'Closed'}} onChange={checked => updateSetting('sidebarClosed', checked)} />
								<Switch label="Sidebar" value={data.settings.rightSidebar || false} values={{false: 'Left', true: 'Right'}} onChange={checked => updateSetting('rightSidebar', checked)} />
							</div>
						</Conditional>
					</div>

					<div className="mapplic-panel-group">
						<TitleToggle title="Search and filters" checked={data.settings.filters} onChange={checked => updateSetting('filters', checked)} />
						<Conditional active={data.settings.filters || false}>
							<div className="mapplic-panel-options">
								<Switch label="Visibility" active={data.settings.filters} value={data.settings.filtersAlwaysVisible || false} values={{false: 'Toggle', true: 'Always'}} onChange={checked => updateSetting('filtersAlwaysVisible', checked)} />
								<Switch label="By default" active={data.settings.filters} value={data.settings.filtersOpened || false} values={{true: 'Opened', false: 'Closed'}} onChange={checked => updateSetting('filtersOpened', checked)} />
							</div>
						</Conditional>
					</div>

					<div className="mapplic-panel-group">
						<AdminItems
							selected={group}
							setSelected={setGroup}
							label="Groups"
							list={data.groups}
							setList={val => updateList('groups', val)}
							newItem={{name: 'Group ' + Date.now(), color: '#111827'}}
							keyAttribute="name"
							nameAttribute="name"
							renderItem={(group, updateProperty) => (
								<div className="option-group">
									<Manual
										label="Name"
										value={group.name}
										onChange={val => updateProperty('name', val)}
										validate={val => unique(val, data.groups, 'name') && filled(val)}
										icon={<Key size={16} />}
									/>
									<Color label="Color" value={group.color} onChange={val => updateProperty('color', val)} />
									<Switch label="Hide" value={group.hide || false} onChange={val => updateProperty('hide', val)} />
								</div>
							)}
						/>
					</div>

					<div className="mapplic-panel-group">
						<AdminItems
							selected={filter}
							setSelected={setFilter}
							label="Custom filters"
							list={data.filters}
							setList={val => updateList('filters', val)}
							newItem={{id: 'f' + Date.now(), name: 'New filter', type: 'checkbox'}}
							keyAttribute="id"
							nameAttribute="name"
						/>
					</div>
				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ group &&
						<AdminItemSingle
							list={data.groups}
							setList={val => updateList('groups', val)}
							selected={group}
							setSelected={setGroup}
							keyAttribute="name" 
							nameAttribute="name"
							render={singleGroup}
						/>
					}
					{ filter &&
						<AdminItemSingle
							list={data.filters}
							setList={val => updateList('filters', val)}
							selected={filter}
							setSelected={setFilter}
							keyAttribute="id" 
							nameAttribute="name"
							render={singleFilter}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});