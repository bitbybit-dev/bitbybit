# Content & Asset Licensing

This repository uses a split licensing model:

## MIT License (Code)

All source code in the following directories is licensed under the [MIT License](./LICENSE):

- `packages/` — All NPM package source code
- `languages/` — Language/localization files
- `examples/` — Example application source code

## Bitbybit OCCT Kernel (MIT, closed source)

The Bitbybit OCCT Kernel (`bitbybit-dev-occt*.wasm`, built on OCCT) that the `@bitbybit-dev/occt` package ships is MIT-licensed like the package ([LICENSE](./packages/dev/occt/LICENSE)), but it is not built from this repository: the source of its C++ kernel layer is not published. OCCT and the other open-source components compiled into it keep their own licenses; [NOTICE](./packages/dev/occt/NOTICE) lists them.

## Documentation Text (CC BY 4.0)

The guides in `guides/` and `API.md` are licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/). You are free to share and adapt the text with attribution.

The documentation site, [learn.bitbybit.dev](https://learn.bitbybit.dev), is no longer kept in this repository and is published under its own terms. The versions of it in this repository's history, the `docs/` folder, keep the licences they were published under: CC BY 4.0 for the Markdown in `docs/learn/`, `docs/api/` and `docs/blog/`, MIT for the site's source code, and the exceptions below.

## Not Licensed (Trademarks & Third-Party Assets)

The following assets are **NOT** covered by the MIT license or any open-source/permissive license:

- **Bitbybit logos and branding** — The Bitbybit name, logos, and brand assets (including `scripts/assets/` and, in this repository's history, `docs/static/img/`) are trademarks of Bit by bit developers. All rights reserved.
- **Client/partner logos and trademarks** — Logos and trademarks of third-party companies appearing in blog posts, documentation, or static assets remain the property of their respective owners and are used with permission for informational purposes only.
- **Blog post images** — Photographs, illustrations, and media of blog posts, including those in this repository's history under `docs/blog/`, that are not code snippets may be subject to separate copyright.

### What This Means

- ✅ You **can** freely use, modify, and distribute all source code under MIT
- ✅ You **can** use, modify and redistribute the Bitbybit OCCT Kernel under MIT (the C++ source of its kernel layer is not published)
- ✅ You **can** share and adapt the guides and `API.md` with attribution (CC BY 4.0)
- ❌ You **cannot** use Bitbybit or third-party logos/trademarks without permission
- ❌ You **cannot** imply endorsement by Bitbybit or its clients

If you have questions about using any assets, please open an issue or contact us.
