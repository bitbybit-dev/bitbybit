---
sidebar_position: 4
title: "BITBYBIT APPS Block for Shopify's '3D Bits' App"
sidebar_label: BITBYBIT APPS (PRO)
description: Learn how to use the BITBYBIT APPS theme app extension block to develop and deploy professional 3D & 2D product presentations on Shopify
tags: [shopify, 3d-bits, typescript]
---

# Unlock Professional 3D & 2D Experiences with the BITBYBIT APPS Block

The **BITBYBIT APPS** block, part of Shopify's "3D Bits" app, empowers professional development teams to create, test, and deploy sophisticated custom 3D & 2D Single Page Applications (SPAs) directly onto Shopify product pages. It provides a streamlined workflow, allowing you to seamlessly transition between local development, preview, and live production environments.

## Why BITBYBIT APPS? Bridging the Gap in Shopify 3D Development

Developing complex, interactive 3D applications within the traditional Shopify theme environment can be a hurdle. You might face:
- A restrictive development workflow ill-suited for dynamic applications.
- Challenges in integrating modern frontend frameworks and tools.
- Limitations with standard solutions designed for simpler, static 3D visualizations or small-scale configurators.

Large-scale 3D experiences demand robust, professional programming practices to ensure quality, maintainability, and performance. The BITBYBIT APPS block addresses these challenges by providing a structured, developer-friendly workflow that integrates your local development environment directly with Shopify's powerful app ecosystem. This approach enables you to leverage professional IDEs, enjoy features like code completion and AI assistance, and implement crucial practices such as unit testing and test-driven development.

## How It Works: Your App, Seamlessly Integrated

The BITBYBIT APPS block acts as an intelligent bridge between your custom application and the Shopify product page. Here's a glimpse of its core functionality:

1.  **Smart Environment Detection**: It automatically detects if your application is running locally (e.g., on `localhost`) for development and embeds it.
2.  **Real-time Data Sync**: It captures interactions on the Shopify product page (like variant selections or quantity changes) and sends this data in real-time to your application.
3.  **Effortless Communication**: Your app, using our `bits-pro` NPM package, can easily subscribe to these updates and react dynamically.
4.  **Flexible Modes**: It allows seamless switching between local development, preview, and live production modes, ensuring a consistent experience.

### Data Flow Visualized
```
Shopify Product Page ↔ BITBYBIT APPS Block ↔ Your SPA (using `bits-pro` NPM package)
```
When customers interact with product options, variant selectors, or other designated inputs on the page, this data is automatically relayed to your application in JSON format. This enables your app to respond instantly to user choices and create truly interactive experiences.

## The Development Journey: From Localhost to Live

Our workflow is designed to be intuitive and efficient, supporting you at every stage of development:

### 1. Local Development Mode: Build and Iterate Rapidly
- Run your Vite-based TypeScript application on a designated `localhost` port (e.g., `localhost:4242`).
- The BITBYBIT APPS block automatically detects and embeds your local app directly onto the Shopify product page.
- Experience real-time updates from product page interactions, fueling a full hot-reload development cycle.

```bash
npm run dev # Your app runs, for example, on localhost:4242
# The block detects and embeds your local app automatically.
```

### 2. Preview Mode: Test Before You Go Live
- Build your application into a single JavaScript file.
- Serve this static file locally (e.g., via `npm run watch`).
- This mode allows you to test production-like behavior while retaining the ability to make quick changes, as the file rebuilds live upon modification.
- Update the "Public Script URL" metafield in Shopify to point to your local server's static file (e.g., `https://localhost:4242/assets/index-stable.js`).

```bash
npm run watch # Builds and serves the static file locally, rebuilding on changes.
# Point the "Public Script URL" metafield to your local static file.
```

### 3. Production Mode: Deploy to the World
- Create the final, optimized JavaScript bundle for your application.
- Upload this bundle to Shopify's CDN via Content → Files.
- Update the "Public Script URL" metafield with the new CDN URL.
- Your custom application is now live and accessible to all your customers.

```bash
npm run build # Creates the optimized production bundle.
# Upload dist/assets/index-<hash>.js to Shopify Files.
# Update the "Public Script URL" metafield with the Shopify CDN URL.
```
This streamlined process helps your team ship professional product configurators and interactive apps faster and more efficiently.

## Technical Foundation: Flexible and Modern

Our architecture is built to support modern web development practices while offering flexibility.

