import fse from 'fs-extra'

/**
 *
 * @param {*} server
 * @param {Partial<VitePluginOptions>} options
 * @returns
 */
export const devServer = (server, options) => () =>
    server.middlewares.use(async (req, res, next) => {
        try {
            const routifyDir = options.routifyDir || '.routify'

            const compositeUrl = req.originalUrl

            let template = fse.readFileSync('index.html', 'utf-8')
            template = await server.transformIndexHtml(compositeUrl, template)

            const { render } = await server.ssrLoadModule(`${routifyDir}/render.js`)

            const output = await render(compositeUrl)
            const html = template
                .replace('<!--ssr:html-->', output.html)
                .replace('<!--ssr:head-->', output.head)
                .replace('<!--ssr:css-->', output.css.code)

            res.setHeader('Content-Type', 'text/html')

            res.statusCode = output.load?.status || 200
            res.end(html)
        } catch (e) {
            server.ssrFixStacktrace(e)
            next(e)
        }
    })