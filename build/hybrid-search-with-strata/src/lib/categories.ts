// Mirrors the options of the `category` field on the `product` component.
export const categories = [
	{ name: 'Hiking', value: 'hiking' },
	{ name: 'Camping', value: 'camping' },
	{ name: 'Climbing', value: 'climbing' },
	{ name: 'Paddling', value: 'paddling' },
	{ name: 'Cycling', value: 'cycling' },
	{ name: 'Snow Sports', value: 'snow_sports' },
	{ name: 'Running', value: 'running' },
	{ name: 'Fishing', value: 'fishing' },
];

export const categoryName = (value: string) =>
	categories.find((category) => category.value === value)?.name ?? value;

export const formatPrice = (amount: number | string, currency = 'USD') =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
		Number(amount),
	);
