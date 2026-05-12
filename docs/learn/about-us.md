---
sidebar_position: 4
title: Our Vision
sidebar_label: Our Vision
description: Why Bitbybit exists, our open-core philosophy, and how commercial products sustain the open-source foundation.
tags: [vision, philosophy, open-source, business-model]
---

# Our Vision

## Why We Built This

For decades, the world of 3D creation has been locked behind proprietary software. Industry-specific tools, incompatible file formats, and expensive licenses kept geometry programming out of reach for most people. If you wanted to learn how CAD software actually worked, you needed to buy a seat and figure it out inside a closed ecosystem.

The web changed everything else. From its earliest days, anyone could right-click "View Source" and learn how things were built. That culture of openness accelerated innovation across every industry it touched.

We believe 3D should work the same way.

Bitbybit exists to make geometry programming accessible on the open web. We provide the building blocks - algorithms, kernels, rendering integrations - so that anyone can create 3D experiences without being locked into a single vendor or platform.

## The Open-Core Model

We are transparent about how this works. Our business follows an **open-core model**: the foundational geometry engine is free and open-source, while managed services and specialized applications generate the revenue that funds development.

### What is free and open

The core NPM packages - wrapping OpenCASCADE, JSCAD, Manifold, and our base utilities - are MIT-licensed and always will be. You can install them, inspect the source, modify them, and ship them in commercial products. (Third-party dependencies like OpenCASCADE retain their own licenses, such as LGPL.) The visual IDEs are free to use. Runners are free to deploy under the [Bitbybit Runner License](./runners/licensing).

This is not a trial or a freemium teaser. The open-source core is production-grade software that powers real applications.

### What is commercial

Revenue comes from four sources:

1. **CAD Cloud API** - Managed server infrastructure for heavy geometry processing. Customers pay based on usage.
2. **3D Bits for Shopify** - A subscription-based app that brings 3D configurators to e-commerce storefronts, including the no-code [Viewer Editor](./getting-started/viewer-editor/intro) for building configurators visually.
3. **Premium features** - Certain advanced algorithms (`bitbybit.advanced`, `bitbybit.things`, `bitbybit.asset`) that go beyond the open-source core.
4. **Enterprise services** - Custom development, dedicated infrastructure, and bespoke CAD solutions built in close collaboration with B2B clients.

### Why this matters

Commercial revenue directly funds the open-source core. Every subscription, API call, and enterprise contract makes the free tools better for everyone. When a manufacturing company pays for a custom CAD solution, that investment flows back into improving the core of bitbybit that any developer can use for free.

This creates a virtuous cycle: developers and designers start with the free tools, build their skills, and as their needs grow - more compute, more automation, more support - they move to paid products. Meanwhile, the free tier keeps getting stronger.

## Who We Serve

Our users range from students learning geometry for the first time to enterprise teams automating industrial manufacturing workflows. We design for both.

**For learners and makers:** Zero-friction browser tools, no accounts required, visual programming that teaches real concepts. We believe that educated users become the next wave of creators - and that spreading 3D literacy benefits everyone.

**For businesses and enterprises:** Production-grade infrastructure, custom development, and a team that understands CAD at a deep level. We partner with organizations in manufacturing, industrial design, e-commerce, and beyond to build and maintain solutions that work at scale. We develop the server-side components ourselves or in close collaboration with our clients to ensure quality and security.

These audiences are not in tension. The open tools create a pipeline of skilled practitioners. The commercial tools give those practitioners - and the companies they work for - the power to build real products.

## Our Commitment

We don't aim to reinvent the web. We leverage its best standards - open-source packages on NPM, WebAssembly for performance, standard rendering engines for display. We meet developers where they already are.

We are building the infrastructure for the next generation of 3D on the web. Whether you are here to learn, to build, or to scale - welcome.
