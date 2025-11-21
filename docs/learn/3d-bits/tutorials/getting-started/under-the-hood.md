---
sidebar_position: 3
title: "Understanding 3D Bits Architecture: How It Works Under the Hood"
sidebar_label: Under the Hood
description: Learn about 3D Bits' architecture, integration strategy, and best practices for building reliable 3D configurators on Shopify.
tags: [shopify, 3d-bits, architecture]
---

# Under the Hood: How 3D Bits Works

Before diving into building 3D configurators with 3D Bits, it's essential to understand our architectural approach, design philosophy, and the trade-offs involved. This knowledge will help you build reliable, maintainable configurators and avoid common pitfalls.

## Our Design Philosophy: Focus on What We Do Best

The power of 3D Bits comes from its adaptive nature and focused approach. We're proud to offer a solution that **does not try to copy or duplicate features already developed by Shopify** or hundreds of third-party option and variant applications. These apps have solved the problems of custom UI forms and price management better than we ever could have.

**Why this approach?**

Managing pricing and checkout flows is a responsible, complex task that must be handled with care. Every business has unique requirements for how they price products, calculate discounts, handle bundles, and process checkout flows. Rather than building a one-size-fits-all solution that might suit some customers but disappoint others, we focus exclusively on our core expertise: **3D web programming, interactive visualization, CAD operations, and parametric design**.

### What 3D Bits Is (and Isn't)

**3D Bits PROVIDES:**
- ✅ Professional 3D visualization and interactive configurator capabilities
- ✅ CAD operations and parametric design tools for dynamic product customization
- ✅ Integration with your existing e-commerce tools and pricing solutions
- ✅ Standards-based architecture compatible with many third-party apps
- ✅ Flexibility to work with custom-built forms and development workflows
- ✅ Features designed for professional teams building sophisticated 3D experiences

**3D Bits DOES NOT PROVIDE:**
- ❌ All-in-one solutions that handle everything from 3D to checkout
- ❌ Pricing engines or checkout flow management
- ❌ Form builders or variant selector replacements
- ❌ Plug-and-play solutions requiring zero configuration

:::info Clear Expectations
If you're looking for an app that handles 3D visualization, pricing, variants, checkout, and everything else in a single package, **3D Bits will not be a good fit for you**. We're deliberately focused on excelling at 3D, CAD, and parametric visualization rather than being mediocre at everything.
:::

### Simple Use Cases Are Welcome Too

While much of this documentation focuses on complex configurators and advanced integrations, **not every use case requires complexity**. Many merchants simply want to display beautiful 3D models of their products or use Shopify's standard variant system to switch between different views. 

**Good news:** These simpler scenarios work exceptionally well with 3D Bits. Shopify's built-in variant selectors already use proper HTML form elements with standard attributes, making them perfectly compatible with our input detection system. If your product has variants like "Color: Red/Blue" or "Size: Small/Large," 3D Bits can automatically show the corresponding 3D model or variation without any complex configuration. 

In fact, **simple variant-based switching is one of the most efficient and reliable ways to use 3D Bits**. You get professional 3D visualization with minimal setup, leveraging Shopify's native functionality that you're already familiar with.

## How the Magic Happens: The Input Detection Strategy

Understanding how 3D Bits communicates with your product page is crucial for anyone starting out with our application. Our integration approach is both our greatest strength and a source of important considerations you need to understand.

### The Core Mechanism

**3D Bits efficiently scans changes happening on your HTML input field values** and communicates that information to the custom 3D logic that drives your configurator experiences. We assemble input names and their values and send them to scripts that use this information to prepare 3D environments.

Here's a simple example to illustrate:

**Your HTML form:**
```html
<fieldset>
  <legend>Table Top Size</legend>
  <label>
    <input type="radio" name="size" value="small" />
    Small (100cm)
  </label>
  <label>
    <input type="radio" name="size" value="large" checked />
    Large (150cm)
  </label>
</fieldset>
```

