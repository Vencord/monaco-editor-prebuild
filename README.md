# @vencord/monaco-editor

This repo contains the necessary files to create an optimized build of [monaco-editor](https://microsoft.github.io/monaco-editor/) for [vencord](https://vencord.dev/)

# How it works

With a few tricks, we can get monaco down to *only* 4.9MiB (from 14MiB)

[esbuild](https://esbuild.github.io/), the build system used for vencord, just isn't enough. While esbuild is a great tool, it doesn't have support for anything like the [emitFile](https://rollupjs.org/plugin-development/#this-emitfile) plugin context method provided by rollup.

esbuild also provides us with a blessing in disguise, it doesn't support the standard syntax for bundling workers

```js
// file.js
const worker = new Worker(new URL("./worker.js", import.meta.url))
```
this is supported in virtually every other bundler: [vite](https://vite.dev/guide/features#import-with-constructors), [rspack](https://rspack.rs/guide/features/web-workers#usage), [webpack](https://webpack.js.org/guides/web-workers/#syntax), [parcel](https://parceljs.org/languages/javascript/#web-workers), [rolldown(experimental)](https://rolldown.rs/reference/Interface.ResolveIdExtraOptions#kind) just to name a few

if esbuild *did* support this feature, the bundle size would be a whopping 14MiB, because of all the workers that monaco imports; however, because esbuild erroneously does not bundle workers, the bundle is only 6MiB. Our bundle manages to just beat it at 4.9MiB.

## Trick #1: Codegen
*everyone's favorite hammer.*

monaco-editor providers two entry points. `editor.main` and `editor.api`. When you import `editor.main` not only do you include the main editor, you also include every feature it has, and support for every language it has. This includes some very heavy dependencies, such as the entire typescript language server, a css, scss, less, json, and html parser and a ton of language definitions. `editor.api` includes only the core editor api, with the downside that you have to manually select the languages and features that you want. This isn't that simple as some languages also require separate build config for their respective workers (html, css, json and js/ts). With [codegen](./scripts/monacoEditor.ts), we can automate this process, and easily only include the features we need.

## Trick 2: Common sense??
*you'd think*

Imagine a bundle like this

```js
// file 1
import shared from "large-shared-dep";
do_thing(shared);
const worker = new Worker(new URL("./worker.js", import.meta.url));
// worker.js
import shared from "large-shared-dep";
do_worker_thing(shared);
```

you would want `large-shared-dep` to actually be shared, but bundlers will actually bundle the worker as a single file, duplicating the dependency. by using the `emitFile` plugin context method, we can instead create a separate entry chunk, so the bundler uses shared chunks for shared dependencies. With this, we can save an additional 1.1MiB over esbuild.

