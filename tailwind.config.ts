import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'surface-lowest': '#0E0E0E',
        'surface-dim': '#131313',
        'surface': '#131313',
        'surface-container-low': '#1C1B1B',
        'surface-container': '#201F1F',
        'surface-container-high': '#2A2A2A',
        'surface-container-highest': '#353534',
        'surface-bright': '#3A3939',
        'on-surface': '#E5E2E1',
        'on-surface-variant': '#CBC6BC',
        'outline': '#959087',
        'outline-variant': '#49473F',
        primary: '#E8E2D4',
        'primary-container': '#CCC6B9',
        'primary-fixed': '#E8E2D4',
        'primary-fixed-dim': '#CCC6B9',
        'on-primary': '#333027',
        'on-primary-container': '#565248',
        error: '#FFB4AB',
        success: '#4ADE80',
      },
      fontFamily: {
        headline: ['Newsreader', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.25rem',
        md: '12px',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

export default config
