---
sidebar_position: 10
title: Security Policy
sidebar_label: Security Policy
description: Guidelines for reporting security vulnerabilities to the Bitbybit team.
tags: [security]
---

## Security Policy

At Bitbybit, we take the security of our platform and our users' data seriously. We welcome contributions from the security community and appreciate responsible disclosure. Please note that this document may change at any time, and you are responsible for checking for updates without prior notice from us.

## Safe Harbor & Rules of Engagement

We consider security research to be a helpful activity, not a crime. If you act in good faith and follow this policy, **we will not take legal action against you** regarding your research.

However, we must protect our users. This pledge **does not apply** if you act maliciously - for example, by intentionally stealing data, disrupting our services, share user information with third parties, breach our [Terms and Conditions](https://bitbybit.dev/terms-and-conditions) or do not agree to our [Privacy Policy](https://bitbybit.dev/privacy-policy). In those cases, we reserve the right to take necessary legal steps.

**To stay safe and helpful, please:**
*   **Test only on accounts you own** or have explicit permission to test on.
*   **Do not** exfiltrate, download, or modify data residing in any other account (verify the vulnerability exists and stop there).
*   **Do not** execute attacks that degrade the performance of our services (e.g., DoS, spamming).
*   **Refrain** from publicly disclosing the vulnerability until we have had reasonable time to fix it.

## Reporting a Vulnerability

If you believe you have found a security vulnerability in our platform, please report it to us via email.

:::info How to Report
**Email:** [info@bitbybit.dev](mailto:info@bitbybit.dev)  
**Subject:** Security Vulnerability Report
:::

### What to Include
To help us triage the issue efficiently, please include:
1.  **Type:** The class of vulnerability (e.g., XSS, SQLi, IDOR).
2.  **Location:** The specific URL, endpoint, or package affected.
3.  **Proof of Concept (PoC):** Step-by-step instructions to reproduce the issue (screenshots or video are highly encouraged).
4.  **Impact:** A brief summary of the potential risk.

*Note: Please redact sensitive information (e.g., real API keys or PII) from your report unless necessary to prove the vulnerability.*

## Our Process

We value your time and aim to be transparent about our triage process.

1.  **Acknowledgment:** We aim to respond to valid reports within **5 business days**.
2.  **Assessment:** We will review the report to verify the vulnerability and assess its severity.
3.  **Resolution:** If the issue is confirmed, we will work on a fix. We will keep you updated on the progress.
4.  **Closure:** We will notify you once the issue is resolved.

:::note No Bug Bounty
We **do not** currently offer a bug bounty program or financial compensation. Please do not submit reports expecting payment. However, we are very thankful for your efforts to keep our community safe.
:::

### Acknowledgments

We value the time you invest in security research. For valid, responsibly disclosed vulnerabilities, we are happy to acknowledge your contribution in our release notes or security credits.

**Please Note:**
*   **Identification:** When reporting, please let us know how you would like to be identified (e.g., **Real Name** or **Handle/Pseudonym**). If you prefer to remain anonymous, we will respect that.
*   **Disclosure Details:** To protect our users and infrastructure, we reserve the right to limit the technical details shared in public acknowledgments. We generally describe the issue category (e.g., "Discovered and helped mitigate XSS vulnerability") rather than providing specific exploit steps.

## Scope

### In Scope
*   [bitbybit.dev](https://bitbybit.dev) website and platform
*   Bitbybit open-source repositories and NPM packages

### Out of Scope
The following are generally considered out of scope and will not be acknowledged unless they present a severe risk:
*   Social engineering (phishing) of Bitbybit staff or contractors.
*   Denial of Service (DoS) attacks.
*   **Automated scanner reports** without a reproducible PoC.
*   Missing security headers (e.g., HSTS, CSP) without a clear exploitation scenario.
*   Self-XSS (manually entered by the user).
*   Vulnerabilities in third-party dependencies (unless directly caused by our implementation).
*   Login/Logout CSRF.