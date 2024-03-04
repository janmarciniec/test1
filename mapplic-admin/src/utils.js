export const roundTo = (number, decimals) => {
	const mult = Math.pow(10, decimals);
	return Math.round(number * mult) / mult;
}

export const fileExtension = (url) => {
	return url.split(/[#?]/)[0].split('.').pop().trim().toLowerCase();
}