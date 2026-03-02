/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "var(--bg)",
                surface: "var(--surface)",
                primary: {
                    DEFAULT: "var(--primary)",
                    soft: "var(--primary-soft)",
                    fg: "var(--primary-fg)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    bg: "var(--muted-bg)",
                },
                border: "var(--border)",
                success: "var(--success)",
                warning: "var(--warning)",
                danger: "var(--danger)",
            },
            boxShadow: {
                soft: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
                card: "0 2px 8px -2px rgb(0 0 0 / 0.08), 0 1px 4px -1px rgb(0 0 0 / 0.06)",
                lifted: "0 4px 16px -4px rgb(0 0 0 / 0.12), 0 2px 6px -2px rgb(0 0 0 / 0.08)",
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem",
            },
            fontSize: {
                "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
            },
            animation: {
                "fade-in": "fadeIn 0.2s ease-out",
                "slide-up": "slideUp 0.3s ease-out",
                "pulse-soft": "pulseSoft 2s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
                slideUp: { from: { transform: "translateY(8px)", opacity: 0 }, to: { transform: "translateY(0)", opacity: 1 } },
                pulseSoft: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
            },
        },
    },
    plugins: [],
};
