---
sidebar_position: 4
title: "Understanding Asset Security and Public Accessibility in 3D Bits"
sidebar_label: Your Assets & Security
description: Critical information about how 3D assets are hosted and accessed in 3D Bits, including public accessibility, intellectual property considerations, and best practices for protecting sensitive information.
tags: [shopify, 3d-bits, security]
---

# Your Assets & Security: What You Need to Know

Before uploading 3D assets to use with 3D Bits, it's **critical** that you understand how these assets are hosted, accessed, and what this means for your intellectual property and sensitive information.

:::danger Critical Information
This page contains essential information about asset security and public accessibility. **Every merchant using 3D Bits must read and understand this content** before uploading any 3D models, textures, or other assets to their store.
:::

## How 3D Assets Work on the Web

To understand the security implications of using 3D assets in your store, you need to understand a fundamental truth about how web content works:

**3D assets work exactly like images on your website.** Just as customers can right-click and save product photos from your store, anyone with technical knowledge can download your 3D models, textures, and other assets.

### The Technical Reality

When a customer visits your product page with a 3D configurator:

1. **Your 3D files are downloaded to their browser** - This includes GLTF/GLB models, textures, sounds, and any other assets
2. **Files are cached on their device** - For performance, browsers cache these files locally
3. **Files are publicly accessible** - Anyone who knows the URL can access and download the files
4. **Technical users can extract assets** - Browser developer tools, network inspection, and other readily available tools make downloading these assets straightforward

This is not a limitation of 3D Bits—**this is how the web works**. It's the same reason why:
- People can download images from your product pages
- Videos on your site can be captured
- Any publicly accessible content can be saved

## Where Your Assets Are Hosted

### Shopify CDN

When you upload 3D assets through Shopify's **Content → Files** section, these files are hosted on **Shopify's Content Delivery Network (CDN)**. This has several implications:

**Public Accessibility:**
- Files uploaded to Shopify are **publicly accessible by design**
- Anyone with the URL can view or download the file
- This is necessary for your customers' browsers to load the assets
- Shopify's CDN is optimized for fast, global delivery of public content

