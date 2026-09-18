---
sidebar_position: 8
title: "Canvas Size and Layout"
sidebar_label: Canvas Size
description: How tall the 3D view is, how wide it goes and where the options panel sits, set per project from Storefront settings.
tags: [shopify, 3d-bits, canvas, layout]
---

# Canvas Size and Layout

This used to be the hardest part of setting up 3D on a product page, and it involved editing your theme's CSS. It does not any more.

With the app embed, the 3D view takes the width available to it on the product page, and you control the height and the layout from the app. No CSS, no theme editing, and different products can be set up differently.

## Which placement you are on

Everything on this page depends on one setting above it, so read this first.

**Placement on the product page** is the first choice in the project's Storefront settings, under **Placement and layout**, and it has two options.

**App embed** is the default, and it is what the rest of this page describes. 3D Bits places the viewer and the options panel on every linked product for you, and the settings below decide how.

**Theme template blocks** hands placement to you instead. The app embed stands down on this project's products, the layout and sizing fields disappear from the card, and none of them reach the page. A block is sized by wherever you put it. See [Products placed with theme blocks](#products-placed-with-theme-blocks) at the end.

:::warning A block placement needs a block
Switching a project to theme template blocks and publishing leaves the product page with nothing on it until you add a **BITBYBIT VIEWER** block to that product template in the theme editor. This is why the placement change is the one layout setting that waits for your next publish rather than going live on Save - so a live page cannot go blank before you have placed the block.
:::

## Where the settings are

Open a project in the 3D Bits app and find the **Storefront settings** card. It is a short list of sections, each closed to one line that sums up its current values; open a section to change it and the others fold away. Everything on this page lives in three of them: **Placement and layout**, **Sizes per device** and **Spacing and advanced selectors**.

**Save settings** applies them to your published products right away. You do not need to publish again, and there is nothing to wait for beyond your theme's own page cache. Until you press it, the card shows an **Unsaved changes** badge, and afterwards it says **All changes saved**.

:::info Three settings in this card are the exception
Three settings in the same card do wait for your next publish, because each one changes something outside the product page: the **charging method** (it regenerates the pricing setup), the **generated product name prefix** (it renames the products the app generated), and **Placement on the product page**. Everything to do with height, width and layout is immediate.
:::

## The preview, and the four kinds of screen

**Sizes per device** opens on four buttons - Desktop, Laptop, Tablet, Phone - and under each a small drawing of the product page as that screen will show it, built from the settings as you change them, before you save, with that screen's settings beside the drawing. The 3D view, the controls panel, your theme's product info and buy buttons are all there, and so are the areas you placed in the Composer, so you can see where a price strip or a corner control lands on a phone.

Screens fall into those four kinds by width, and the storefront follows the same rule:

| Screen | Width | What it does by default |
| --- | --- | --- |
| Phone | up to 769 pixels | Stacked: the 3D view on top, the controls below it |
| Tablet | 770 to 1023 pixels | Stacked, unless you choose side by side below |
| Laptop | 1024 to 1535 pixels | Side by side: the controls beside the 3D view |
| Desktop | 1536 pixels and wider | Side by side |

An iPad held upright is a tablet; the same iPad turned sideways is a laptop. Each device button shows only the settings that apply to it, which is the easiest way to read the rest of this page: pick the device, adjust, look at the drawing.

## Height

The setting you will actually use. There are six choices, each shown with a small picture of what it looks like, and there are two of them: a **side-by-side** height, on the Desktop button, and a **stacked** height, on the Phone button.

**Default** leaves the height to 3D Bits, which sizes the view from the layout you chose and the visitor's screen. Fine if you have no opinion.

**Full screen** takes the whole screen.

**Tall** takes three quarters of the visitor's screen. This is what a new project starts with on desktop, and it is the right answer for most configurators, since the product is the point of the page.

**Half** takes half the screen, which suits a product page where the description and specifications matter as much as the visual.

**Compact** takes 40% of the screen. Use it when 3D is a supporting detail rather than the main event.

**Custom** lets you type an exact figure and pick the unit.

The two want different answers, which is why they are separate. A view that fills three quarters of a laptop screen can swallow an entire phone, leaving the shopper scrolling to find the buy button. If you are unsure, try Tall beside the panel and Half stacked.

The height follows the arrangement, not the device: a tablet that stacks uses the stacked height, a tablet you set to side by side uses the side-by-side height. Laptops always use the side-by-side one.

### Pixels or percentage

Custom offers three units: **px**, **svh** (a percentage of the screen) and **vh**.

A percentage of the screen is usually the better choice. It keeps the same proportion of the page across a small laptop and a large monitor, so the layout feels deliberate everywhere. `svh` is the one to prefer of the two percentage units, because it accounts for the address bar that appears and disappears on a phone.

Pixels are worth using when the product has a fixed aspect you want to preserve, or when you are matching the height of something else in your template exactly.

## Width

You rarely need to touch this, because the view fills whatever width the product section gives it.

**Max width**, on the Desktop button, stops it getting too wide on large monitors, and takes 400 to 4000 pixels. On a very wide screen a full-width 3D view can push the buy button below the fold, and capping the width keeps everything in one eyeful. When the view is narrower than the page it centres itself. Leave it empty for full width.

**Side offset** is a **gutter between the 3D view and the edges of the page**, from 1 to 400 pixels. It pulls the view *in*, not out. Its purpose is alignment: set it to your theme's own page padding and the 3D view lines up with the text and images above and below it. Dawn uses 50. Leave it empty and the view runs edge to edge - unlike the mobile side margin below, 0 is not a value here.

