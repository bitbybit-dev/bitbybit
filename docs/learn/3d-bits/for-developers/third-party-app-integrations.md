---
sidebar_position: 2
title: "Third Party App Integrations"
sidebar_label: Third Party App Integrations
description: If you are the developer of third party option application, we'd love to collaborate and make our app compatible with your solution. This guide defines some ways how this is possible.
tags: [shopify, 3d-bits]
---
import Admonition from '@theme/Admonition';

## Overview

We'd love to collaborate with product options app developers to create seamless integrations between our apps. This guide explains how implementing a standardized event-based communication layer can benefit our mutual customers who want to build advanced 3D product configurators.

By working together, we can provide customers with stable, reliable experiences where 3D visualizations respond smoothly to product option changes—without either of us worrying about breaking integrations during routine updates. This strengthens the entire ecosystem of advanced product configurators on Shopify and creates better experiences for the customers we both serve.

## The Current Integration Challenge

Currently, 3D Bits integrates with third-party product options apps by monitoring HTML form inputs. While this works in many cases, it relies on stable `name` attributes and can be affected by DOM changes from framework updates. A native event-based approach provides a more reliable integration layer that's independent of your internal implementation.

## The Solution: Native Event-Based Integration

We propose establishing an official communication layer using **standard Browser Custom Events**. This approach provides a stable, versioned API contract between your app and 3D Bits, ensuring integrations remain functional regardless of your internal implementation or DOM structure changes.

### How It Works

When a mutual customer builds a 3D configurator using both your product options app and 3D Bits, they would:

1. **Select Your App**: In the 3D Bits settings, they choose your app's name from the ["Input Collection Mode"](../tutorials/getting-started/common-settings#input-collection-mode) dropdown
2. **Automatic Subscription**: 3D Bits adds a listener to the global `window` object
3. **Real-Time Synchronization**: As users interact with your product options, your app dispatches a standard event. 3D Bits captures this payload and updates the 3D model immediately

This creates a plug-and-play experience that requires no technical configuration from the end user.

## Technical Implementation

### Architecture: Native CustomEvent API

Instead of creating a proprietary global object (which is prone to conflicts and security issues), we use the standard [Web API CustomEvent interface](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).

<Admonition type="info" title="Why Native CustomEvents?">
Using standard browser events (`window.dispatchEvent`) is superior to a custom "Event Bus" object because:
- **Decoupling**: Your app does not need to check if 3D Bits is present or loaded. You simply fire the message into the `window`.
- **Security**: There is no shared global state or mutable listener array that other malicious scripts can easily hijack or overwrite.
- **Shadow DOM Support**: Native events can be configured to bubble through Shadow DOM boundaries, supporting encapsulated apps.
</Admonition>

### Implementation Guide

Your app simply needs to dispatch a `CustomEvent` specifically named `3dbits.productOptions.changed` whenever a user modifies an option.

#### The Dispatch Code

Add this logic to your app's change handler (e.g., inside your React `useEffect`, Vue watcher, or vanilla JS `change` listener):

```javascript
// 1. Construct the payload
const payload = {
  app: 'YourAppName',      // Your unique app identifier
  version: '1.0.0',        // Schema version
  
  // IMPORTANT: Use a flat structure - do NOT nest related options
  options: {
    'Color': 'Red',
    'Size': 'XL',
    'Material': 'Walnut Wood',
    'Width': 100,
    'Height': 75,
    'Depth': 50,
    'LED Lighting': true,           // Boolean for enabled/disabled features
    'Wireless Charging': false,
    'Part 1': true,                 // Flat structure - keep related options separate
    'Part 1 Quantity': 2,           // Rather than nesting under 'Part 1'
    'Part 2': false,
    'Part 2 Quantity': 0,
    'Engraving Text': 'Custom Name',
    'Gift Wrapping': true
  },
  
  // Optional Metadata
  metadata: {
    timestamp: Date.now(),
    productId: '1234567890',
    variantId: '9876543210',
    currency: 'USD',
    totalPrice: 599.99
  }
};

// 2. Create the Native CustomEvent
// Note: All data must be passed within the 'detail' property
const event = new CustomEvent('3dbits.productOptions.changed', {
  detail: payload,
  bubbles: true,    // Allows the event to bubble up the DOM
  composed: true    // Crucial: Allows event to pass through Shadow DOM boundaries
});

// 3. Dispatch to the window
window.dispatchEvent(event);
```

## Security Considerations

This approach is secure because:

1. **No Code Execution**: 3D Bits never executes code provided by your app; it only parses the JSON data in the `detail` property
2. **Read-Only Integration**: 3D Bits acts purely as a subscriber and cannot modify your app's state
3. **Isolation**: Because we use the browser's native event loop, an error in the 3D Bits listener will not crash your application, and vice-versa

## Event Schema Specification

<Admonition type="note" title="Flexible Integration">
While we recommend the schema below for consistency across integrations, we understand that your app may already have its own event system or preferred data structure. If you prefer to use a different event name or structure your data differently, **we're happy to adapt**. Simply [contact us](#contact-information) with your proposed event structure, and we'll add support for your specific implementation in 3D Bits.
</Admonition>

### Event Name

We suggest using this event name, but you could create your own namespace. We understand that you might not want to have references to a single app in your codebase.

```javascript
3dbits.productOptions.changed
```

Alternative:

```javascript
yourApp.productOptions.changed
```

