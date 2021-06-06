import { RoutifyRuntime } from './Instance/RoutifyRuntime.js'
import Router from './Router/Router.svelte'

import { globalInstance } from './Global/Global.js'
import { AddressReflector } from './Router/urlReflectors/Address.js'
import { LocalStorageReflector } from './Router/urlReflectors/LocalStorage.js'
import { InternalReflector } from './Router/urlReflectors/Internal.js'

if (typeof window !== 'undefined') {
    const __routify = window.__routify
    window.__routify = Object.assign(globalInstance, __routify)
}

export const Routify = RoutifyRuntime

export {
    Router,
    globalInstance,
    AddressReflector,
    LocalStorageReflector,
    InternalReflector,
}