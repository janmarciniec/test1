import React, { Suspense, useContext, useState } from 'react'
import { ControlPanel } from './ControlPanel'
import { AdminBar } from './AdminBar'
import { MapplicContextProvider, MapplicContext } from '../../mapplic/src/Mapplic'
import '../../mapplic/src/mapplic.css'
import './mapplic-admin.css'

import { UploadFieldContextProvider } from './UploadFieldContext'

const MapplicElement = React.lazy(() => import('../../mapplic/src/MapplicElement'));

export default function MapplicAdmin({json, action, saveMap, title, uploadField}) {
	return (
		<MapplicContextProvider json={json || 'data.json'} admin={true}>
			<UploadFieldContextProvider value={uploadField}>
				<AdminBuilder saveMap={saveMap} action={action} title={title} />
			</UploadFieldContextProvider>
		</MapplicContextProvider>
	)
}

const AdminBuilder = ({saveMap, action, title}) => {
	const { data } = useContext(MapplicContext);

	const [view, setView] = useState('desktop');
	const [history, setHistory] = useState(0);

	const updateHistory = (step = true) => setHistory((prev) => step ? Math.abs(prev) + 1 : -Math.abs(prev) - 1);

	return (
		<div className="mapplic-admin">
			<ControlPanel updateHistory={updateHistory} action={action} title={title} />
			<div className="mapplic-admin-main">
				{ data && <AdminBar history={history} view={view} setView={setView} saveMap={saveMap} /> }
				<div className="mapplic-admin-content">
					<div id="map-container" className={view}>
						<Suspense fallback={<div>Loading...</div>}>
							<MapplicElement />
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	)
}

export { MapplicAdmin, MapplicContext }