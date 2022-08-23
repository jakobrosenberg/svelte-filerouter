import { SvelteComponentDev } from 'svelte/internal'
import { globalInstance } from '../../runtime/index.js'
import { createRouter } from '../../runtime/Router/Router.js'

/**
 * @typedef {[name:string, url:string]} UrlPair
 */

const urlSegmentToRouterAndUrl = urlSegment => {
    const matches = urlSegment.match(/([\w-]+?)=(.+)/)
    if (matches) return [matches[1], matches[2]]
    return ['', urlSegment]
}

const getUrlSegments = compositeUrl =>
    compositeUrl.split(';').map(urlSegmentToRouterAndUrl)

/**
 *
 * @param {UrlPair[]} urlPairs
 * @returns
 */
const getPrimaryUrl = urlPairs => urlPairs.find(([name]) => name === '')[1]

/**
 * Returns a statically rendered Routify app
 * @param {(SvelteComponentDev|{default: SvelteComponentDev}) & {load: (url:string)=>Promise<any>}} module App.svelte
 * @param {string} compositeUrl one or multiple urls separated by ";<routerName>="
 * @returns
 */
export const renderModule = async (module, compositeUrl) => {
    const render = module.default?.render || module['render']

    const urlPairs = getUrlSegments(compositeUrl)
    const load = module.load ? await module.load(getPrimaryUrl(urlPairs)) : {}
    await preloadAllRoutersFromUrlPairs(urlPairs)
    return { ...(await render()), load }
}

/**
 * Preloads all stale routers. A router is stale if it's present in the composite url,
 * but its current route doesn't match the composite url
 * @param {UrlPair} urlPairs composite url - can contain a single or multiple urls
 */
export const preloadAllRoutersFromUrlPairs = async urlPairs => {
    const routers = urlPairs.map(([name, url]) => {
        // use existing router, if one by this name exists, otherwise create a new one
        const router =
            globalInstance.routers.find(router => router.name === name) ||
            createRouter({ name, url })

        // if router has none or bad url, use url from the urlPair
        const currentRoute = router.pendingRoute.get() || router.activeRoute.get()
        if (currentRoute?.url !== url) router.url.replace(url)

        return router
    })

    await Promise.all(routers.map(router => router.ready()))
}

/**
 * Preloads all stale routers. A router is stale if it's present in the composite url,
 * but its current route doesn't match the composite url
 * @param {string} url composite url - can contain a single or multiple urls separated by ";"
 */
export const preloadAllRouters = url => preloadAllRoutersFromUrlPairs(getUrlSegments(url))