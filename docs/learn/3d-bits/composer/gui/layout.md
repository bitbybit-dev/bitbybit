---
sidebar_position: 2
title: "Layout"
sidebar_label: Layout
description: Arranging your controls into sections, tabs and accordions, and placing parts of the panel elsewhere on the product page.
tags: [3d-bits, composer, gui, layout]
---

# Layout

The Controls tab decides what you ask. The Layout tab decides how it is arranged and what else appears alongside it.

## Elements

You build the panel from elements, added with **Add Element**.

**Control** places one of your controls. This is how a control gets onto the page: adding a control in the Controls tab creates the question, and placing it here decides where it appears.

**Section** groups elements under a heading. The simplest way to break a long panel into parts that make sense, like Materials, Dimensions, Extras. It takes a title and an optional description.

**Row** lays its children out in a horizontal line, wrapping onto a new line when they no longer fit. It is what you reach for when two things belong side by side rather than stacked: a label beside its input, a price beside a quantity, a strip of buttons. Its children keep everything they have anywhere else - their conditions, their greying out and their pricing all still apply. Besides an optional title, a row has a **Gap** in pixels between its children, an **Align** setting for how they line up across it (centre, top, bottom, equal height, or by the first line of their text), a **Justify** setting for how leftover horizontal space is shared out along it, and **Wrap**, which is on by default. Turn wrapping off only for a row you know stays narrow, because otherwise the children overflow.

**Accordion** does the same as a section but collapses, which is how you keep a panel with many options from becoming a wall. Put the choices most shoppers change at the top, expanded, and fold the rest away. It can carry an icon or small image beside its title.

**Tabs** split the panel into pages the shopper switches between. Good when your product has genuinely separate areas of choice, and worse than accordions when the choices interact, since a shopper cannot see both at once. You choose which tab opens first, and each tab has its own visibility and availability conditions.

**Text** and **Message** add words. Text is plain explanation, in one of four styles from heading down to caption. Message is a highlighted note, for a lead time or a warning about a particular combination, and it comes in info, success, warning and error flavours. Both can be set to appear only under certain conditions.

**Image** places a picture, useful for a diagram explaining what a measurement refers to. It takes alt text, an optional caption and a maximum height.

**Divider** is a line - or, set to **Empty space**, nothing at all. The second is how you get breathing room between two groups without drawing anything across the panel. Either way you set the size in pixels.

**Parts list** shows what the configuration is made of, drawn from the [Parts](/learn/3d-bits/composer/gui/parts) tab. It lists labels and quantities, and never shows your internal part numbers. You can turn the quantities off, and set what it says when the configuration resolves to no parts at all - by default it simply hides itself. Parts themselves need the Pro plan.

Three more options are worth knowing:

- **Group rows** decides whether the list reads like your parts tab or like the order. Left as *one row per part*, it prints exactly what you authored. Set to *one row per product*, any product that several parts point at gets a row carrying the total for that product, with those parts listed underneath it. Use it when your bill of materials names the same product more than once - four shelf positions each fitted with the same bracket read as four rows of one, while the cart charges a single line of four, and a shopper comparing the two concludes something went missing. Like every row in the list, the number is for one configured item: a shopper buying two is charged twice it. Parts nested inside an assembly are left as they are, because grouping them would pull them out from under the part they belong to.
- **Show each part's picture** puts the linked product's image beside each row. Only parts linked to a store product have one, and a part linked before pictures were recorded shows none until you **Refresh linked products** on the project page - see [Linked products](/learn/3d-bits/pricing/linked-products). Size the pictures under [Style](/learn/3d-bits/composer/gui/style-and-translations).
- **Let the shopper fold the list away** puts the list behind a toggle, the way the price breakdown can be. The heading stays visible while it is shut, so a long bill of materials does not push your buy button off the screen. You choose whether it starts open.

**Price** shows the running total. Add it if you are charging for options, otherwise your shopper is choosing without knowing the cost. It can show an itemised breakdown, which is worth doing since a total that changes without explanation makes people suspicious.