**In your 3D Bits configuration:**
- Map the small mesh in your GLTF file to input name `size` with value `small`
- Map the large mesh to input name `size` with value `large`

**What happens:**
When users click different options, 3D Bits instantly detects the change and updates the 3D scene—hiding one mesh and showing the other, effectively switching between the models.

### Why This Approach Works

This strategy has several powerful advantages:

**1. Universal Compatibility**
Our approach works with **almost any page that uses standard HTML input elements**. Whether you're using:
- Shopify's default variant selectors
- Third-party option apps
- Custom-built forms from your development team
- Any combination of the above

As long as they follow HTML standards, 3D Bits can read and respond to user selections.

**2. No Vendor Lock-In**
You're not tied to specific apps or theme structures. Choose the pricing, variant, and option tools that work best for your business, and 3D Bits will integrate with them.

**3. Future-Proof Architecture**
We're building a solution based on web standards that will work across platforms. In the future, we plan to make 3D Bits available on other e-commerce platforms, and in principle, **you'll be able to use the same configurators there**.

**4. Flexibility for Custom Development**
Professional development teams can build custom forms with complete control over styling, behavior, and user experience. As long as you follow standard HTML practices (detailed in our [integration guidelines](../../for-developers/integration)), 3D Bits will work seamlessly.

## Understanding the Trade-Offs

While our approach provides tremendous flexibility, it comes with important considerations you need to understand and plan for.

### The HTML Standards Requirement

**Critical requirement:** Third-party apps and themes **must use proper HTML input elements** with standard attributes (`name`, `value`, etc.) for 3D Bits to function correctly.

**What this means:**
- ✅ Apps using standard `<input>`, `<select>`, `<textarea>` elements work perfectly
- ✅ Properly formed HTML with semantic markup integrates seamlessly
- ❌ Apps using custom div-based selectors without proper form elements won't work
- ❌ JavaScript-only interfaces that don't update actual input values will fail

Unfortunately, not all developers follow HTML standards. Some apps use purely visual interfaces (divs, spans) with JavaScript event handling but don't maintain actual form inputs underneath. **These apps will not work with 3D Bits.**

:::tip Choosing Compatible Apps
Before integrating a third-party app with 3D Bits, verify it uses standard HTML form elements. Check with the app developer if you're unsure. Our [integration guidelines](../../for-developers/integration) provide clear examples of what works and what doesn't.
:::

### Input Name Stability: A Critical Consideration

One of the most important aspects to understand is **input name stability**. The `name` attribute of HTML inputs is what 3D Bits uses to identify which form field controls which aspect of your 3D model.

**What can go wrong:**

1. **Third-party apps may change input names during updates**
   - When an app updates, developers might refactor their form structure
   - Input names like `options[Color]` might become `variant_color` or `color_option`
   - Your carefully configured 3D mappings suddenly break