:::warning Side offset narrows the view
This is the setting merchants most often reach for when the 3D view already looks too narrow, and it makes that worse. If your view is cramped, *reduce* the side offset or clear it, and check the max width too. See [If it still does not look right](#if-it-still-does-not-look-right).
:::

**Side margin**, on the Phone button, is the same idea whenever the layout is stacked - phones, and tablets unless set to side by side - and it applies to the 3D canvas, the controls panel and any area strips around the panel. It takes 0 to 200 pixels. Leaving it empty gives you 5, which is the small breathing room most themes want. Set it to 0 for edge to edge. Phones also ignore the max width and the side offset above, because a narrow screen has no room to give away.

**Top margin** and **Bottom margin**, under **Spacing and advanced selectors**, add space above and below the whole configurator, on every screen size. Both take 0 to 400 pixels, and both are empty by default. Reach for these when the configurator is crowding the content around it.

## Where the options panel sits

Two layouts, under **Placement and layout**, and this is more consequential than the numbers above.

**Inline** puts the full-width 3D view on top and everything else below it. It is the safest choice, because it asks nothing of your theme's structure, and it is closest to how a conventional product page reads. Good for a long list of options.

**Split** puts the options panel beside the 3D view, on the left or the right as you choose. The shopper sees the product and the choices at once, which is what you want for a configurator with a handful of options. New projects start here.

Split detects your theme's structure in order to take over the product section. Inline does not, which is why it is the fallback when a theme misbehaves.

:::info The Overlay layout was retired
Projects that used it now render as Split. If you want controls floating over the 3D view, place them in one of the canvas areas in the Composer's Layout tab - a corner, an edge midpoint, or the centre - which does the same thing without a second panel to size.
:::

**Controls side** puts the panel on the left or the right. It applies to Split only.

**Controls panel content** decides what shares the panel. **3D Bits GUI only** is the recommendation: the panel shows your configurator and nothing else, and your theme's own title, price, options and cart form stay intact below the 3D area. **Merge with theme info** brings the theme's title, price and options into the panel alongside your controls.

**Controls panel width** sets how wide the options column is, from 300 to 800 pixels, and it is one setting per kind of screen. The Desktop button holds the width for wide screens, and it is what laptops and tablets use until you give them their own: the Laptop button has a width for 1024 to 1535 pixel screens, the Tablet button one for tablets set to side by side. Leave a narrower screen's width empty and it inherits the wider one's. Wider suits controls with long labels or image swatches; narrower gives more room to the product. Whatever you enter, the column never takes more than half of the space, so a width tuned for a large monitor cannot squeeze the 3D view on a laptop.

**Layout on tablets**, on the Tablet button, is the one arrangement you choose. Tablets stack by default, like phones, because an upright iPad is too narrow for a panel of any useful width beside the 3D view. Choose **Side by side** if your controls are few and short. Phones always stack and laptops always sit side by side; neither is a setting.

:::info Projects published before tablets had their own setting
Tablets used to get the side-by-side layout. When the app started telling tablets apart, every published project moved to the stacked default on 770 to 1023 pixel screens, with no action from you. If you preferred the old arrangement, open the project, pick **Side by side** on the Tablet button and save - it applies right away.
:::

## If it still does not look right

Work through these in order.

**Check the side offset and max width first.** These are the two settings that can make the view narrower than the space available, and both are easy to set once and forget. Clear them and see what the page does on its own.

**Then look at your theme.** A theme that keeps product media inside a narrow column will keep the 3D view there too, and no setting in the app widens a container the theme has already decided is narrow. Most themes expose a maximum content width in the theme editor, and widening it affects the whole page rather than only the configurator.

**Then move the configurator.** The app embed's [Placement](/learn/3d-bits/theme-blocks/app-embed#embed-placement) setting puts it somewhere else in your template - your product media area, for example - which may have far more room than wherever it landed by default.

**Then try Inline.** Split has to work out which part of your theme is the product section and which part is the options panel. When a theme is unusual it can get that wrong. Inline makes no such guess.

**Advanced layout selectors**, at the end of the **Spacing and advanced selectors** section, is the last resort and needs someone comfortable with CSS selectors. **Product section selector** names the container the layout should take over, **Controls panel selector** names the element treated as the scrollable options panel - whatever you name there, the add-to-cart form is never hidden - and **Additionally hide** removes extra elements in the Split layout, such as a theme gallery the automatic detection missed. All three are empty by default, which means automatic detection.

## Products placed with theme blocks

If you set **Placement on the product page** to theme template blocks, none of the settings on this page apply.

The app embed stands down for that project's products, so nothing on the page is coming from these settings. The **BITBYBIT VIEWER** block has no height, width or layout settings of its own - it renders into the container you dropped it into, and takes its box from your template at that spot. Sizing it is a theme job, through your theme's own section settings or your own CSS.

That is the trade-off. You get pixel-precise placement, and you give up the per-project sizing controls. If you wanted the controls back, switch the project to the app embed, publish, and remove the block from the template.

[Theme Blocks](/learn/3d-bits/theme-blocks) covers when placing blocks yourself is worth it.

## Older products set up by hand

Products configured through the legacy [metafields](/learn/3d-bits/admin/metafields) workflow predate these settings and are still sized by your theme's layout and any CSS you added at the time. Nothing about them has changed or will stop working.

Rebuilding one as a project and publishing it moves it onto the settings described here, and lets you remove whatever CSS you were using to control it.
