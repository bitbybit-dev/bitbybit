---
sidebar_position: 10
title: Hosting Bitbybit Assets on Your Own CDN
sidebar_label: Self-Hosting Assets
description: Learn how to host Bitbybit assets on your own CDN infrastructure for improved reliability, performance, and control.
tags: [cdn, hosting, deployment, performance, assets]
---

import Admonition from '@theme/Admonition';

# Hosting Bitbybit Assets on Your Own CDN

To simplify the setup process for new users and customers, our runners and various assets are hosted on a generally available CDN called **jsDelivr**. Our online editors and runners that you set up on your website all load critical assets from the jsDelivr CDN. While convenient, this dependency introduces a potential point of failure: what if your website suddenly stops working because jsDelivr went down? This is a realistic scenario that happens more often than we'd like to admit.

The solution? Host Bitbybit assets on your own infrastructure using a CDN provider you trust.

## Understanding CDNs

### What is a CDN?

A **Content Delivery Network (CDN)** is a geographically distributed network of servers designed to deliver web content efficiently to users based on their physical location. Instead of serving all content from a single origin server, CDNs replicate and cache your static assets (JavaScript files, images, fonts, etc.) across multiple data centers worldwide.

### How CDNs Function

When a user requests content from a CDN-enabled website:

1. The CDN receives the request and determines the user's geographic location
2. The request is routed to the nearest edge server (Point of Presence)
3. If the content is cached on that edge server, it's delivered immediately
4. If not cached, the edge server retrieves it from the origin, caches it, and serves it to the user
5. Subsequent requests from nearby users receive the cached version

### Performance Benefits of CDNs

CDNs significantly improve website performance through:

- **Reduced Latency**: Content is served from geographically closer servers, minimizing the physical distance data travels
- **Faster Load Times**: Cached static assets load instantly without hitting the origin server
- **Bandwidth Optimization**: CDNs compress and optimize content delivery
- **Load Distribution**: Traffic is distributed across multiple servers, preventing bottlenecks
- **High Availability**: If one server fails, requests automatically route to another

### Why Consider Self-Hosting Bitbybit Assets?

While we provide jsDelivr hosting for convenience, there are compelling reasons to host assets on your own infrastructure:

1. **Reliability & Control**: You're not dependent on third-party uptime. If jsDelivr experiences an outage, your application continues functioning
2. **Performance Optimization**: Choose a CDN provider optimized for your specific user base and geographic regions
3. **Version Stability**: Pin specific versions without worrying about external changes or deprecations
4. **Compliance & Security**: Meet enterprise requirements for asset hosting and security policies
5. **Custom Caching Strategies**: Implement caching rules tailored to your application's needs
6. **Cost Management**: For high-traffic applications, your own CDN plan might be more cost-effective

## Downloading Bitbybit Assets

All assets used by the Bitbybit platform are available for download from our GitHub repository:

**[Bitbybit Assets Releases](https://github.com/bitbybit-dev/bitbybit-assets/releases)**

Each release contains a complete set of assets packaged as a `.zip` file. Download the version that matches your Bitbybit implementation.

## Identifying Required Assets

### You Don't Need Everything

An important consideration: **you probably don't need to host all assets**, only the ones your specific implementation requires.

**Examples:**
- If you use `bitbybit-runner-babylonjs.js`, you won't need `bitbybit-runner-threejs.js`, `bitbybit-runner-playcanvas.js`, or any of the lite runners
- If you only use the OCCT kernel, you'll only need to host `bitbybit-occt-webworker.js`
- If you never load GLTF files with Draco compression, you don't need the Draco decompressor

### Determining Your Asset Dependencies

Identifying exactly which assets you need depends on the features you're implementing. Some assets are loaded dynamically only when specific features are activated.

<Admonition type="tip" title="Recommended Approach for Identifying Assets">

1. **Use Browser DevTools**: Open your application and access the Network tab
2. **Exercise All Features**: Navigate through your application, activating all features and workflows
3. **Filter CDN Requests**: Look for requests matching the pattern:
   ```
   https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@<version-number-of-bitbybit>
   ```
4. **Document Assets**: Note every asset loaded from this domain—these are the files you should migrate to your own hosting

</Admonition>

### Alternative Approach: Host Everything

While potentially inefficient, you can simply host the complete assets folder on your infrastructure. This ensures all potential dependencies are available, though it may consume more storage and bandwidth than necessary.

## Configuring the Runner to Use Your CDN

### Using the Runner with `cdnUrl` Option

When initializing the Bitbybit Runner, you pass an options object containing properties like `canvasId`, `enableOCCT`, etc. This same object supports a property called **`cdnUrl`**, which tells the runner where to load assets from.

**Example Configuration:**

```javascript
const runnerOptions = {
    canvasId: 'myCanvas',
    enableOCCT: true,
    enableJSCAD: false,
    enableManifold: false,
    cdnUrl: 'https://cdn.yourownhosting.com/bitbybit/', // Your custom CDN URL
    loadFonts: [],
};

const runner = window.bitbybitRunner.getRunnerInstance();
const { bitbybit, Bit } = await runner.run(runnerOptions);
```

### Using NPM Packages with `GlobalCDNProvider`

If you're using Bitbybit's NPM packages directly in your project (rather than the standalone runner), you need to configure the CDN URL differently. Import the `GlobalCDNProvider` from `@bitbybit-dev/base` and set the CDN URL before initializing any Bitbybit services.

**Example Configuration:**

```javascript
import { GlobalCDNProvider } from "@bitbybit-dev/base";

// Set your custom CDN URL before initializing Bitbybit
GlobalCDNProvider.BITBYBIT_CDN_URL = "https://cdn.yourownhosting.com/bitbybit/";

// Now initialize your Bitbybit services as usual
// All asset requests will use your custom CDN URL
```

<Admonition type="info" title="NPM Package Users">
  <p>If you're using NPM packages like <code>@bitbybit-dev/occt</code>, <code>@bitbybit-dev/babylonjs</code>, <code>@bitbybit-dev/threejs</code>, or <code>@bitbybit-dev/playcanvas</code>, you must use the <code>GlobalCDNProvider</code> approach. The <code>cdnUrl</code> option in the runner configuration only applies when using the standalone runner files.</p>
</Admonition>

### Important Considerations

**Public Access:** All hosted assets must be completely public and accessible without authentication.

**Recommended Hosting Strategy:**
- Use global CDN providers (e.g., AWS CloudFront, Cloudflare, Azure CDN, Google Cloud CDN)
- Enable automatic deployment of static assets across regions
- Implement proper caching headers and strategies
- Configure cache invalidation when updating versions

**Geographic Distribution:** Quality CDN providers automatically distribute assets to edge locations closest to your users, minimizing latency and maximizing performance.

**Path Structure:** Ensure your CDN URL maintains the same folder structure as the Bitbybit assets repository. The runner expects assets to be organized in specific paths relative to the `cdnUrl`.

<Admonition type="warning" title="Maintain Correct Folder Structure">
  <p>The runner expects assets to follow the exact same folder structure as found in the Bitbybit assets repository. If the structure doesn't match, assets will fail to load.</p>
</Admonition>

## Testing Your Configuration

After setting up your custom CDN:

1. Clear your browser cache
2. Load your application
3. Open DevTools Network tab
4. Verify all assets load from your CDN domain
5. Test all features to ensure no assets are missing
6. Monitor for any 404 errors indicating missing files

## Popular CDN Providers

Here are some popular CDN providers you might consider for hosting Bitbybit assets:

- **Cloudflare**: Offers a generous free tier with global edge locations
- **AWS CloudFront**: Integrates seamlessly with S3 storage and offers fine-grained control
- **Azure CDN**: Excellent for enterprises already using Microsoft Azure
- **Google Cloud CDN**: Fast global network, ideal for Google Cloud users
- **Fastly**: Premium CDN with real-time configuration and edge computing capabilities
- **BunnyCDN**: Cost-effective option with good performance and simple pricing

Choose a provider based on your budget, geographic user base, existing infrastructure, and specific feature requirements.

## Conclusion

While jsDelivr hosting provides convenience for getting started, self-hosting Bitbybit assets gives you greater control, reliability, and performance optimization opportunities. By carefully selecting the assets you need and configuring a robust CDN solution, you can ensure your Bitbybit-powered applications remain fast, reliable, and independent of third-party infrastructure.

For more information about using the Bitbybit Runner, see [Introducing Bitbybit Runner](/learn/runners/intro).