2. **Dynamic IDs can cause confusion**
   - Some themes generate random IDs: `options[Color]-12345`
   - These IDs change on every page reload
   - **BITBYBIT VIEWER solution:** Use the `{{id}}` placeholder pattern in Viewer Editor configurations (documented in [Common Settings](./common-settings#dynamic-ids-in-input-names))
   - **BITBYBIT RUNNER note:** The `{{id}}` placeholder is only available in VIEWER's scene configurations. If you're writing custom scripts with RUNNER, you'll need to handle dynamic IDs yourself using pattern matching or string manipulation in your TypeScript/JavaScript code. 3D Bits will still send the full technical name (including the ID) to your script—you just need to parse it yourself.

3. **Theme changes can alter input structure**
   - Switching themes often changes the entire product form structure
   - Input names may be completely different in the new theme
   - Existing 3D configurations need updating

**The consequence:** If input names change, your live 3D product configurator that's running on your product page will **break immediately**, potentially affecting customer experience and sales.

### Technical vs. User-Friendly Names

Because we read actual HTML input names and values, your 3D configuration may need to reference technical attributes rather than friendly display labels.

**Understanding Input Attributes:**

Let's break down a complete example with multiple options:

```html
<fieldset>
  <legend>Choose Material</legend>
  
  <label>
    <input type="radio" name="options[Material]-8329" value="oak_wood" checked />
    Premium Oak Wood
  </label>
  
  <label>
    <input type="radio" name="options[Material]-8329" value="maple_wood" />
    Natural Maple
  </label>
  
  <label>
    <input type="radio" name="options[Material]-8329" value="metal_steel" />
    Brushed Steel
  </label>
</fieldset>
```

**Key attributes explained:**

- **`name` attribute** (`options[Material]-8329`): The technical identifier that groups these radio buttons together. All three inputs share the **same name** because they're part of the same option group—only one can be selected at a time.

- **`value` attribute** (`oak_wood`, `maple_wood`, `metal_steel`): The technical value that gets sent when that specific option is selected. Each input has a **different value** to distinguish between the choices.

- **Label text** ("Premium Oak Wood", "Natural Maple", "Brushed Steel"): The human-friendly text that customers see. This is purely visual and **not used by 3D Bits**.

**In your 3D Bits configuration:**

You would map to the **technical attributes**, not the display text:
- Input name: `options[Material]-{{id}}` (using the `{{id}}` placeholder to handle the dynamic `-8329` part)
- Input value: `oak_wood` (to show the oak material in 3D)
- Input value: `maple_wood` (to show the maple material in 3D)
- Input value: `metal_steel` (to show the steel material in 3D)

**Why this matters:**

✅ **Technical attributes are more stable:** The `name` and `value` attributes typically change less frequently than display text  
✅ **Better for translations:** Display text might be translated to "Roble Premium" in Spanish, but `value="oak_wood"` usually stays the same  
✅ **Survives minor updates:** Small label changes often don't affect technical attributes  
✅ **No ambiguity:** Multiple products might show "Small" as a label, but values like `size_small` and `dimension_compact` are distinct

❌ **Display text changes frequently:** Labels change often for marketing, translations, or theme updates  
❌ **Both can break:** While technical attributes are more stable, poorly maintained apps or themes can change both labels AND technical attributes during updates—this is why monitoring and testing are essential

:::info Debug Mode Is Your Friend
Use [Debug Mode](./common-settings#enable-debug-mode) to see exactly what input names and values 3D Bits can read on your page. This is essential when setting up new configurations or troubleshooting issues.
:::

## Responsibility and Maintenance: What You Need to Know

**We must be clear about responsibilities:** 3D Bits operates within an ecosystem we don't fully control. While we provide robust integration capabilities, **we bear no responsibility for infrastructure outside our control.**

### What Can Break Your Configurators

**Third-party apps:**
- App updates changing input names or structure
- Apps that don't follow HTML standards
- Apps introducing breaking changes without notice

**Themes:**
- Theme updates modifying product form structure
- Theme switches requiring reconfiguration
- Custom theme modifications affecting input elements

**Custom development:**
- Developer changes to form structure
- Non-standard HTML implementations
- JavaScript that interferes with form elements

**The bottom line:** You are responsible for **monitoring and administering your product pages** to ensure configurators continue working as expected.

### Your Responsibilities as a 3D Bits User

**1. Choose Reliable Apps and Themes**
- Select well-maintained apps with good developer support
- Prefer apps that follow HTML standards
- Check with developers about input name stability
- Research apps before committing to them

**2. Test After Any Changes**
- **Before updating apps:** Test on draft products first
- **Before switching themes:** Use Shopify's theme preview mode
- **Before going live:** Verify all configurations still work
- See [Theme and App Updates](./common-settings#theme-and-app-updates) for detailed workflows

**3. Establish Monitoring Practices**
- Periodically check that configurators still function correctly
- Set up scheduled testing of critical product pages
- **Implement automated testing:** Use tools like Playwright, Puppeteer, or Selenium to run automated tests on live product pages, checking for configurator functionality, performance regressions, and broken integrations
- If something breaks, immediately set affected products to draft
- Keep backup configurations or documentation

**4. Maintain Communication with Developers**
- If using custom development, ensure your team understands HTML requirements
- When working with app developers, ask about planned changes
- Follow our [integration guidelines](../../for-developers/integration) when building custom forms
- Coordinate updates across your development team

### Best Practices for Stability

**For organizations with development teams:**
1. **Build your own HTML form fields** for mission-critical configurators
2. **Maintain strict control** over input names and structure
3. **Document your conventions** for team consistency
4. **Version control your configurations** alongside your code
5. **Implement automated testing** to catch issues early

**For merchants using third-party apps:**
1. **Choose established, reputable apps** with good support
2. **Communicate with app developers** about your needs
3. **Test in preview/draft mode** before applying updates
4. **Have rollback plans** if updates cause issues
5. **Consider Pro support** for complex setups requiring expert guidance

## Tools We Provide to Help

While you're responsible for your product pages, we provide tools to make management easier:

### Debug Mode

[Debug Mode](./common-settings#enable-debug-mode) shows you exactly what input names and values 3D Bits can detect on your page. This is **essential** for:
- Initial setup and configuration
- Troubleshooting broken integrations
- Verifying changes after updates
- Understanding complex form structures

### Input Collection Strategies

[Input Collection Mode](./common-settings#input-collection-mode) lets you control which inputs 3D Bits monitors:
- **Standard Inputs:** For typical product forms
- **All Inputs:** For complex pages with additional configuration fields
- **Future: Partner App Strategies:** We're working with third-party developers to provide dedicated, reliable integration strategies

### Migration Tools

The Viewer Editor includes option name editing features specifically designed for handling updates:
- Bulk rename input references
- Test configurations before going live
- Import/export configurations for backup

### Comprehensive Documentation

We provide detailed guides covering:
- [Integration best practices](../../for-developers/integration) for developers
- [Common settings](./common-settings) explaining all configuration options
- Block-specific settings for each 3D Bits feature
- Testing workflows for safe updates

## The Future: Even Better Integration

We're actively working to make 3D Bits integration even more robust:

**Event-Based Communication:**
We're exploring opportunities to integrate with custom events from third-party applications. This could enable more precise input handling in specific scenarios, though this approach is still in early stages of development.

**Multi-Platform Support:**
We're planning to make 3D Bits available on other e-commerce platforms, with configurators that work consistently across platforms.


## Is 3D Bits Right for You?

After reading this, you should have a clear understanding of what 3D Bits offers and what it requires from you.

**3D Bits is ideal if you:**
- ✅ Value specialized 3D visualization, CAD, and parametric design capabilities
- ✅ Want flexibility to choose your own pricing/variant apps
- ✅ Have (or want to build) forms using HTML standards
- ✅ Understand the importance of testing and monitoring
- ✅ Are willing to invest time in proper setup and maintenance
- ✅ Appreciate modularity over all-in-one solutions

**3D Bits may not be right if you:**
- ❌ Want a completely automated, zero-maintenance solution
- ❌ Need an app that handles pricing, variants, and 3D all together
- ❌ Can't commit to monitoring and testing after updates
- ❌ Require apps that don't follow HTML standards
- ❌ Expect everything to work perfectly with zero configuration

:::warning Final Reminder
If the architectural approach described here—with its flexibility, power, and associated responsibilities—is something you cannot work with, **please don't use our application**. We'd rather be honest about our strengths and limitations than promise something we can't deliver.
:::

## Getting Help

We're here to support you in building amazing 3D experiences:

**Documentation and Tutorials:**
- [Before You Begin](./before-you-begin) - Essential reading
- [Integration Guidelines](../../for-developers/integration) - For developers
- [Common Settings](./common-settings) - Detailed configuration guide

**Professional Services:**
If you need hands-on help with complex configurations or custom development, we offer professional development services tailored to your needs.

---

**Now that you understand how 3D Bits works under the hood, you're ready to build powerful, reliable 3D configurators.** The next step is to follow our tutorials and best practices to create amazing experiences for your customers.