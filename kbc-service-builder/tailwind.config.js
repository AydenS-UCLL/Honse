/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#003665",
        navydeep: "#00233F",
        sky: "#00AEEF",
        ice: "#E6F6FD",
        ground: "#F3F6F9",
        backdrop: "#DCE3EA",
        ink: "#10223A",
        body: "#33475C",
        muted: "#4A5B70",
        line: "#DCE3EA",
        hair: "#E3E9EF",
        connector: "#9FB3C6",
        warnbg: "#FFF4E5",
        warn: "#8A3B00",
        warnink: "#5C2E00",
        warnicon: "#B45309",
        ok: "#0B6B3A",
        okbg: "#E3F4EA",
      },
      fontFamily: {
        sans: ["var(--font-figtree)", "Helvetica Neue", "Helvetica", "sans-serif"],
        mono: ["SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        phone: "0 10px 40px rgba(16,34,58,0.18)",
        card: "0 1px 3px rgba(16,34,58,0.10)",
      },
      keyframes: {
        slideUp: { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        blink: { "0%, 80%, 100%": { opacity: "0.25" }, "40%": { opacity: "1" } },
      },
      animation: {
        slideUp: "slideUp 220ms ease-out",
        fadeIn: "fadeIn 180ms ease-out",
        blink: "blink 1.2s infinite",
      },
    },
  },
  plugins: [],
};