### Core Technologies & Recommendations
- **Primary Stack**: We champion **TypeScript** with the **Vite** bundler for its speed, type safety, and excellent developer experience.
- **3D Engines**: Seamlessly integrate popular engines like **BabylonJS**, **ThreeJS**, **PlayCanvas**, or any other WebGL-based framework.
- **UI Frameworks**: Use **React**, **Vue**, **Svelte**, vanilla JavaScript, or your preferred UI library.
- **Styling**: Currently, styles should be inlined or bundled within your JavaScript. External CSS file embeds are not directly supported by the block itself.
- **Testing**: We strongly recommend **Vitest** (or your preferred testing framework) for unit testing.

### Unparalleled Framework Flexibility
While our templates and primary recommendations focus on TypeScript and leading 3D engines, the BITBYBIT APPS architecture is fundamentally agnostic. Any frontend technology that can be bundled into a single JavaScript file can theoretically be used. This means you can leverage your team's existing skills and preferred tools.

### Professional Development Environment
- **Your Choice of Editor**: Work in VSCode, Visual Studio, WebStorm, or any IDE you prefer.
- **Version Control**: Employ standard Git workflows for robust version control and collaboration.
- **Debugging & Testing**: Utilize professional debugging tools and implement comprehensive testing strategies, including unit tests.

## Our Philosophy: An Opinionated, Professional Approach

To ensure quality, maintainability, and a smooth development experience, we offer an opinionated solution:

### What We Strongly Recommend
✅ **TypeScript**: For its robust type safety, improved code clarity, and enhanced developer productivity.   
✅ **Unit Tests**: Essential for building reliable, high-quality applications and preventing regressions.   
✅ **Vite Bundler**: For its lightning-fast development server and optimized production builds.   
✅ **Our Templates**: Following our provided templates ensures a consistent project structure and easier updates.   

### Freedom to Customize (with Caveats)
While we advocate for our recommended stack, we understand the need for flexibility:   
❓ **JavaScript instead of TypeScript**: Possible, but you lose the benefits of static typing.   
❓ **Alternative Bundlers (e.g., Webpack)**: May work, but are not officially supported and may require custom configuration.   
❓ **Custom Project Structures**: You can adapt the structure, but significant deviations might complicate compatibility with future updates to our `bits-pro` package or templates.   

:::warning Customization Considerations
Deviating significantly from our recommended approach and templates is done at your own discretion. While we aim for broad compatibility, we cannot guarantee that highly customized setups will remain fully compatible with all future updates.
:::

## Jumpstart Your Project: Available Templates

To get you started quickly, we provide access to our private GitHub repository containing production-ready templates:
- **Vanilla TypeScript + React Three Fiber**
- **Vanilla TypeScript + Three.js**
- **Vanilla TypeScript + Babylon.js**
- **Vanilla TypeScript + PlayCanvas**
- **Vanilla TypeScript + Bitbybit CAD & Three.js**
- **Vanilla TypeScript + Bitbybit CAD & Babylon.js**

*(More templates focusing on other technologies may be added over time.)*

## Crafting Your User Interface: Guidelines and Best Practices

Your custom application will render within the designated theme app extension block on the product page.

### Container & Styling
- **Rendering Space**: Your app operates within the confines of the block. The dimensions of this container are typically controlled by the Shopify theme settings.
- **Custom UI**: You have the freedom to build rich, custom UI components within this embed space.
- **Styling Approach**: For maximum compatibility and to ensure your styles are self-contained, aim to bundle all styles within your JavaScript (e.g., CSS-in-JS, inline styles, or utility classes processed at build time). While breaking out of the container is technically possible, it's generally not recommended as it can lead to conflicts with the theme.
- **Full-Page Experiences**: If needed, the block can be configured (often via theme settings) to occupy a larger portion of the page, or even simulate a full-page experience, depending on your design and theme capabilities.

### Theme Integration & Independence
- **Minimize Dependencies**: Strive to make your application as theme-independent as possible. Relying heavily on theme-specific CSS classes or DOM structures can lead to your app breaking if the theme is updated.
- **Robust Design**: Design your UI to be self-contained and resilient to changes in the surrounding theme.

## Configuring the Block: The Role of Metafields

The BITBYBIT APPS block utilizes Shopify metafields to manage its behavior, particularly for switching between different script sources:

| Metafield           | Purpose                                      | Example Value(s)                                                                                                                               | Behavior Notes                                                                 |
|---------------------|----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| `Public Script URL` | Points to your app's main JavaScript file. | **Development (Preview Mode):** `https://localhost:4242/assets/index-stable.js`<br/>**Production:** `https://cdn.shopify.com/s/files/1/xxx/index-<hash>.js?version=<version>` | If this metafield is empty, the block defaults to attempting to embed from `https://localhost:4242` (Local Development Mode). |

## Important Note: Pricing and Backend Logic

The BITBYBIT APPS block and its associated workflow are designed **exclusively for frontend Single Page Application (SPA) development.**

