import React from 'react'
import ReactDOM from 'react-dom/client'
import MapplicAdmin from './MapplicAdmin'

const searchParams = new URLSearchParams(window.location.search);

ReactDOM.createRoot(document.getElementById('content')).render(
	<MapplicAdmin json={searchParams.get('map')} logo={true}/>
)