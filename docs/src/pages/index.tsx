import type { ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import {
  RocketIcon,
  ArtIcon,
  CodeIcon,
  CadIcon,
  PrinterIcon,
  GamepadIcon,
  SofaIcon,
  BuildingIcon,
  TargetIcon,
  OpenSourceIcon,
  BookIcon,
  RingIcon,
  BlocksIcon,
  UserPlusIcon,
  MonacoIcon,
  ShopifyBagIcon,
  NoCodeIcon,
  ReteEditorIcon,
  BlocklyEditorIcon,
  TypeScriptEditorIcon,
} from "@site/src/components/Icons";

import styles from "./index.module.css";

// Learning Path Data
const learningPaths = [
  {
    title: "Visual Programming",
    subtitle: "No coding required",
    description: "Create 3D models using intuitive node-based editors like Rete and Blockly. Perfect for designers and beginners.",
    IconComponent: ArtIcon,
    link: "/learn/getting-started/overview",
    features: ["Drag & drop nodes", "Real-time preview", "Export ready models"],
  },
  {
    title: "TypeScript & JavaScript",
    subtitle: "Full programmatic control",
    description: "Write code in our Monaco editor with full TypeScript support, autocomplete, and access to the complete API.",
    IconComponent: CodeIcon,
    link: "/learn/code/intro",
    features: ["Type-safe API", "Monaco editor", "NPM packages"],
  },
  {
    title: "CAD Kernels",
    subtitle: "Industrial-grade geometry",
    description: "Leverage powerful CAD kernels like OpenCascade (OCCT), JSCAD, and Manifold for precise 3D modeling.",
    IconComponent: CadIcon,
    link: "/learn/code/common/occt/what-is-occt",
    features: ["Boolean operations", "Fillets & chamfers", "STEP/IGES export"],
  },
];

// Technology Cards Data
const technologies = [
  {
    name: "Three.js",
    description: "Integrate Bitbybit's CAD capabilities with the popular Three.js rendering engine.",
    link: "/learn/npm-packages/threejs",
    color: "#049EF4",
  },
  {
    name: "Babylon.js",
    description: "Build powerful 3D experiences combining Bitbybit geometry with Babylon.js features.",
    link: "/learn/npm-packages/babylonjs",
    color: "#BB464B",
  },
  {
    name: "Shopify 3D Bits",
    description: "Add interactive 3D product configurators to your Shopify store with our app.",
    link: "/learn/3d-bits/intro",
    color: "#96BF48",
  },
  {
    name: "Script Runners",
    description: "Execute visual scripts directly on your website without writing code.",
    link: "/learn/runners/intro",
    color: "#f0cebb",
  },
];

// What You Can Build Data
const buildExamples = [
    { IconComponent: SofaIcon, title: "Furniture", desc: "Customizable tables, chairs, and decor" },
    { IconComponent: PrinterIcon, title: "3D Printing", desc: "Print-ready models with proper manifolds" },
    { IconComponent: CadIcon, title: "Engineering", desc: "Mechanical parts and assemblies" },
    { IconComponent: GamepadIcon, title: "Game Assets", desc: "Procedural 3D models for games" },
  { IconComponent: BuildingIcon, title: "Architecture", desc: "Parametric buildings, facades, and structures" },
  { IconComponent: RingIcon, title: "Jewelry", desc: "Intricate rings, pendants, and accessories" },
];

function HeroSection() {
  return (
    <header className={styles.heroSection}>
      <div className={styles.heroBackground}>
        <div className={styles.heroGrid}></div>
        {/* Floating Particles */}
        <div className={styles.heroParticles}>
          <div className={`${styles.heroParticle} ${styles.heroParticle1}`}></div>
          <div className={`${styles.heroParticle} ${styles.heroParticle2}`}></div>
          <div className={`${styles.heroParticle} ${styles.heroParticle3}`}></div>
          <div className={`${styles.heroParticle} ${styles.heroParticle4}`}></div>
          <div className={`${styles.heroParticle} ${styles.heroParticle5}`}></div>
          <div className={`${styles.heroParticle} ${styles.heroParticle6}`}></div>
        </div>
        {/* Geometric Shapes */}
        <svg className={`${styles.heroGeometric} ${styles.heroGeo1}`} viewBox="0 0 100 100" fill="none">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#F0CEBB" strokeWidth="1.5" fill="none"/>
        </svg>
        <svg className={`${styles.heroGeometric} ${styles.heroGeo2}`} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" stroke="#F0CEBB" strokeWidth="1" fill="none"/>
          <circle cx="50" cy="50" r="25" stroke="#F0CEBB" strokeWidth="0.5" fill="none"/>
        </svg>
        <svg className={`${styles.heroGeometric} ${styles.heroGeo3}`} viewBox="0 0 100 100" fill="none">
          <polygon points="50,10 90,80 10,80" stroke="#F0CEBB" strokeWidth="1" fill="none"/>
        </svg>
      </div>
      <div className={styles.heroContent}>
        {/* Logo with 3D Particles */}
        <div className={styles.heroLogoContainer}>
          <div className={styles.logoParticles}>
            <span className={`${styles.logoParticle} ${styles.logoP1}`}></span>
            <span className={`${styles.logoParticle} ${styles.logoP2}`}></span>
            <span className={`${styles.logoParticle} ${styles.logoP3}`}></span>
            <span className={`${styles.logoParticle} ${styles.logoP4}`}></span>
            <span className={`${styles.logoParticle} ${styles.logoP5}`}></span>
            <span className={`${styles.logoParticle} ${styles.logoP6}`}></span>
          </div>
          <div className={styles.heroLogoMain}>
            <div className={styles.heroLogo}>
              <img src="/img/logo-gold-small.png" alt="Bitbybit Logo" />
            </div>
          </div>
        </div>
        {/* Badge */}
        <div className={styles.heroBadge}>
          <span className={styles.badgeIcon}>✦</span>
          <span>Learning Platform</span>
        </div>
        <Heading as="h1" className={styles.heroTitle}>
          Master <span className={styles.highlight}>3D CAD</span> on the Web
        </Heading>
        <p className={styles.heroSubtitle}>
          Learn to create stunning parametric 3D models using visual programming or code. Understand how to use our E-Commerce solutions.
          <br />
          From beginners to professionals — your journey to 3D mastery starts here.
        </p>
        <div className={styles.heroButtons}>
          <Link className={styles.primaryButton} to="/learn/getting-started/overview">
            <RocketIcon size={20} color="#1a1c1f" /> Start Learning
          </Link>
          <Link className={styles.secondaryButton} to="https://bitbybit.dev/auth/pick-plan">
            <UserPlusIcon size={20} /> Sign Up / Subscribe
          </Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>3</span>
            <span className={styles.statLabel}>CAD Kernels</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>1300+</span>
            <span className={styles.statLabel}>API Functions</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>3</span>
            <span className={styles.statLabel}>Editor Modes</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function LearningPathsSection() {
  return (
    <section className={styles.learningPaths}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Choose Your Learning Path</Heading>
          <p>Whether you prefer visual tools or writing code, we've got you covered.</p>
        </div>
        <div className={styles.pathsGrid}>
          {learningPaths.map((path, idx) => (
            <Link to={path.link} key={idx} className={styles.pathCard}>
              <div className={styles.pathIcon}>
                <div className={styles.pathIconGlow}></div>
                <div className={styles.pathIconSvg}>
                  <path.IconComponent size={56} />
                </div>
              </div>
              <h3>{path.title}</h3>
              <span className={styles.pathSubtitle}>{path.subtitle}</span>
              <p>{path.description}</p>
              <ul className={styles.pathFeatures}>
                {path.features.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
              <span className={styles.pathCta}>Explore →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatYouCanBuildSection() {
  return (
    <section className={styles.buildSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">What You Can Build</Heading>
          <p>From artistic creations to engineering precision — the possibilities are endless.</p>
        </div>
        <div className={styles.buildGrid}>
          {buildExamples.map((item, idx) => (
            <div key={idx} className={styles.buildCard}>
              <div className={styles.buildIcon}>
                <item.IconComponent size={40} />
              </div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechnologiesSection() {
  return (
    <section className={styles.techSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Integrate With Your Stack</Heading>
          <p>Bitbybit works seamlessly with popular web technologies and platforms.</p>
        </div>
        <div className={styles.techGrid}>
          {technologies.map((tech, idx) => (
            <Link to={tech.link} key={idx} className={styles.techCard}>
              <div className={styles.techBorder} style={{ borderColor: tech.color }}></div>
              <h3 style={{ color: tech.color }}>{tech.name}</h3>
              <p>{tech.description}</p>
              <span className={styles.techLink}>Learn more →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  return (
    <section className={styles.communitySection}>
      <div className="container">
        <div className={styles.communityContent}>
          <div className={styles.communityText}>
            <Heading as="h2">Join Our Community</Heading>
            <p>
              Connect with fellow creators, get help, share your projects, and stay updated
              with the latest features and tutorials.
            </p>
            <div className={styles.communityButtons}>
              <a href="https://discord.gg/GSe3VMe" target="_blank" className={styles.discordButton}>
                <img src="https://bitbybit.dev/assets/social/logo-discord.svg" alt="Discord" />
                Join Discord
              </a>
              <a href="https://github.com/bitbybit-dev/bitbybit" target="_blank" className={styles.githubButton}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Star on GitHub
              </a>
            </div>
          </div>
          <div className={styles.communityLinks}>
            <Link to="/blog" className={styles.communityLink}>
              <BookIcon size={40} />
              <div>
                <h4>Blog</h4>
                <p>Latest news and tutorials</p>
              </div>
            </Link>
            <Link to="/learn/github" className={styles.communityLink}>
              <OpenSourceIcon size={40} />
              <div>
                <h4>Open Source</h4>
                <p>Explore our GitHub repos</p>
              </div>
            </Link>
            <a href="https://bitbybit.dev/auth/pick-plan" className={styles.communityLink}>
              <RocketIcon size={40} />
              <div>
                <h4>Support Us</h4>
                <p>Help fund development</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShopifyBitsSection() {
  return (
    <section className={styles.shopifyBitsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">3D Bits for Shopify</Heading>
          <p>
            Add interactive 3D product configurators to your Shopify store — documentation and tutorials available here.
          </p>
        </div>
        <div className={styles.shopifyBitsGrid}>
          <Link to="/learn/3d-bits/intro" className={styles.shopifyBitsCard}>
            <div className={styles.shopifyBitsCardGlow}></div>
            <div className={styles.shopifyBitsIcon}>
              <div className={styles.shopifyBitsIconGlow}></div>
              <div className={styles.shopifyBitsIconSvg}>
                <ShopifyBagIcon size={64} color="#96BF48" />
              </div>
            </div>
            <h3>3D Bits App Documentation</h3>
            <p>
              Learn how to install, configure, and use the 3D Bits app to display interactive 3D models and configurators on your Shopify product pages.
            </p>
            <span className={styles.shopifyBitsCta}>Read the Docs →</span>
          </Link>
          <Link to="/learn/getting-started/viewer-editor/intro" className={styles.shopifyBitsCard}>
            <div className={styles.shopifyBitsCardGlow}></div>
            <div className={styles.shopifyBitsIcon}>
              <div className={styles.shopifyBitsIconGlow}></div>
              <div className={styles.shopifyBitsIconSvg}>
                <NoCodeIcon size={64} color="#f0cebb" />
              </div>
            </div>
            <h3>No-Code Viewer Editor</h3>
            <p>
              Create stunning 3D configurators without writing any code. Use our visual editor to design product experiences with drag-and-drop simplicity.
            </p>
            <span className={styles.shopifyBitsCta}>Start Creating →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Ready to Create Something Amazing?</Heading>
          <p>Start building 3D models today — no installation required. Launch any editor directly.</p>
        </div>
        <div className={styles.ctaHeader}>
          <Link className={styles.primaryButton} to="/learn/getting-started/overview">
            <BookIcon size={20} color="#1a1c1f" /> Browse Tutorials
          </Link>
        </div>
        <div className={styles.editorCardsGrid}>
          {/* Rete Editor Card */}
          <a href="https://bitbybit.dev/app?editor=rete" className={`${styles.editorCard} ${styles.editorCardRete}`}>
            <div className={styles.editorCardGlow}></div>
            <div className={styles.editorCardContent}>
              <div className={styles.editorIconWrapper}>
                <ReteEditorIcon size={56} />
              </div>
              <h3 className={styles.editorTitle}>Rete Editor</h3>
              <p className={styles.editorDescription}>Wire-based visual programming with connected nodes</p>
              <div className={styles.editorTags}>
                <span className={styles.editorTag}>Visual</span>
                <span className={styles.editorTag}>Node-Based</span>
              </div>
              <div className={styles.editorLaunchBtn}>
                <span>Launch Editor</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
            <div className={styles.editorCardShine}></div>
          </a>
          
          {/* Blockly Editor Card */}
          <a href="https://bitbybit.dev/app?editor=blockly" className={`${styles.editorCard} ${styles.editorCardBlockly}`}>
            <div className={styles.editorCardGlow}></div>
            <div className={styles.editorCardContent}>
              <div className={styles.editorIconWrapper}>
                <BlocklyEditorIcon size={56} />
              </div>
              <h3 className={styles.editorTitle}>Blockly Editor</h3>
              <p className={styles.editorDescription}>Snap-together blocks for intuitive programming</p>
              <div className={styles.editorTags}>
                <span className={styles.editorTag}>Beginner Friendly</span>
                <span className={styles.editorTag}>Blocks</span>
              </div>
              <div className={styles.editorLaunchBtn}>
                <span>Launch Editor</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
            <div className={styles.editorCardShine}></div>
          </a>
          
          {/* TypeScript Editor Card */}
          <a href="https://bitbybit.dev/app?editor=typescript" className={`${styles.editorCard} ${styles.editorCardTypescript}`}>
            <div className={styles.editorCardGlow}></div>
            <div className={styles.editorCardContent}>
              <div className={styles.editorIconWrapper}>
                <TypeScriptEditorIcon size={56} />
              </div>
              <h3 className={styles.editorTitle}>TypeScript Editor</h3>
              <p className={styles.editorDescription}>Full code control with Monaco editor & IntelliSense</p>
              <div className={styles.editorTags}>
                <span className={styles.editorTag}>Pro</span>
                <span className={styles.editorTag}>Full Control</span>
              </div>
              <div className={styles.editorLaunchBtn}>
                <span>Launch Editor</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
            <div className={styles.editorCardShine}></div>
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Learn ${siteConfig.title}`}
      description="Master 3D CAD modeling on the web with Bitbybit. Learn visual programming, TypeScript, and CAD kernels like OpenCascade.">
      <HeroSection />
      <main>
        <LearningPathsSection />
        <WhatYouCanBuildSection />
        <TechnologiesSection />
        <ShopifyBitsSection />
        <CommunitySection />
        <CTASection />
      </main>
    </Layout>
  );
}
