/********************
 * Tailwind CSS v4  *
 * ESM + TypeScript *
 ********************/

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Use class-based dark mode so we can toggle with the `.dark` class on <html>
  // while still supporting OS/browser theme via our boot script.
  darkMode: 'class',
  theme: {
    extend: {}
  }
}
