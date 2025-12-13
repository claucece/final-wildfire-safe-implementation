/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'aot', // Disable JIT mode for optimized performance
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
        fontFamily: {
          rpixel: ['Poxel-Font', 'sans-serif'],
          rmono: ['Roboto-Mono', 'sans-serif'],
	  // From https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap
          rpixelstart: ['PressStart2P-Regular', 'sans-serif']
        }
    },
  },
  plugins: [],
}