**Shopify's File Management:**
Read Shopify's official documentation about how they handle files:
- [Shopify Files Overview](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/file-uploads)
- [Understanding CDN](https://shopify.dev/docs/storefronts/themes/best-practices/performance/platform)

**File Permissions:**
Shopify does not provide options to make files private or password-protected when they're used in your store's frontend. Files must be publicly accessible for your store to function.

### Alternative Hosting

If you choose to host 3D assets on your own server or another CDN:

**CORS Requirements:**
- Files **must** be publicly accessible via HTTPS
- **CORS (Cross-Origin Resource Sharing) must be enabled**
- Without proper CORS headers, browsers will block the files from loading
- This is a web security standard, not a 3D Bits requirement

**What CORS Means:**
CORS headers explicitly declare that your assets can be accessed by other domains (like your Shopify store). This is necessary for web functionality but also means the files are designed to be publicly accessible.

Example CORS configuration:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Intellectual Property & Rights

### You Are Responsible for Your Assets

**Critical responsibility:** You must have the legal right to use every component of your 3D assets:

**For 3D Models:**
- ✅ Models you created yourself
- ✅ Models commissioned specifically for your use with proper licensing
- ✅ Models purchased with commercial licenses that permit web use
- ✅ Models provided by manufacturers with permission
- ❌ Models downloaded from unauthorized sources
- ❌ Models with licenses that prohibit web distribution
- ❌ Models that infringe on others' intellectual property

**For Textures:**
- Ensure you have rights to all texture images used
- Stock texture licenses vary—verify web use is permitted
- Custom photography you own is safe to use

**For Sounds:**
- Background music, UI sounds, and audio effects require proper licensing
- Many audio libraries prohibit web distribution without specific licenses

**For Embedded Content:**
- Any logos, branding, or design elements must be properly licensed
- Third-party brand materials require explicit permission

:::warning Your Legal Responsibility
**3D Bits renders the assets you provide.** We do not verify, validate, or take responsibility for the legality, licensing, or intellectual property status of your assets. You are solely responsible for ensuring you have the legal right to use and publicly distribute all components of your 3D content.
:::

## Protecting Your Intellectual Property

Given that 3D assets are publicly accessible, how can you protect your intellectual property?

### What NOT to Upload

**Never upload these types of assets:**

❌ **Production-Grade CAD Files**
- Precise engineering drawings with exact dimensions
- Manufacturing specifications and tolerances
- Proprietary mechanical designs
- Technical documentation embedded in models

❌ **Trade Secrets**
- Internal component designs not visible in finished products
- Proprietary assembly methods
- Confidential manufacturing processes
- Unreleased product designs

❌ **High-Precision Models**
- Models that could be used for reverse engineering
- Designs with embedded technical specifications
- Unprotected proprietary shapes or mechanisms

### What You Should Upload

**Safe approaches for public-facing 3D assets:**

✅ **Marketing-Quality Models**
- Simplified, lower-poly versions of your products
- Visual approximations that look good but aren't manufacturing-accurate
- Models that show the product's appearance but not precise engineering

✅ **Abstracted Designs**
- Remove or simplify proprietary internal components
- Modify exact dimensions slightly while maintaining visual accuracy
- Focus on customer-facing aesthetics rather than technical precision

✅ **Finished Product Representations**
- Show what customers see, not how it's made
- Hide internal mechanisms and assemblies
- Present the product's form and appearance

### Real-World Example

**Bad Practice:**
Uploading a STEP file converted directly from your CAD system with:
- Exact manufacturing dimensions
- Proprietary hinge mechanisms
- Internal component placement
- Assembly tolerances and specifications

**Good Practice:**
Creating a simplified GLTF model that:
- Shows the product's external appearance accurately
- Uses simplified geometry (lower poly count)
- Removes or abstracts internal mechanisms
- Maintains visual quality without manufacturing precision
- Represents what customers see, not engineering details

## Think of 3D Assets Like Product Photos

The best mental model for understanding 3D asset security is to **treat them exactly like product photographs**:

**Product Photos:**
- Show your product's appearance
- Are publicly accessible on your site
- Can be downloaded by anyone
- Don't reveal manufacturing secrets
- Focus on marketing, not engineering

**3D Models (Should Be):**
- Show your product's appearance in 3D
- Are publicly accessible in browsers
- Can be downloaded by technical users
- Don't reveal manufacturing secrets
- Focus on customer experience, not technical specs

You wouldn't photograph and publish detailed internal engineering drawings of your product. Apply the same thinking to 3D models.

## File Size and Performance Considerations

### Optimization is Essential

While Shopify may allow you to upload large files, **just because you can doesn't mean you should**. Large 3D files significantly impact your customers' experience:

**Performance Impact:**
- Slower page load times
- Longer wait before customers can interact with configurators
- Higher bandwidth consumption for mobile users
- Reduced performance on older devices

**Best Practices:**
If your model is very large (multiple megabytes), it's likely too detailed for web use. This is usually a sign you should:
1. Reduce polygon count
2. Compress textures
3. Simplify geometry
4. Remove unnecessary detail

See [Preparing GLTF Assets](../../3d-assets/preparing-gltf) for optimization guidance.

### Multiple Files

If needed, you can split complex products across multiple GLTF files:
- 3D Bits can load several files simultaneously
- Each file can be hosted separately
- Instancing can reuse identical components efficiently

## Downloads and Customer Access

### What Customers Can Access

**Through Normal Browsing:**
- 3D models are loaded into their browser's memory
- Files are cached locally for performance
- Network inspection shows file URLs

**With Basic Technical Knowledge:**
- Browser developer tools reveal asset URLs
- Network tab shows all downloaded files
- File URLs can be copied and accessed directly
- Assets can be saved to their computer

**This is Normal Web Behavior:**
This isn't hacking or unauthorized access—it's how web browsers work. It's the same as right-clicking to save an image, just with 3D files instead.

### What You Can't Prevent

You cannot prevent technically skilled users from:
- ❌ Viewing your 3D model files
- ❌ Downloading GLTF/GLB files
- ❌ Extracting textures and materials
- ❌ Importing models into 3D software
- ❌ Analyzing model structure

**These are not security vulnerabilities**—they're inherent characteristics of how web content works.

## Best Practices Summary

### Before Uploading Any Asset

**Legal Review:**
1. ☑ Verify you own or have licensed all components
2. ☑ Check that your licenses permit web distribution
3. ☑ Ensure no third-party IP is included without permission
4. ☑ Confirm models don't contain confidential information

**Technical Review:**
1. ☑ Remove proprietary internal components
2. ☑ Simplify models to marketing-quality only
3. ☑ Strip out embedded metadata and technical specifications
4. ☑ Optimize file size for web delivery
5. ☑ Test that models don't reveal sensitive information

**Security Review:**
1. ☑ Confirm models can be safely made public
2. ☑ Verify no manufacturing secrets are exposed
3. ☑ Check that visual quality meets marketing needs
4. ☑ Ensure models represent finished products only

### For Organizations with Sensitive IP

If your organization has highly sensitive intellectual property:

**Consider:**
- Having dedicated 3D artists create web-specific versions
- Establishing clear guidelines for what can/cannot be published
- Creating approval workflows before assets go live
- Training staff on the public nature of web assets
- Maintaining separate production vs. web-ready asset libraries

**Document:**
- Internal policies for 3D asset preparation
- Approval processes for public 3D content
- Guidelines for simplification and abstraction
- Checklists for pre-publication review

## Understanding the Trade-Off

Using 3D configurators on your website requires accepting a fundamental trade-off:

**You Gain:**
- Enhanced customer experience
- Interactive product visualization
- Reduced return rates
- Competitive differentiation
- Higher engagement and conversion

**You Accept:**
- 3D assets are publicly accessible
- Technical users can download models
- Models work like images—they're public content
- Protection comes from simplification, not restrictions

This is the same trade-off you make with:
- Product photography (high-res images are downloadable)
- Product videos (can be captured and downloaded)
- Marketing materials (brochures, catalogs are saveable)

The key is ensuring what you publish is safe to be public.

## Questions and Support

### Common Questions

**Q: Can we password-protect our 3D models?**
A: No. Models must be publicly accessible for browsers to load them. Password protection would break the functionality.

**Q: Can we restrict who can download our models?**
A: No. This is fundamentally incompatible with how web browsers work. If a browser can display it, a user can access it.

**Q: What if someone steals our 3D models?**
A: Treat this like product photos—publish only what you're comfortable being public. Use simplified models that don't contain sensitive information. Your legal rights still apply if someone misuses your content, but prevention comes from what you choose to upload.

**Q: Can we use different models for different customers?**
A: Technically yes, but they'd still be publicly accessible. The solution isn't access control—it's ensuring public-facing models don't contain sensitive information.

**Q: Why can't we make these files private?**
A: Because customers' browsers need to download the files to display your configurator. "Private web content" is a contradiction—if it's on the web, it's accessible.

### Getting Help

If you're uncertain about:
- Whether a model is safe to publish
- How to simplify production files for web use
- Legal aspects of your specific assets
- Technical optimization approaches

Contact:
- **Your legal team** - For intellectual property questions
- **3D Bits support** - For technical guidance on optimization
- **Professional 3D artists** - For creating web-safe versions of sensitive models

---

## Final Reminder

:::danger Essential Understanding
Before using 3D Bits, you must understand and accept:

1. ✅ **3D assets are public**, just like images on your website
2. ✅ **Files can be downloaded** by anyone with technical knowledge
3. ✅ **You are responsible** for ensuring you have rights to all assets
4. ✅ **You are responsible** for not uploading confidential information
5. ✅ **This is how the web works**—not a limitation of 3D Bits

If you cannot accept these terms, **do not use 3D models in your online store**. The same principles apply to any 3D content on any website, not just 3D Bits or Shopify.
:::

---

**Now that you understand asset security and public accessibility**, you can make informed decisions about what 3D content to create and publish. The next step is learning how to [prepare optimized GLTF assets](../../3d-assets/preparing-gltf) that are both visually appealing and safe for public distribution.