:::note The Price element needs pricing switched on
It renders nothing at all until pricing is enabled in the [Pricing](/learn/3d-bits/composer/gui/pricing) tab. If you have placed one and the panel shows no total, that is the first thing to check.
:::

**Quantity** lets them buy several of the configured item. It is the familiar `- N +` stepper: the displayed price multiplies by it, the cart line ships at it, and on the product page it stays in step with your theme's own quantity input. The Add to cart element hides its own built-in stepper when this element is present, so the two never disagree.

**Add to cart** places a buy button inside your panel, for when you have hidden your theme's own one to keep the flow in one place. You set the button text, the success and error messages, whether it shows its own quantity stepper (or takes the quantity from one of your numeric controls), and where the shopper goes afterwards - stay on the page, go to the cart, or go to checkout.

**Confirmation** appears after adding to cart, and can offer the shopper a link back to their configuration, so they can return to it or send it to someone.

:::note Confirmation has two prerequisites
It reacts to an **Add to cart** element, so without one in the panel it never appears - Composer warns you when that is the case. The copyable link additionally needs the configuration to be remembered in the URL, which is a setting in the [Settings](/learn/3d-bits/composer/gui/settings) tab.
:::

**Validation summary** collects any outstanding problems in one place. Each entry is a link: clicking it opens whichever accordion or tab the offending control is hiding in, scrolls to it and puts the cursor in it. It hides itself while everything the shopper can see is valid.

**Download PDF** gives the shopper a document of what they designed. The button renders nothing unless the customer document is enabled and designed under [PDF Reports](/learn/3d-bits/composer/gui/pdf-reports). Pro plan.

Sections, rows and accordions can hold other elements, and each tab of a Tabs element holds its own, so you can nest as deeply as the product needs. Every element also offers **Clone Element**, **Move To** for shifting it into another container or back out to the top level, and - for sections, rows, accordions and tabs - **Convert To**, which turns one into another without rebuilding its contents. A section that has grown into two short things sitting awkwardly on top of each other becomes a row in one click.

## Width and grow

Every element, of every type, carries a **Width**: a number and the unit it is measured in - `px`, `%`, `rem` or `ch`. Leave it empty and the element fills the space it is given, which is what almost all of them should do.

Width behaves differently inside a row, where it is a starting size rather than a final one. A second field appears there: **Grow**, the share of the row's leftover width this element takes. Zero, the default, keeps the element at its natural size. Two children at 1 each split the space evenly between them, and 2 against 1 takes twice as much. Grow does nothing outside a row, and Composer only offers it where it works.

## Showing and greying out

Every element, not just a control, carries two conditions. **Visible when** decides whether it is on the page at all. **Enabled when** leaves it on the page but greys it out, with a **Disabled hint** explaining why - which is usually kinder than making something vanish.

Both cascade. Disable a section and everything inside it is greyed out too, at any depth, and a control with no hint of its own borrows the nearest one above it. Anything a shopper cannot reach is also never charged for.

### Visible, or just unavailable

The choice between the two is a choice about what the shopper learns.

Hide something when its absence carries no information. A lining colour on an unlined bag is not a fact worth communicating - it is clutter, and removing it makes the panel shorter.

Grey something out when the absence *is* the information. A size you do not make in oak, shown crossed out with "not available in oak", tells the shopper something true about your range. Remove it instead and they conclude you do not offer that size at all, which is worse for both of you.

Neither costs the shopper money. Nothing inside a greyed element is charged, exactly as nothing hidden is, and checkout holds to the same conditions - so a shopper is never billed for something the panel would not let them touch.

:::note A control's own condition lives on the Controls tab
Place a control here and you will see its Visibility section point you back at the Controls tab. That is deliberate: one condition, in one place, and the same one that decides whether the control is charged. If a placement from an older edit still carries a condition of its own, Composer says so and offers to clear it - the two are combined, so the control appears only when both match, which is rarely what anyone meant.
:::

## Areas: putting panel parts elsewhere

By default the whole panel sits together beside the 3D view. Areas let you break that up.

