<script>
    import { Router } from './Router.js'
    import { onDestroy as _onDestroy } from 'svelte'
    import {
        getUrlFromEvent,
        resolveIfAnonFn,
        shouldIgnoreClick,
    } from '../utils/index.js'
    import ComposeFragments from '../renderer/ComposeFragments.svelte'
    import { get } from 'svelte/store'
    import AnchorDecorator from '../decorators/AnchorDecorator.svelte'
    import { normalizeDecorator } from '../renderer/utils/normalizeDecorator.js'
    import { RouterContext } from '../renderer/RenderContext.js'

    /** @type {Router} */
    export let router = null
    export let routes = null
    export let decorator = null

    /** @type {RoutifyRuntimeOptions['urlReflector']} */
    export let urlReflector = null
    /** @type {RoutifyRuntimeOptions['instance']} */
    export let instance = null
    /** @type {RoutifyRuntimeOptions['urlRewrite']} */
    export let urlRewrite = null
    /** @type {RoutifyRuntimeOptions['url']} */
    export let url = null
    /** @type {RoutifyRuntimeOptions['name']} */
    export let name = null
    /** @type {RoutifyRuntimeOptions['rootNode']} */
    export let rootNode = null
    /** @type {RoutifyRuntimeOptions['passthrough']} */
    export let passthrough = null
    /** @type {RoutifyRuntimeOptions['beforeRouterInit']} */
    export let beforeRouterInit = null
    /** @type {RoutifyRuntimeOptions['afterRouterInit']} */
    export let afterRouterInit = null
    /** @type {RoutifyRuntimeOptions['beforeUrlChange']} */
    export let beforeUrlChange = null
    /** @type {RoutifyRuntimeOptions['afterUrlChange']} */
    export let afterUrlChange = null
    /** @type {RoutifyRuntimeOptions['transformFragments']} */
    export let transformFragments = null
    /** @type {RoutifyRuntimeOptions['onDestroy']} */
    export let onDestroy = null
    /** @type {RoutifyRuntimeOptions['plugins']} */
    export let plugins = null
    /** @type {RoutifyRuntimeOptions['queryHandler']} */
    export let queryHandler = null
    /** @type {import('../decorators/AnchorDecorator').Location}*/
    export let anchor = 'wrapper'
    /** @type {ClickHandler}*/
    export let clickHandler = {}

    export let props = {}

    /** @type {Partial<RoutifyRuntimeOptions>}*/
    const options = {
        instance,
        rootNode,
        name,
        routes,
        urlRewrite,
        urlReflector,
        passthrough,
        beforeRouterInit,
        afterRouterInit,
        beforeUrlChange,
        afterUrlChange,
        transformFragments,
        onDestroy,
        plugins,
        queryHandler,
        clickHandler,
        anchor,
    }

    router = router || new Router(options)
    router._claimed = true
    const context = new RouterContext({ router })
    router.context = context
    context.anchorLocation = anchor

    router.onMount.run({ context, router })
    context.decorators = context.decorators.map(normalizeDecorator)

    $: if (url && url !== router.url.internal()) router.url.replace(url)
    $: activeRoute = router.activeRoute
    $: context.childFragments.set($activeRoute?.fragments || [])
    $: context.route = $activeRoute

    $: router.log.debug('before render', get(context.childFragments)) // ROUTIFY-DEV-ONLY

    /** @param {HTMLElement} elem */
    const initialize = elem => {
        elem =
            router.anchor === 'parent' || router.anchor === 'wrapper'
                ? elem
                : elem.parentElement
        router.setParentElem(elem)

        // todo check that a router hasn't already been added to this element
        elem['__routify_meta'] = { ...elem['__routify_meta'], router: router }

        let clickScopeElem = resolveIfAnonFn(router.clickHandler?.elem || elem, [elem])

        // passthrough should be handled by clickHandler.callback instead?
        if (!router.passthrough) {
            clickScopeElem.addEventListener('click', handleClick)
            clickScopeElem.addEventListener('keydown', handleClick)
            clickScopeElem.addEventListener('mouseover', handleHover)
        }
    }

    /**
     * @param {MouseEvent} event
     */
    const handleHover = event => {
        const { url, state } = getUrlFromEvent(event)
        const urlOrFalse = router.clickHandler.callback?.(event, url) ?? url

        const shouldPrefetch =
            typeof urlOrFalse === 'string' &&
            event.target['closest']('[data-routify-prefetch-data]')?.dataset
                .routifyPrefetchData === 'hover'

        if (shouldPrefetch) router.url.push(urlOrFalse, { prefetch: true, ...state })
    }

    /**
     * @param {PointerEvent|KeyboardEvent} event
     */
    const handleClick = event => {
        if (shouldIgnoreClick(event)) return

        const { url: eventUrl, state } = getUrlFromEvent(event)

        const url = router.clickHandler.callback?.(event, eventUrl) ?? eventUrl

        if (typeof url === 'string') router.url.push(url, state)
    }

    if (typeof window !== 'undefined') _onDestroy(() => router.destroy())
</script>

<AnchorDecorator onMount={initialize} style="display: contents" {context}>
    {#if $activeRoute}
        <ComposeFragments {context} options={{ decorator, props }} />
    {/if}
</AnchorDecorator>
