---
sidebar_position: 2
title: "Driving 3D Bits from Your Own Form"
sidebar_label: Custom Forms
description: The contract between your own product form and 3D Bits - what each element reports, how a change is noticed, and how field names become keys.
tags: [shopify, 3d-bits, integration, developer]
---

# Driving 3D Bits from Your Own Form

Most stores build their option panel in [Composer](/learn/3d-bits/composer) and never read this page. Composer gives you the controls, the styling, the logic and the pricing, and because those controls are ours, everything on this page is handled for you.

This page is for the other case: you have a development team, you have built or intend to build the product form yourself, and you want the 3D scene to follow it. That works well. What follows is the contract it works to, so you can build against it rather than guess at it.

:::info There are two ways in, and you can use both
3D Bits reads your page twice on every pass.

First it resolves the controls in your configuration. Any control you add in Composer with **Product page rendering** set to **External** carries a **Selector**, and the element that selector matches is read and reported under that control's **Key**.

Then everything else on the page is swept generically, and each remaining field is reported under a key derived from its `name`.

Binding by selector is the more robust of the two. The key is yours rather than your theme's, and the field is read whatever the collection mode is set to.
:::

## Use real form elements

3D Bits reads `input`, `select` and `textarea` elements, wherever they sit in the document. It also looks inside the open shadow roots of web components, so a form built from custom elements is read normally. A closed shadow root cannot be read, and nothing inside one is visible.

