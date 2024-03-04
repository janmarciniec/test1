import React from 'react';
import { forwardRef } from 'react'
import { motion } from 'framer-motion'

export const Panel = forwardRef(({children}, ref) => {
	return (
		<motion.div
			ref={ref}
			className="panel"
			initial={{ x: 40, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: 40, opacity: 0 }}
			transition={{ type: 'spring', damping: 30, stiffness: 600 }}
		>
			{ children }
		</motion.div>
	)
});