### Frontend Focus
- **Client-Side Rendering**: Your application runs entirely in the user's browser.
- **No Built-in Backend**: We do not provide backend solutions, databases, or server-side rendering capabilities as part of this specific feature.

### Handling Pricing and Sensitive Operations
- **Secure Price Calculations**: Any logic that determines or modifies product prices **must** be handled securely. This typically requires backend validation to prevent manipulation.
- **Third-Party Apps**: For complex pricing rules or options that affect pricing, we recommend integrating with specialized third-party Shopify apps designed for this purpose. Your frontend application can then interact with these apps or reflect the pricing changes they manage.
- **Custom Backend**: If your project requires custom backend logic (e.g., for saving user configurations, complex calculations, or API integrations), you will need to develop and host this backend infrastructure separately.

## Understanding the Scope: What's Included (and What's Not)

It's crucial to understand what this setup provides and its inherent limitations.

### What This Setup Empowers You To Do:
✅ Develop sophisticated **frontend SPAs** for Shopify product pages.   
✅ Receive **real-time data** from product page interactions.   
✅ Utilize **professional development tools** and workflows (IDE, Git, testing).   
✅ Implement a **seamless deployment process** from local to production.   
✅ Leverage **template examples** and best practices to accelerate development.   
✅ Build UIs with **inline/bundled styles**, ensuring self-contained components.   

### What This Setup Does NOT Provide Out-of-the-Box:
❌ **Server-Side Rendering (SSR)**: Applications are client-side rendered.   
❌ **Backend API Solutions**: No built-in backend for custom server logic or databases.   
❌ **Direct Shopify Admin API Integration**: While technically possible to call Shopify APIs from the frontend with    appropriate authentication, our templates don't include examples for this, and it requires careful security consideration.   
❌ **Database or Persistence Layer**: User-specific data persistence needs a separate backend solution.   
❌ **Built-in Secure Pricing Validation**: Price calculations affecting the cart must be validated server-side.   

### For Advanced Use Cases:
If your project demands features like Server-Side Rendering, custom backend APIs, deep Shopify Admin integrations, or a dedicated database, these components will need to be architected and implemented by your team separately. While the BITBYBIT APPS block can host the frontend interface for such systems, the backend infrastructure falls outside the scope of this specific tool.

## Ready to Build? Getting Started with BITBYBIT APPS

Embark on your journey to creating stunning product experiences.

### Prerequisites
- An active **Annual Pro subscription** to the "3D Bits" Shopify app.
- **Access tokens** to our private GitHub repository (provided with the Pro plan).
- Solid knowledge of **TypeScript** and modern web development principles.
- A good understanding of Shopify theme structure and development concepts.

### Quick Start Guide
1.  **Clone a Template**: Choose a suitable template from our private GitHub repository.
2.  **Install Dependencies**: Navigate to the project directory and run `npm install`.
3.  **Start Local Development**: Execute `npm run dev`. Your app should now be running locally (e.g., on `http://localhost:4242`).
4.  **Add the Block**: In your Shopify theme editor, add the **BITBYBIT APPS** block to a product page template.
5.  **Preview**: Open a product page where the block is active. You should see your local application embedded and running.
6.  **Test Interactivity**: Interact with product options (e.g., change quantity, select variants). Check your browser's developer console; your application (via `bits-pro`) should log these input changes.
7.  **Link Metafield (Optional for Preview/Prod)**: For Preview and Production modes, create a dynamic link from the "Public Script URL" setting in the app block to a product metafield. This allows you to manage the script URL per product if needed, or globally.
8.  **Begin Building**: Start developing your custom 3D/2D application logic!

### Deployment Process Recap
1.  **Develop & Test Locally**: Use `npm run dev` for rapid iteration.
2.  **Preview Changes**: Use `npm run watch` and the local static file server to test a production-like build.
3.  **Build for Production**: Run `npm run build` to generate the final optimized bundle.
4.  **Upload to Shopify**: Go to Content → Files in your Shopify Admin and upload the generated JavaScript file (usually found in `dist/assets/`).
5.  **Update Metafield**: Copy the Shopify CDN URL of the uploaded file and paste it into the `Public Script URL` metafield (or the app block setting linked to it). Your app is now live!

## We're Here to Help: Support and Resources

- 📧 **Email Support**: Reach out to us at [info@bitbybit.dev](mailto:info@bitbybit.dev) for direct assistance.
- 💬 **Discord Community**: Join our [Discord Server](https://discord.gg/GSe3VMe) to connect with other developers and the Bitbybit team.
- 🛠️ **Custom Development Services**: Need expert help building your vision? We offer professional development services.

---

*The BITBYBIT APPS block and associated professional development features are available exclusively with the Annual Pro subscription plan for "3D Bits".*