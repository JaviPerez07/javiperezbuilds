/** Config de build de Tailwind — equivalente exacto del antiguo config inline
 *  del runtime por CDN que cargaba index.html. Solo la home usa
 *  clases Tailwind; los scripts entran en content por las clases que el JS
 *  añade dinámicamente. Compilar con:
 *    npx -y tailwindcss@3.4.17 -c tailwind.config.js \
 *      -i styles/tailwind.input.css -o styles/tailwind.css --minify
 */
module.exports = {
  content: [
    './index.html',
    './agentes.html',
    './agentes/*.html',
    './links.html',
    './legal.html',
    './scripts/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0D1320',
        'bg-elevated': '#111A2C',
        'bg-card': '#16213A',
        'text-primary': '#FAF9F5',
        'text-secondary': '#B6BDC9',
        'text-dim': '#8A92A1',
        'accent': '#D97757',
        'border-subtle': '#243049',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'ui-monospace', 'monospace'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
    },
  },
};
