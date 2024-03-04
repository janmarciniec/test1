import React from 'react'
import ReactDOM from 'react-dom/client'
import MapplicElement from './MapplicElement'
import { MapplicContext, MapplicContextProvider } from './MapplicContext'
import { MapplicAPI } from './API'

const Mapplic = ({json = 'data.json', ...props}) => {
	return (
		<MapplicContextProvider json={json} {...props}>
			<MapplicElement />
		</MapplicContextProvider>
	)
}

export { MapplicContextProvider, MapplicContext }
export default Mapplic


// web component
class MapplicWebComponent extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	
	connectedCallback() {
		if (this._root.childElementCount > 0) return;
		
		let path = './';
		const script = document.getElementById('mapplic-script');
		if (script) path = script.src.substring(0, script.src.lastIndexOf('/') + 1);

		const linkElement = document.createElement('link');
		linkElement.setAttribute('rel', 'stylesheet');
		linkElement.setAttribute('type', 'text/css');
		linkElement.setAttribute('href', path + 'mapplic.css');
		this._root.appendChild(linkElement);
		
		const props = this.dataset;
		
		ReactDOM.createRoot(this._root).render(
			<MapplicContextProvider {...props}>
				<MapplicAPI ref={api => { this.obj = api }} />
				<MapplicElement />
			</MapplicContextProvider>
		);
	}
}

customElements.define('mapplic-map', MapplicWebComponent);