import React from 'react';
import { useState, useRef, useCallback, useContext } from 'react'
import { HexColorInput, HexAlphaColorPicker } from 'react-colorful'
import { ArrowRightCircle, X, Image } from 'react-feather'
import useClickOutside from './useClickOutside'
import classNames from 'classnames'

import { UploadFieldContext } from './UploadFieldContext'

export const Upload = (props) => {
	const field = useContext(UploadFieldContext);
  
	if (field && typeof field === 'function') {
		const Field = field;
		return <Field {...props} />;
	}
	else return <Manual {...props} />;
}

export const Checkbox = ({label, active = true, disabled = false, checked, onChange}) => {
	if (!active) return;
	return <label><input type="checkbox" disabled={disabled} checked={checked || false} onChange={() => onChange(!checked)} />{label}</label>
}

export const Switch = ({label, active = true, value, values = {true: 'On', false: 'Off'}, nullValue, onChange, ...props}) => {
	if (!active) return null;

	const sanitize = (v) => {
		if (v === 'true') return true;
		else if (v === 'false') return false;
		else return v;
	}

	const handleClick = (v) => {
		if (value === v && nullValue !== undefined) onChange(nullValue);
		else onChange(v); 
	}

	return (
		<Label text={label}>
			<div className="field switch" {...props}>
				{ Object.entries(values).map(([k, v]) => (
					<button key={k} className={classNames({'selected': value === sanitize(k)})} onClick={() => handleClick(sanitize(k))}>{v}</button>
				))}
			</div>
		</Label>
	)	
}

export const Input = ({type = 'text', label, active = true, value = '', onChange, placeholder, suffix, icon, button, spellCheck = false, validate = () => false, ...props}) => {
	if (!active) return null;

	const [changed, setChanged] = useState(false);
	const [error, setError] = useState(null);

	const handleChange = (e) => {
		setError(false);
		try {
			onChange(e.target.value, !changed);
			setChanged(true);
			validate(e.target.value);
		}
		catch (error) { setError(error); }
	}
	
	return (
		<Label text={label}>
			<div>
				<div className={classNames('field', {'error': error})}>
					<div className="field-inner">
						<input
							{...props}
							type={type}
							value={value}
							placeholder={placeholder}
							spellCheck={spellCheck}
							onFocus={() => setChanged(false)}
							onChange={handleChange}
						/>
						{ suffix && <span>{ suffix }</span> }
						{ icon && icon }
					</div>
					{ button && <button><Image size={16} /></button> }
				</div>
				{ error && <small className="mapplic-error">{error.message}</small> }
			</div>
		</Label>
	)
}

export const Manual = ({type = 'text', label, active = true, value = '', onChange, placeholder, suffix, icon, button, spellCheck = false, validate = () => false, ...props}) => {	
	const [unsaved, setUnsaved] = useState(false);
	const [error, setError] = useState(null);
	
	const getValue = () => unsaved !== false ? unsaved : value;
	
	const saveValue = () => {
		if (unsaved === false) return;
		try {
			validate(unsaved);
			onChange(unsaved);
			setUnsaved(false);
		}
		catch (error) { setError(error); }
	}
	
	if (!active) return null;
	return (
		<Label text={label}>
			<div>
				<div className={classNames('field', {'error': error})}>
					<div className="field-inner">
						<input
							{...props}
							type={type}
							value={getValue()}
							placeholder={placeholder}
							spellCheck={spellCheck}
							onChange={e => {
								setUnsaved(e.target.value !== value ? e.target.value : false);
								setError(false);
							}}
							onKeyDown={e => {
								if (e.key === 'Enter') saveValue();
							}}
						/>
						{ suffix && <span>{ suffix }</span> }
						{ icon && icon }
					</div>
					{ button && <button><Image size={16} /></button> }

					{ unsaved !== false && <button><ArrowRightCircle size={16} onClick={saveValue} /></button> }
				</div>
				{ error && <small className="mapplic-error">{error.message}</small> }
			</div>
		</Label>
	)
}

export const Dropdown = ({label, active = true, disabled = false, value = '', values, onChange, ...props}) => {
	if (!active) return;

	const handleChange = (e) => {
		if (props.multiple) onChange(Array.from(e.target.selectedOptions, o => o.value));
		else onChange(e.target.value);
	}

	const getValue = () => props.multiple && typeof value === 'string' ? value.split(',') : value;

	return (
		<Label text={label}>
			<div className="field">
				<div className="field-inner">
					<select value={getValue()} disabled={disabled} onChange={handleChange} {...props}>
						{ Object.entries(values).map(([key, value]) => (
							<option key={key} value={key}>{value}</option>
						))}
					</select>

				</div>
			</div>
		</Label>
	)
}

export const Textarea = ({label, value, onChange, placeholder, ...props}) => {
	const [changed, setChanged] = useState(false);

	return (
		<Label text={label} above={true}>
			<div className="field">
				<textarea
					value={value}
					rows="5"
					spellCheck={false}
					placeholder={placeholder}
					onFocus={() => setChanged(false)}
					onChange={e => {
						onChange(e.target.value, !changed);
						setChanged(true);
					}}
					{...props}
				/>
			</div>
		</Label>
	)
}

export const Color = ({label, value = '', onChange, ...props}) => {
	const [opened, setOpened] = useState(false);
	const popover = useRef();

	const close = useCallback(() => setOpened(false), []);
	useClickOutside(popover, close);
	
	// clearing field
	const onInput = (e) => {
		if (e.target.value === '') onChange('');
	}

	return (
		<Label text={label}>
			<div className="field">
				{ opened &&
					<div className="popover" ref={popover}>
						<HexAlphaColorPicker color={value} onChange={onChange} />
					</div>
				}
				<div className="swatch" onClick={() => setOpened(true)} style={{backgroundColor: value}}></div>
				<div className="field-inner">
					<HexColorInput
						{...props} 
						type="text"
						color={value}
						onClick={() => setOpened(true)}
						onChange={onChange}
						onInput={onInput}
						alpha
					/>
					{ value !== '' && <X size={16} style={{cursor: 'pointer'}} onClick={() => onChange('')} /> }
				</div>
			</div>
		</Label>
	)
}

export const Coord = ({active = true, label, value, onChange, ...props}) => {
	
	const handleChange = (e) => {
		let valid = true;
		const coord = e.target.value.split(',').map((i) => {
			if (/^[-+]?([0-9]+(\.[0-9]+)?|\.[0-9]+)$/.test(i.trim())) return parseFloat(i);
			else {
				valid = false;
				return null;
			}
		});
		onChange(valid ? coord : e.target.value);
	}
	
	if (!active) return null;
	return (
		<Label text={label}>
			<div className={classNames('field', {'error': !Array.isArray(value)})}>
				<div className="field-inner">
					<input {...props} type="text" spellCheck={false} value={value} onChange={handleChange}/>
				</div>
			</div>
		</Label>
	)
}

const Label = ({text = false, children, above = false}) => {
	if (!text) return children;
	return (
		<label className={classNames('field-label', {'above': above})}>
			<span>{ text }</span>
			{ children }
		</label>
	)
}