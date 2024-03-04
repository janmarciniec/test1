import React from 'react';
import { Upload, Check } from 'react-feather'
import classNames from 'classnames'

export const SaveButton = ({modified, saveState, save}) => {
	const getIcon = () => {
		if (saveState === 'loading') return <span className="mapplic-loader"></span>
		if (saveState === 'saved' && !modified) return <Check size={16} />
		else return <Upload size={16} />
	}

	return (
		<button className={classNames('mapplic-button mapplic-button-primary', {'mapplic-button-saved': (saveState === 'saved' && !modified)})} disabled={!modified} onClick={() => save()}>
			{ getIcon() }
			Save Changes
		</button>
	)
}