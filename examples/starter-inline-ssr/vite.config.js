import { svelte } from '@sveltejs/vite-plugin-svelte'
import routify from '@roxi/routify/vite-plugin'
import { defineConfig } from 'vite'
import { mdsvex } from 'mdsvex'

const production = process.env.NODE_ENV === 'production'

export default defineConfig({
    clearScreen: false,
    plugins: [
        routify({
            devHelper: !production,
            ssr: {
                // spank crawls your pages, so you only need to add pages that aren't linked by another spanked page
                spank: { sitemap: ['/'] },
            },
        }),
        svelte({
            emitCss: false,
            compilerOptions: {
                dev: !production,
            },
            extensions: ['.md', '.svelte'],
            preprocess: [mdsvex({ extension: 'md' })],
        }),
    ],

    server: { port: 1337 },
})
