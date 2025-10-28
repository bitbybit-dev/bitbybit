---
sidebar_position: 1
title: "Integrating 3D Bits with Custom Forms"
sidebar_label: Integration Best Practices
description: Learn how to properly integrate 3D Bits with custom forms and third-party apps using standard HTML practices.
tags: [shopify, 3d-bits]
---
import Admonition from '@theme/Admonition';

## Building Compatible Forms for 3D Bits Integration

When integrating 3D Bits with custom pricing apps or building your own product forms, the key to success lies in using proper HTML form elements. This tutorial will guide you through best practices that ensure your forms work seamlessly with 3D Bits while maintaining accessibility and usability for all users.

## Understanding the Integration Challenge

3D Bits specializes in creating powerful 3D configurators and immersive experiences for your products. While we excel at rendering and manipulating 3D geometry based on user selections, we intentionally don't provide custom UI building tools, pricing engines, or fancy form elements. Instead, we integrate with the solutions you're already using, whether that's third-party Shopify apps or custom-built forms.

The magic happens when 3D Bits automatically detects changes in your form inputs and updates the 3D model accordingly. However, this automatic detection only works when your forms follow standard HTML practices.

## Why Standard HTML Elements Matter

When you use proper HTML form elements with correct attributes, you're not just making your forms compatible with 3D Bits – you're creating an inclusive experience for all users. Standard form elements provide built-in keyboard navigation, screen reader compatibility, and semantic meaning that assistive technologies can understand.

Consider the difference between these two approaches:

### ❌ Poor Practice - Custom Div Elements
```html
<!-- This won't work with 3D Bits and breaks accessibility -->
<div class="custom-option" onclick="selectColor('red')" data-value="red">
  <img src="red-swatch.jpg" alt="Red color">
  <span>Red</span>
</div>
<div class="custom-option" onclick="selectColor('blue')" data-value="blue">
  <img src="blue-swatch.jpg" alt="Blue color">
  <span>Blue</span>
</div>
```

### ✅ Good Practice - Standard Radio Buttons
```html
<!-- This works perfectly with 3D Bits and is accessible -->
<fieldset>
  <legend>Choose Color</legend>
  <label>
    <input type="radio" name="color" value="red" checked />
    <img src="red-swatch.jpg" alt="Red color option" />
    Red
  </label>
  <label>
    <input type="radio" name="color" value="blue" />
    <img src="blue-swatch.jpg" alt="Blue color option" />
    Blue
  </label>
</fieldset>
```

## Essential HTML Patterns for 3D Bits

### Radio Buttons for Single Selections

When users need to choose one option from multiple choices (like material, color, or size), radio buttons are your best friend. The `name` attribute groups related options together, while the `value` attribute tells 3D Bits which option is selected.

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

### Checkboxes for Multiple Selections

For features that can be independently enabled or disabled (like add-ons or accessories), checkboxes provide the perfect solution. The `value` attribute determines what gets sent to 3D Bits when the checkbox is checked, while the `checked` attribute sets the initial state.

```html
<fieldset>
  <legend>Additional Features</legend>
  <label>
    <input type="checkbox" name="led_lighting" value="enabled" checked />
    LED Lighting System
  </label>
  <label>
    <input type="checkbox" name="wireless_charging" value="enabled" />
    Wireless Charging Pad
  </label>
  <label>
    <input type="checkbox" name="premium_finish" value="enabled" />
    Premium Finish Coating
  </label>
</fieldset>
```

<Admonition type="info" title="Checkbox Values Explained">
- **`value="enabled"`**: When checked, 3D Bits receives "enabled" as the value
- **`checked`**: Makes the checkbox selected by default when the page loads
- When unchecked, no value is sent (which 3D Bits interprets as the feature being disabled)
</Admonition>

Alternatively, you might want to use boolean values or specific identifiers:

```html
<fieldset>
  <legend>Optional Accessories</legend>
  <label>
    <input type="checkbox" name="leather_seats" value="leather" />
    Leather Seats
  </label>
  <label>
    <input type="checkbox" name="sunroof" value="panoramic" />
    Panoramic Sunroof
  </label>
</fieldset>
```

### Select Dropdowns for Space-Efficient Options

When you have many options but limited screen space, select elements provide a clean, accessible solution.

```html
<label for="size-selector">Product Size</label>
<select name="size" id="size-selector">
  <option value="small">Small (10cm)</option>
  <option value="medium" selected>Medium (15cm)</option>
  <option value="large">Large (20cm)</option>
  <option value="extra-large">Extra Large (25cm)</option>
</select>
```

### Range Inputs for Continuous Values

For dimensions, quantities, or other numeric values that users can adjust within a range, the range input provides an intuitive interface.

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

### Number Inputs for Precise Values

When users need to enter specific numeric values, number inputs provide validation and appropriate keyboard interfaces on mobile devices.

```html
<label for="quantity">Quantity</label>
<input 
  type="number" 
  name="quantity" 
  id="quantity"
  min="1" 
  max="100" 
  value="1" />
```

## Critical Attributes for Success

The `name` attribute is absolutely crucial for 3D Bits integration. This attribute identifies which form field controls which aspect of your 3D model. Make sure your `name` attributes are:

- **Descriptive**: Use names like `material`, `color`, or `size` rather than generic names like `option1` or `field2`
- **Consistent**: If you have multiple products, use the same naming convention across all forms
- **Unique**: Each form control should have a unique name within its form context

<Admonition type="warning" title="Avoid Duplicate Input Names">
If you have multiple inputs with the same `name` attribute on the same page, 3D Bits may have difficulty determining which one to monitor. When this happens, 3D Bits will automatically add suffixes to distinguish between them, which can make your configuration more complex and harder to maintain. Always ensure input names are unique across your entire page.
</Admonition>

For example, avoid patterns like this:

```html
<!-- DON'T DO THIS - Duplicate names cause confusion -->
<div class="product-1">
  <input type="radio" name="color" value="red" />
  <input type="radio" name="color" value="blue" />
</div>
<div class="product-2">
  <input type="radio" name="color" value="red" />
  <input type="radio" name="color" value="blue" />
</div>
```

Instead, use unique, descriptive names:

```html
<!-- DO THIS - Unique names are clear and reliable -->
<div class="product-1">
  <input type="radio" name="product1_color" value="red" />
  <input type="radio" name="product1_color" value="blue" />
</div>
<div class="product-2">
  <input type="radio" name="product2_color" value="red" />
  <input type="radio" name="product2_color" value="blue" />
</div>
```

<Admonition type="tip" title="Pro Tip">
Always test your forms with keyboard navigation (Tab key) and screen readers to ensure they work for all users. If you can't navigate your form without a mouse, neither can users who rely on assistive technologies.
</Admonition>

## What Breaks the Integration

Certain HTML patterns will prevent 3D Bits from detecting user selections and create barriers for users with disabilities:

### Custom Clickable Divs
```html
<!-- Don't do this -->
<div class="option" onclick="changeOption('blue')">Blue Option</div>
```

This approach fails because:
- 3D Bits can't detect the selection change automatically
- Screen readers don't announce it as a selectable option
- Keyboard users can't navigate to it
- The current selection state isn't communicated to assistive technologies

### Image-Only Selections Without Form Elements
```html
<!-- Don't do this -->
<img src="option1.jpg" onclick="selectOption(1)" class="selectable">
```

While visually appealing, this pattern excludes users who rely on keyboard navigation or screen readers.

### JavaScript-Dependent Custom Controls
```html
<!-- Don't do this -->
<span class="custom-radio" data-value="option1">Custom Option</span>
```

Custom controls that rely entirely on JavaScript event handling often lack the semantic meaning and keyboard accessibility of native form elements.

## Testing Your Integration

To ensure your forms work correctly with 3D Bits and remain accessible:

1. **Navigate with keyboard only**: Press Tab to move through all form elements. Every interactive element should be reachable and usable.

2. **Test with a screen reader**: Use built-in screen readers (like VoiceOver on macOS or NVDA on Windows) to verify that options are announced clearly.

3. **Verify 3D Bits integration**: Make selections in your form and confirm that the 3D model updates appropriately.

4. **Check on mobile devices**: Ensure form elements display and function correctly on touch interfaces.

## When Custom Solutions Are Necessary

<Admonition type="warning" title="Last Resort Only">
The approach described below should only be used when you absolutely cannot achieve your design requirements with standard HTML form elements. This pattern introduces complexity and potential accessibility issues that you'll need to carefully manage.
</Admonition>

Sometimes your business requirements demand custom UI elements that go beyond standard form controls. In these rare cases, you can still maintain compatibility with 3D Bits and accessibility by using hidden form elements that mirror your custom interface. However, this approach comes with significant drawbacks and should be avoided whenever possible.

This pattern is problematic because it duplicates functionality, increases maintenance complexity, and can easily fall out of sync between your visual interface and the hidden form elements. Additionally, users with disabilities may miss important visual cues that aren't properly communicated to assistive technologies.

```html
<!-- Custom visual interface -->
<div class="custom-color-picker">
  <div class="color-option red" onclick="selectColor('red')"></div>
  <div class="color-option blue" onclick="selectColor('blue')"></div>
</div>

<!-- Hidden form element for 3D Bits integration - NOT RECOMMENDED -->
<input type="hidden" name="color" id="selected-color" value="red" />

<script>
function selectColor(color) {
  // Update visual state
  document.querySelectorAll('.color-option').forEach(el => 
    el.classList.remove('selected'));
  document.querySelector('.color-option.' + color).classList.add('selected');
  
  // Update hidden form element for 3D Bits
  document.getElementById('selected-color').value = color;
  
  // Trigger change event so 3D Bits can detect the update
  document.getElementById('selected-color').dispatchEvent(new Event('change'));
}
</script>
```

Remember that this approach requires you to manually ensure that keyboard navigation works, screen readers can understand the interface, and the hidden form elements stay synchronized with your visual interface. Before implementing this pattern, seriously consider whether your design goals can be achieved by styling standard form elements instead.

By following these practices, you'll create forms that work seamlessly with 3D Bits while providing an excellent experience for all your users, regardless of how they interact with your website.