Each top-level element carries an **Area** field, and there are seven built-in choices:

| Area | Where it lands |
|---|---|
| **Main panel** | The default. The panel beside the 3D view. |
| **3D canvas - top left, top right, bottom left, bottom right** | Overlaid on the corners of the 3D view. |
| **3D canvas - centre** | Overlaid in the middle of the 3D view. |
| **Near the buy buttons** | Immediately after your theme's add to cart form. |

Canvas corners suit a small control that belongs visually on the product, like a colour switcher sitting over the model. The centre overlay suits something that should interrupt, such as a confirmation after adding to cart. The buy area suits things decided at the last moment, like quantity or a gift note.

On a narrow screen the four corner areas stop overlaying the model and stack underneath the panel instead, because a phone has no room for anything floating over the view. The centre overlay stays where it is.

:::warning The Area field is honoured on top-level elements only
An element nested inside a section, an accordion or a tab renders where it sits, whatever its area says. The field is typed on every element, so nothing stops you setting it deeper in the tree - it simply has no effect there, and Composer only shows it where it will work. If you want a control in a canvas corner, it has to be a top-level element in the panel.
:::

### Zone behaviour: how wide an area is, and folding it away

Above the custom areas there is a **Zone behaviour** block, with a row for each of the seven built-in areas. Each one starts on its default - full width, no fold toggle - behind a **Configure** button, and a **Reset** puts it back there.

This is where the width of the panel column is set, and it is not settable anywhere else. **Width**, **Smallest width** and **Largest width** each take a number and a unit (`px`, `%`, `rem` or `ch`). On the main panel the width sets the controls column. On the four canvas corners it replaces the built-in cap of 60% of the view, which is what you reach for when a corner control is coming out cramped.

**Shopper can fold it away** adds a toggle that collapses that area's contents, leaving only the toggle over the canvas. It is the answer to a corner control that is useful but keeps covering the product. **Start folded** decides which state it opens in; after that the shopper's own choice sticks as they carry on configuring. **Show the toggle on** limits the toggle to every screen, phones only - 769 pixels and below - or desktop only. **Toggle icon** puts one of the built-in icons in place of the default chevron, and **Toggle corner** pins the toggle to a particular corner instead of following the area's own.

An area with nothing in it draws nothing, whatever you set here.

### Your own areas

**Custom areas** put elements anywhere else on the product page. Each one is an **id** of your choosing, a **CSS selector** that finds a spot in your theme, and a **Position** saying where to land relative to what the selector matched - append or prepend inside it, or before or after it. Assign an element to that id and it appears there.

That is how you spread the panel across the product page, with material choices near the title and personalisation near the buy button.

Areas fail softly, by design. If a selector matches nothing on the live page - the theme changed, or the element only exists on some templates - the elements assigned to it fall back to the main panel rather than disappearing. The same happens to elements pointing at a custom area you have since deleted.

You can also override where an area lands by placing a [GUI Controls block](/learn/3d-bits/theme-blocks/bitbybit-gui) in your theme. The block claims one area and hosts it wherever you drop it in the theme editor, which is useful when a selector cannot express the position you want. Its area list does not offer the canvas centre - if that is the area you want, type `canvas-center` into the block's **Custom area id** field instead.

Elements you do not assign go to the main panel, so you only need to think about this for the ones you want moved.

## Previewing as you go

While the GUI section is open, the right side of Composer shows the panel itself rather than the 3D view, at desktop or mobile width. Elements you have sent to other areas are drawn as separate labelled blocks, so you can see what each area actually contains.

The preview has two modes. **Preview** behaves as the page does: use the form, watch conditions react. **Inspect** adds an editing layer - hovering outlines what you are pointing at, clicking still works as it does for a shopper, and **double-clicking** opens and highlights that element in the editor. On a panel with forty elements this saves a lot of scrolling.

If you have translations, a language toggle appears here too, so you can read the panel as a shopper in that language would. A reset button puts every value back to its default.

Check mobile early and often. A panel that is comfortable on a wide screen can become an enormous scroll on a phone, and most of your shoppers are on a phone.
