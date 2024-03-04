import { Component } from 'react'
import { MapplicContext } from './MapplicContext'

class MapplicAPI extends Component {
	static contextType = MapplicContext;

	constructor(props) {
		super(props);
		this.api = new Proxy({}, {
			get: (target, propKey, receiver) => {
				if (typeof this.context[propKey] === 'function') return (...args) => this.context[propKey](...args);
				else return Reflect.get(target, propKey, receiver);
			}
		});
	}

	setting(key) { return this.context.data.settings[key]; }
	
	updateSetting(key, value) {
		this.context.setData({
			...this.context.data,
			settings: {
				...this.context.data.settings,
				[key]: value
			}
		});
	}

	toggleSidebar() {
		this.updateSetting('rightSidebar', !this.setting('rightSidebar'));
	}

	render() {
		return null;
	}
}

export { MapplicAPI }