Reading pierces an open shadow root; being *notified* does not. A `change` event stops at the shadow boundary unless it is dispatched with `composed: true`, so a control inside a web component has to fire a **composed** change - see [How 3D Bits notices a change](#how-3d-bits-notices-a-change).

Anything the shopper can choose therefore has to exist as an actual form field. This is not an arbitrary requirement, and meeting it does you other favours. Real form elements give you keyboard navigation, screen reader support and semantic meaning for free, so a form that works with 3D Bits is also a form that works for people using assistive technology.

Consider the difference between these two approaches:

### ❌ Poor Practice - Custom Div Elements
```html
<!-- This won't work with 3D Bits and breaks accessibility -->
<div class="custom-option" onclick="selectColour('red')" data-value="red">
  <img src="red-swatch.jpg" alt="Red colour">
  <span>Red</span>
</div>
<div class="custom-option" onclick="selectColour('blue')" data-value="blue">
  <img src="blue-swatch.jpg" alt="Blue colour">
  <span>Blue</span>
</div>
```

### ✅ Good Practice - Standard Radio Buttons
```html
<!-- This works perfectly with 3D Bits and is accessible -->
<fieldset>
  <legend>Choose Colour</legend>
  <label>
    <input type="radio" name="colour" value="red" checked />
    <img src="red-swatch.jpg" alt="Red colour option" />
    Red
  </label>
  <label>
    <input type="radio" name="colour" value="blue" />
    <img src="blue-swatch.jpg" alt="Blue colour option" />
    Blue
  </label>
</fieldset>
```

:::warning Always write the type attribute
In the default **Standard inputs** collection mode, 3D Bits finds fields by their `type`. An `<input name="engraving">` with no `type` attribute is not one of them, and it is invisible. Write `<input type="text" name="engraving">` and it is read.

This does not apply to a field you bind to a Composer control by selector, which is read whatever its type.
:::

## What each element reports

Your configuration receives one entry per field. This table is the whole contract.

| Element | What your configuration receives |
|---|---|
| `<input type="radio">` | The `value` of the **checked** radio in the group, under the group's shared key. While nothing in the group is checked, the key is absent entirely. |
| `<input type="checkbox">` | `true` or `false`, from whether the box is ticked. Its `value` attribute is **never** read, and it reports on every pass whether ticked or not. |
| `<select>` | The selected option's `value`, or its visible text when the value is empty. **Plus** one true/false entry per option (see below). |
| `<input type="number">`, `<input type="range">` | The value as a number. An empty field arrives as `0`. |
| `<textarea>` | The text, always as text - never converted to a number. |
| `<input type="text">`, `email`, `tel`, `url`, `date`, `time`, `datetime-local`, `month`, `week`, `color` | The `value`, with the number rule below applied. An empty field arrives as an empty string. |
| `<input type="file">` | Bind it to a Composer control by selector and your configuration receives a temporary in-browser URL for the chosen file, which is what an image decal needs. The generic sweep only ever sees the browser's placeholder path, which is of no use. |
| `<input type="hidden">`, `password`, `search` | Not collected in **Standard inputs** mode. See [When Custom Solutions Are Necessary](#when-custom-solutions-are-necessary). |

:::warning A checkbox reports true or false, never its value
This is the one that catches people out most often. `<input type="checkbox" name="led" value="enabled">` does **not** hand your configuration the text `enabled`. It hands it `true` when ticked and `false` when not, and it hands over `false` rather than falling silent, so there is no "no value was sent" state to configure against.

Write your conditions against `true` and `false`. Keep a `value` attribute on the checkbox if your own form submission needs one - it simply plays no part here.

A radio group behaves the opposite way. Only the checked radio reports, so a group with nothing selected produces no entry at all rather than an empty one.
:::

**Values that look like numbers arrive as numbers.** A text field holding `12` arrives as the number `12` rather than the text `"12"`. Simple equality matching is unaffected either way, because it compares both sides as text. It does matter to a greater-than or less-than condition, and to a script, both of which then get a number without any conversion on your side. Dates, times, colours and anything else that is not a plain number arrive as text, and a `textarea` is never converted at all.

**A `select` reports twice.** As well as the selected value, every option in the list gets its own true/false entry keyed `<name>_<option value>`, with anything other than a letter, digit, hyphen or underscore replaced by an underscore. A `<select name="size">` with options `small` and `x large` therefore also produces `size_small` and `size_x_large`. This is how a `<select multiple>` remains usable: read the per-option entries rather than the single selected value.

## Essential HTML Patterns for 3D Bits

### Radio Buttons for Single Selections

When shoppers need to choose one option from several - material, colour, size - radio buttons are the natural fit. The `name` attribute groups the options and becomes the key, and the `value` of whichever is checked is what you configure against.

```html
<fieldset>
  <legend>Material Selection</legend>
  <label>
    <input type="radio" name="material" value="wood" checked />
    Natural Wood
  </label>
  <label>
    <input type="radio" name="material" value="metal" />
    Brushed Steel
  </label>
  <label>
    <input type="radio" name="material" value="plastic" />
    Recycled Plastic
  </label>
</fieldset>
```

Give one radio in each group a `checked` attribute. Without it the group reports nothing at all until the shopper touches it, and your scene has no starting state.

### Checkboxes for Multiple Selections

For features that are independently on or off, use checkboxes - and configure against `true` and `false`, not against a `value`.

```html
<fieldset>
  <legend>Additional Features</legend>
  <label>
    <input type="checkbox" name="led_lighting" checked />
    LED Lighting System
  </label>
  <label>
    <input type="checkbox" name="wireless_charging" />
    Wireless Charging Pad
  </label>
  <label>
    <input type="checkbox" name="premium_finish" />
    Premium Finish Coating
  </label>
</fieldset>
```

In Composer you would say that the LED geometry shows when `led_lighting` is `true`. If what you actually need is a choice between several named values rather than an on/off state, use a radio group or a `select` instead - those are the ones that report a value.

### Select Dropdowns for Space-Efficient Options

When you have many options but limited screen space, a select is a clean, accessible solution.

```html
<label for="size-selector">Product Size</label>
<select name="size" id="size-selector">
  <option value="small">Small (10cm)</option>
  <option value="medium" selected>Medium (15cm)</option>
  <option value="large">Large (20cm)</option>
  <option value="extra-large">Extra Large (25cm)</option>
</select>
```

Always give every option an explicit `value`. An option without one falls back to its visible text, which changes when you reword it or translate the page.

### Range Inputs for Continuous Values

For dimensions and other numeric values the shopper adjusts within a range.

```html
<label for="height-slider">Height: <span id="height-value">50</span>cm</label>
<input 
  type="range" 
  name="height" 
  id="height-slider"
  min="30" 
  max="100" 
  value="50"
  oninput="document.getElementById('height-value').textContent = this.value" />
```

A range fires `change` when the shopper lets go of the handle, which is exactly when you want the scene to rebuild. The `oninput` handler above only updates your own read-out; it is not what 3D Bits listens to.

### Number Inputs for Precise Values

When shoppers need to type a specific figure, a number input gives you validation and the right keyboard on mobile.

```html
<label for="width">Width (cm)</label>
<input 
  type="number" 
  name="width" 
  id="width"
  min="1" 
  max="100" 
  value="50" />
```

An empty number field arrives as `0` rather than as nothing, so give it a sensible `value` and set `min` so that a cleared field cannot quietly become a zero-sized model.

:::warning Do not name a field "quantity" and expect it to mean quantity
A field called `quantity` in your form is read like any other value and drives whatever you configure it to drive. It does not change how many units Shopify puts in the cart. Purchase quantity stays with your theme's own quantity field and with Shopify.
:::

## How 3D Bits notices a change

3D Bits listens on the **document**, not on your individual fields. That single detail explains almost every "it works when I click but not when my script sets it" report.

**`change` is the primary trigger, and it must bubble.** A native change on a real form control bubbles to the document by itself, so ordinary forms need nothing. An event you create yourself does not bubble unless you say so:

```js
// Never seen - a plain Event does not bubble
field.dispatchEvent(new Event('change'));

// Seen, as long as the field is in the ordinary document
field.dispatchEvent(new Event('change', { bubbles: true }));

// Seen from anywhere, including inside a web component's shadow root
field.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
```

**Inside a web component, it must also be composed.** Bubbling alone stops at the shadow boundary: a `change` event is `composed: false` by default, and a `composed: false` event never leaves the shadow root it was dispatched in, so the listener on the document never runs. This applies to the browser's own `change` events too - a native change fired by a control inside an open shadow root does not reach the document either. Add `composed: true` and it does. If your controls live in the light DOM, the two forms behave identically, so dispatching a composed change everywhere is the simplest thing to do.

:::warning Shadow-DOM controls that seem to work already
A widget inside a shadow root often looks like it is working without this, because `mouseup`, `touchend` and `keyup` **are** composed and trip the fallback read described below. That is the fragile path: the same widget goes quiet the moment a shopper uses the arrow keys, or your own code sets a value programmatically. A composed `change` is the reliable one.
:::

**`input` is not listened for.** A widget that only ever fires `input` is not read directly. Fire `change` as well when the value settles.

**There are fallbacks, and you should not depend on them.** Releasing the left mouse button, ending a touch, and pressing Enter each schedule a fresh read of the page shortly afterwards, anywhere on the page. This is why a click-driven custom widget often appears to work without dispatching anything. It is also why the same widget silently stops working for a shopper who changes the value with the arrow keys, or when your own code sets a value programmatically. Dispatch a `change` with `bubbles: true, composed: true` and the behaviour is the same for everyone.

**Re-reading is cheap.** Every pass compares the complete set of values against the previous one and does nothing when nothing has changed, so firing `change` more often than strictly necessary costs you nothing.

## Critical Attributes for Success

The `name` attribute is what identifies a field to your configuration, so it is worth choosing deliberately.

With **Receive input names as variants** on - which is the default, and the setting we recommend - the key is exactly the `name` attribute, with any line breaks stripped out. A field with no `name` falls back to its `id`. A field with neither gets a generated placeholder such as `input-text-no-name-id`, which is a sign you should add a name.

Turn that setting off and 3D Bits first looks for a `<legend>` **inside the field's immediate parent element** and uses that text as the key, falling back to the name or id when there is none. It never reads a `<label>`, and it does not search up the tree, so a `<legend>` in a fieldset several levels above has no effect. Both this setting and **Input collection mode** live on the project's **Storefront settings** in the app - see [Projects](/learn/3d-bits/admin/projects).

Good names are:

- **Descriptive**: `material`, `colour`, `size` rather than `option1` or `field2`
- **Consistent**: the same convention across every product you configure
- **Stable**: a rename silently breaks every condition written against the old name
- **Unique on the page**: see below

:::warning Duplicate names get a numeric suffix
Two fields with the same `name` do not conflict, but only the first keeps the plain key. The second becomes `name-1`, the third `name-2`, in document order - so a configuration written against `colour` stops matching the moment a second `colour` field appears further down the page. That is a fragile thing to depend on, and the fix is unique names.

Radio groups are deliberately exempt. Every radio in a group shares one `name` and one key, which is the whole point of a group.
:::

For example, avoid patterns like this:

```html
<!-- DON'T DO THIS - the second block silently becomes colour-1 -->
<div class="product-1">
  <input type="radio" name="colour" value="red" />
  <input type="radio" name="colour" value="blue" />
</div>
<div class="product-2">
  <input type="radio" name="colour" value="red" />
  <input type="radio" name="colour" value="blue" />
</div>
```

Instead, use unique, descriptive names:

```html
<!-- DO THIS - unique names are clear and reliable -->
<div class="product-1">
  <input type="radio" name="product1_colour" value="red" />
  <input type="radio" name="product1_colour" value="blue" />
</div>
<div class="product-2">
  <input type="radio" name="product2_colour" value="red" />
  <input type="radio" name="product2_colour" value="blue" />
</div>
```

A few of Shopify's own form fields legitimately appear more than once on a product page - `id`, `form_type`, `product-id`, `section-id`, `utf8` and `q` among them. Those are recognised, and only the first occurrence of each is read rather than being suffixed.

:::info Names with a changing number in them
Some themes append a section id to a field name, so `options[Colour]` becomes `options[Colour]-8329` and the number differs on every page load. Composer handles this with the `{{id}}` placeholder, covered in [Dynamic IDs in Input Names](/learn/3d-bits/tutorials/getting-started/common-settings#dynamic-ids-in-input-names). Note that a placeholder cannot be used in any condition that decides money - publishing refuses it, because the price shown and the price enforced could otherwise disagree. If you control the markup, a stable name is better than a placeholder.
:::

**Reading a field is not the same as recording it on the order.** 3D Bits reads your fields to drive the 3D scene and its own logic. It does not turn them into line item properties - that is your form's job, using Shopify's own `properties[...]` naming, exactly as it would be without a configurator. Only controls that 3D Bits renders itself can be set to save their value on the order.

## What Breaks the Integration

Certain HTML patterns prevent 3D Bits from detecting user selections and create barriers for users with disabilities:

### Custom Clickable Divs
```html
<!-- Don't do this -->
<div class="option" onclick="changeOption('blue')">Blue Option</div>
```

This approach fails because:
- There is no `name` and no `value`, so there is nothing to read even when the click is noticed
- Screen readers don't announce it as a selectable option
- Keyboard users can't navigate to it
- The current selection state isn't communicated to assistive technologies

### Image-Only Selections Without Form Elements
```html
<!-- Don't do this -->
<img src="option1.jpg" onclick="selectOption(1)" class="selectable">
```

While visually appealing, this pattern excludes shoppers who rely on keyboard navigation or screen readers, and there is no value for 3D Bits to read.

### JavaScript-Dependent Custom Controls
```html
<!-- Don't do this -->
<span class="custom-radio" data-value="option1">Custom Option</span>
```

A `data-value` is not a form value. Custom controls that rely entirely on JavaScript event handling also lack the semantic meaning and keyboard accessibility of native form elements.

## Testing Your Integration

To ensure your forms work correctly with 3D Bits and remain accessible:

1. **Turn on Debug Mode** and open the product page. The **Live** tab lists every field name and value 3D Bits can see, and the **GUI Setup** tab scrapes the page and hands you the field names, types and selectors as JSON, which saves working the selectors out by hand. Both tabs offer copy buttons. Turn Debug Mode off before the page goes live - it is visible to shoppers. See [Enable Debug Mode](/learn/3d-bits/tutorials/getting-started/common-settings#enable-debug-mode).

2. **Change each option and watch the Live tab.** The value should change with it. If a field is missing entirely, check that it has an explicit `type` attribute and a `name`, or switch **Input collection mode** to **All inputs**.

3. **Navigate with keyboard only.** Press Tab through every interactive element, and change a value with the arrow keys rather than the mouse. If the scene follows a mouse click but not an arrow key, you are relying on the interaction fallbacks and need to fire a bubbling `change`.

4. **Test with a screen reader.** Use a built-in screen reader such as VoiceOver on macOS or NVDA on Windows to verify that options are announced clearly.

5. **Check on mobile devices.** Make sure form elements display and function correctly on touch interfaces.

## When Custom Solutions Are Necessary

:::warning Last resort only
The approach described below should only be used when you genuinely cannot achieve your design with standard HTML form elements. It introduces complexity and accessibility problems that you then have to manage yourself.
:::

Almost every "we need a custom swatch grid" case is solved better by keeping a real control and hiding it visually. The radio still exists, so the browser handles focus, keyboard and the bubbling `change` for you, and 3D Bits reads it with no special handling at all:

```html
<fieldset class="swatches">
  <legend class="visually-hidden">Choose Colour</legend>
  <label class="swatch">
    <input type="radio" name="colour" value="red" class="visually-hidden" checked />
    <span class="swatch__chip" style="background:#c0392b" aria-hidden="true"></span>
    Red
  </label>
</fieldset>

<style>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
```

Style the `.swatch__chip` however you like, including on `:checked` and `:focus-visible`. Use this technique rather than `display: none`, which would take the control out of the tab order.

If you truly cannot, mirror your custom interface into a hidden field:

```html
<!-- Custom visual interface -->
<div class="custom-colour-picker">
  <div class="colour-option red" onclick="selectColour('red')"></div>
  <div class="colour-option blue" onclick="selectColour('blue')"></div>
</div>

<!-- Hidden form element for 3D Bits - NOT RECOMMENDED -->
<input type="hidden" name="colour" id="selected-colour" value="red" />

<script>
function selectColour(colour) {
  // Update visual state
  document.querySelectorAll('.colour-option').forEach(el =>
    el.classList.remove('selected'));
  document.querySelector('.colour-option.' + colour).classList.add('selected');

  // Update the hidden field
  const field = document.getElementById('selected-colour');
  field.value = colour;

  // The event MUST reach the document, or 3D Bits never sees it
  field.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
}
</script>
```

Two things make or break this pattern, and the second is the one people miss:

**The event has to reach the document.** `new Event('change')` does not bubble, so it is never noticed. `bubbles: true` is enough in the ordinary document; add `composed: true` as well and it also escapes a web component's shadow root, which costs nothing when there is no shadow root to escape.

**A hidden input is not collected in Standard inputs mode.** Do one of these, or the field is invisible however you dispatch the event:

- Add a control in Composer with **Product page rendering** set to **External** and its **Selector** set to `#selected-colour`. Selector-bound fields are read whatever the mode, and the value arrives under the control's own Key rather than under `colour`. This is the option we would choose.
- Or set **Input collection mode** to **All inputs** on the project's Storefront settings, which sweeps every input on the page including hidden ones.

Remember that this pattern leaves you responsible for keyboard navigation, for what screen readers announce, and for keeping the hidden field in step with the visible interface. Before implementing it, seriously consider whether the visually-hidden control above does the same job for less.

## If you build a product options app

The same contract applies, and there is nothing you need to add on your side. 3D Bits reads whatever your app renders, so an app built from real form fields with reasonably stable `name` attributes works with us out of the box, and your merchants can pair it with a 3D configurator without either of us doing integration work.

Three things help those merchants in practice:

**Keep field names stable across releases.** A rename silently breaks any configuration built against the old name.

**Fire a `change` event that reaches the document** whenever a value settles - `new Event('change', { bubbles: true, composed: true })` - especially if your controls render after page load or your framework sets values programmatically. `composed: true` is what carries the event out of a custom element's shadow root; without it a `change` never leaves one, not even a native one. An `input` event on its own is not enough.

**Give every input an explicit `type`.** Without one it is skipped in the default collection mode.

If you would like to check how your app behaves alongside 3D Bits, install both on a development store and turn on [Debug Mode](/learn/3d-bits/tutorials/getting-started/common-settings#enable-debug-mode). It lists every field name and value we can see on the page, which is usually enough to answer the question in a couple of minutes. We are happy to look at the results with you, at [info@bitbybit.dev](mailto:info@bitbybit.dev).

## Where to go next

[Logic Without a Panel](./logic-without-a-panel) covers what happens to Composer's Logic rules when 3D Bits renders no panel of its own, which is exactly the situation this page describes. [Using Another Options App](./when-you-need-another-app) covers the case where someone else's app renders the form instead of you.