**If you use `3dbits.productOptions.changed`:**
- We can detect this automatically
- Users won't need to manually select your app from our Input Collection Mode dropdown
- The integration will work out of the box

**If you choose your own event name:**
- Please [contact us](#contact-information) with your event name
- We'll add support for your specific event
- Users will need to select your app from the Input Collection Mode dropdown

This way we'll know which event to listen to when users configure your app for input collection.

### Event Data Structure (TypeScript)

The `detail` property of the event should follow this interface:

```typescript
interface ProductOptionsEventDetail {
  // Identifying information
  app: string;              // Your app's unique identifier
  version: string;          // Use '1.0.0'
  
  // Option data
  // Key: Human Readable Name (displayed to user)
  // Value: The selected value
  options: {
    [optionName: string]: string | number | boolean;
  };
  
  // Optional metadata helpful for advanced logic
  metadata?: {
    timestamp?: number;
    productId?: string;
    variantId?: string;
    currency?: string;
    totalPrice?: number;
  };
}
```

<Admonition type="info" title="Important: Option Naming Requirements">
**Option names in the `options` object should be the user-facing names.** 3D Bits maps the 3D configuration based on the labels the merchant sees in their 3D Bits debug mode. Also please make sure that these option names remain unaffected by translations.

**Examples:**
- ✅ **Good**: `"options": { "Material": "Oak" }`
- ❌ **Bad**: `"options": { "mat_opt_id_88": "Oak" }` (Internal Database IDs)
- ❌ **Bad**: `"options": { "material-selection": "Oak" }` (CSS Classes/Slugs)

If your app relies on IDs internally, please map them to the display label before dispatching the event.
</Admonition>

## When to Fire Events

Your app should dispatch the event:

1. **On Initial Load**: Once your app has calculated the default selections
2. **On User Interaction**: Immediately when any option value changes
3. **Range Sliders**: For continuous inputs like range sliders (e.g., dimensions), either:
   - **Debounce** the dispatch by 100-150ms during active dragging, OR
   - **Fire only on drag end** (mouseup/touchend events) to avoid excessive event firing while the user is still adjusting the value

## Benefits for Our Mutual Users

### Stability and Reliability

- **No More Breaking Changes**: Updates to your app's DOM structure won't break 3D integrations
- **Predictable Behavior**: A versioned schema ensures forward compatibility
- **Reduced Support Burden**: Fewer integration issues mean fewer support tickets

### Enhanced Product Offerings

- **Competitive Advantage**: Stand out as a developer who supports advanced 3D use cases
- **Ecosystem Growth**: Enable integrations not just with 3D Bits but with any other script listening for standard events

## Testing Your Integration

### Debug Mode

When users enable [Debug Mode](../tutorials/getting-started/common-settings#enable-debug-mode) in 3D Bits, they will see the incoming event stream in the 3D Bits UI.

### Test Scenarios

We recommend testing:

1. **Initial Load**: Verify the event fires with default selections immediately after page load
2. **Single Changes**: Test each option type (radio, checkbox, select, text)
3. **Browser Console**: You can verify your own integration by opening the DevTools console and typing:

```javascript
window.addEventListener('3dbits.productOptions.changed', e => console.log(e.detail));
```

## Alternative Approach: Stable HTML Form Attributes

We understand that implementing a JavaScript event system may not be feasible for all apps immediately. If you cannot implement the event dispatcher, we recommend following HTML form best practices to ensure stable integrations.

### Use Descriptive, Stable `name` Attributes

When 3D Bits falls back to automatic form detection, it relies on the `name` attribute.

<Admonition type="tip" title="Best Practices for Form Attributes">
To maintain stable integrations without breaking changes, we recommend:

- **Use Descriptive Names**: Consider using `name="color"` or `name="material"`
- **Avoid Auto-Generated IDs**: Try to avoid names like `name="field_12345_xyz"`. If you re-deploy your app and that ID changes, the customer's 3D configuration may break
- **Semantic Values**: Consider using `value="red"` rather than internal IDs like `value="opt_id_99"`
</Admonition>

### Example: Good HTML Structure

```html
<!-- ✅ GOOD: Stable, descriptive attributes -->
<input type="radio" name="material" value="wood" checked />
<input type="checkbox" name="led_lighting" value="true" />
```

### Example: Poor HTML Structure

```html
<!-- ❌ BAD: Unstable names that break integrations -->
<input type="radio" name="shopify_app_layer_12837" value="88374" />
<div data-value="wood" onclick="...">Custom Div (No Input Tag)</div>
```

[**Learn More about Integration**](./integration.md)

## Next Steps

If you're interested in exploring this integration:

1. **Review the Implementation**: Consider how this event pattern might fit into your app's architecture
2. **Test Locally**: Try dispatching the events in a development environment
3. **Reach Out**: We'd love to hear your feedback or discuss how we can adapt to your existing event structure

We're eager to collaborate and make this integration work smoothly for our mutual customers.

### What We Can Offer

Once the integration is live, we'd be happy to:

- **List Your App**: Feature your app in our [third-party apps documentation](../tutorials/getting-started/apps-for-3d-bits) with a note about the native integration support
- **Provide Examples**: Include your app in our integration examples to help customers get started
- **Share Knowledge**: Document any learnings that could help other developers

Our goal is simply to make it easier for customers using both our apps to build great 3D configurators without worrying about breaking changes.

## Contact Information

📧 Email: [info@bitbybit.dev](mailto:info@bitbybit.dev)

We appreciate you taking the time to consider this integration approach and look forward to potentially working together.

