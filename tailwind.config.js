/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [],
	// Make sure any custom borderRadius values are included
	theme: {
		extend: {
			borderRadius: {
				md: '0.375rem'
			}
		}
	}
};
