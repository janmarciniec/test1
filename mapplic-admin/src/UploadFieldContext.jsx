import React from 'react';
import { createContext } from 'react'

const UploadFieldContext = createContext();

const UploadFieldContextProvider = ({value, children}) => {
	return (
		<UploadFieldContext.Provider value={value}>
			{ children }
		</UploadFieldContext.Provider>
	)
}

export { UploadFieldContext, UploadFieldContextProvider }