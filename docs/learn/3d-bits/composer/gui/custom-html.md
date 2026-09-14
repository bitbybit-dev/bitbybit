---
sidebar_position: 9
title: "Custom HTML"
sidebar_label: Custom HTML
description: What a Custom HTML element keeps, what it removes, and how its CSS is scoped.
tags: [3d-bits, composer, gui, layout, html]
---

# Custom HTML

The **Custom HTML** element in the [Layout](/learn/3d-bits/composer/gui/layout) tab places a fragment of your own HTML in the panel, with its own CSS. It is for content the other elements cannot express: a table of measurements, a badge, a footnote with a few words in bold, a short definition list. It needs the Standard or Pro plan.

It is not a way to run code on your product page. The panel rebuilds your markup from a fixed list of text-formatting elements before it draws anything, and everything outside that list is removed together with whatever it contained. That is what makes it safe to paste a snippet you did not write yourself, and it is the same in the Composer preview and on the storefront.

## What survives

These elements are kept: `a`, `abbr`, `b`, `bdi`, `bdo`, `blockquote`, `br`, `caption`, `cite`, `code`, `dd`, `del`, `details`, `dfn`, `div`, `dl`, `dt`, `em`, `figcaption`, `figure`, `h1` to `h6`, `hr`, `i`, `img`, `ins`, `kbd`, `li`, `mark`, `ol`, `p`, `pre`, `q`, `s`, `samp`, `small`, `span`, `strong`, `sub`, `summary`, `sup`, `table`, `tbody`, `td`, `tfoot`, `th`, `thead`, `time`, `tr`, `u`, `ul` and `wbr`.

These attributes are kept, on every element: `class`, `title`, `dir`, `lang`, `aria-label` and `aria-hidden`. A few more are kept where they belong: `href` and `target` on links, `src`, `alt`, `width`, `height` and `loading` on images, `colspan`, `rowspan` and `scope` on table cells, `start`, `type` and `reversed` on ordered lists, `datetime` on `time`, `open` on `details`, and `cite` on quotes.

A link's `href` has to be a web address (`https://` or `http://`), a `mailto:` or `tel:` address, or a page on your store (`/pages/care`, `#top`, `?variant=2`, `./care`). A `target` may only be `_blank`, and a link that opens a new tab is given `rel="noopener noreferrer"` whatever you wrote. An image's `src` has to be a web address, a store path, or an embedded image (a `data:image/...` URL - PNG, JPEG, GIF, WebP, AVIF or SVG; an SVG inside an image cannot run anything).

## What is removed

Everything else. In particular:

- `script`, `style`, `iframe`, `object`, `embed`, `video`, `audio`, `canvas`, `form`, `input`, `button`, `select`, `textarea`, `base`, `meta`, `link`, `template` and `noscript`, each with everything inside it.
- Inline SVG and MathML.
- Every `on...` event handler attribute, every `style` attribute, and every `id`.
- `javascript:` and `data:` links, and any `target` other than `_blank`.
- HTML comments.

The Composer tells you what went. Under the HTML box a note reads, for example, *Removed on render: script, onclick*. The storefront removes the same things without saying so, and at publish time a warning names any Custom HTML element that still contains them.

There are limits on size: about 16,000 characters of markup, 1,500 elements, and 24 levels of nesting. A fragment beyond those is refused in full and the element renders nothing, which the Composer also tells you.

## Styling it

Put styling in the **CSS** box, not in `style` attributes, which are removed. The CSS applies to this element only: it is scoped to the element's own shadow root, so a rule like `p { margin: 0 }` reaches the paragraphs you wrote here and nothing else in the panel. The panel's fonts, text colour and every `--bb-*` theme variable are inherited, so `strong { color: var(--bb-accent) }` follows the theme.

The reverse is also true: the panel's global custom CSS under [Style](/learn/3d-bits/composer/gui/style-and-translations) cannot reach inside a Custom HTML element. Give the element the rules it needs in its own box.

## Translating it

The whole fragment is one translatable string, listed under the element's id in the Translations tab, so a locale can carry its own markup. Links inside it follow the same destination rules in every language.
