module.exports = {
    mode: "jit",
    darkMode: false,
    purge: [
        './src/**/*.html',
        './src/**/*.js',
    ],
    theme: {
        extend: {},
    },
    variants: {},
    plugins: [
        require('@themesberg/flowbite/plugin')
    ],
};