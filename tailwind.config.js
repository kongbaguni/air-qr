module.exports = {
  purge: ['./public/index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    fontSize: {
      xs: 'var(--text-xs, 0.75rem)',
      sm: 'var(--text-sm, 0.875rem)',
      base: 'var(--text-base, 1rem)',
      lg: 'var(--text-lg, 1.125rem)',
      xl: 'var(--text-xl, 1.25rem)',
      '2xl': 'var(--text-2xl, 1.5rem)'
    },
    extend: {}
  },
  variants: { extend: {} },
  plugins: []
}
