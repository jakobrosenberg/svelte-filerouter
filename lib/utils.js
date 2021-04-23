import fse from 'fs-extra'
import { pathToFileURL, fileURLToPath } from 'url'
import { dirname } from 'path'

/**
 * saves value to file and returns a dynamic-import function that returns the value
 * @param {string} file file to save data to
 * @param {any} value JSON.stringifiable value
 */
export const writeDynamicImport = (file, value) => {
    const content = JSON.stringify(value, null, 2)
    fse.outputFileSync(file, `export default ${content}`)
    return () => import(pathToFileURL(file).href).then(r => r.default)
}

export const createDirname = meta => dirname(fileURLToPath(meta.url))

export function hookHandler() {
    let callbacks = []
    const hook = cb => {
        callbacks.push(cb)
        return () => {
            const index = callbacks.indexOf(cb)
            callbacks.splice(index, 1)
        }
    }
    hook.callbacks = callbacks
    hook.callCallbacks = attr => hook.callbacks.forEach(cb => cb(attr))

    return hook
}