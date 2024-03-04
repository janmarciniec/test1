import { create } from 'zustand'

const useMapplicStore = create((set, get) => ({
	admin: false,
	hovered: false,
	target: { scale: 1, x: 0.5, y: 0.5 },
	pos: { scale: 1, x: 0.5, y: 0.5},
	transition: { duration: 0 },
	dragging: false,
	sidebarClosed: false,
	portrait: false,
	layer: false,
	filter: false,
	estPos: {},
	
	setHovered: (id) => set({ hovered: id }),
}));

export default useMapplicStore