import React, { useState, type ReactNode } from "react";
import Layout from "@theme-original/Layout";
import type LayoutType from "@theme/Layout";
import type { WrapperProps } from "@docusaurus/types";
import CookieConsent, { Cookies } from "react-cookie-consent";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

type Props = WrapperProps<typeof LayoutType>;
const GA_MEASUREMENT_ID = "G-VQHYSMBCKM";
export default function LayoutWrapper(props: Props): ReactNode {

    const [trackingInitialized, setTrackingInitialized] = useState(false);

    // Check if running in iframe
    const isInIframe = ExecutionEnvironment.canUseDOM && window.parent !== window;

    // Check if cookies are disabled via query parameter
    const isCookieDisabledByQuery = ExecutionEnvironment.canUseDOM && 
        new URLSearchParams(window.location.search).get("cookies") === "disabled";

    // Set decline cookie if disabled by query parameter (but not in iframe)
    if (isCookieDisabledByQuery && ExecutionEnvironment.canUseDOM && !isInIframe) {
        Cookies.set("bitbybit-docs-cookie-consent", "false", { expires: 365 });
    }

    // Check if cookies are disabled (by query, iframe, or previous decline)
    const cookieConsent = Cookies.get("bitbybit-docs-cookie-consent");
    const isCookieDisabled = isCookieDisabledByQuery || cookieConsent === "false" || isInIframe;

    const initializeGATracking = () => {
        if (ExecutionEnvironment.canUseDOM && !window.gtag && !isCookieDisabled) {
            const script = document.createElement("script");
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
            script.async = true;
            document.head.appendChild(script);

            script.onload = () => {
                const w = window as any;
                w.dataLayer = w.dataLayer || [];
                function gtag() {
                    (w.dataLayer as any).push(arguments);
                }
                w.gtag = gtag;
                (gtag as any)("js", new Date());
                (gtag as any)("config", GA_MEASUREMENT_ID);
            };
        }
    };

    if (cookieConsent === "true" && trackingInitialized === false && !isCookieDisabled) {
        initializeGATracking();
        setTrackingInitialized(true);
    }

    return (
        <>
            <Layout {...props} />
            {!isCookieDisabled && !cookieConsent && (
                <CookieConsent
                    location="bottom"
                    buttonText="ACCEPT COOKIES ❤️"
                    declineButtonText="DECLINE"
                    cookieName="bitbybit-docs-cookie-consent"
                    style={{ background: "#2B373B" }}
                    enableDeclineButton
                    overlay
                    flipButtons
                    buttonStyle={{ backgroundColor: "#f0cebb", color: "#1a1c1f", fontWeight: "bold", fontSize: "13px", borderRadius: "5px", padding: "10px 20px" }}
                    declineButtonStyle={{ backgroundColor: "#1a1c1f", color: "#f0cebb", fontWeight: "bold", fontSize: "13px", borderRadius: "5px", padding: "10px 20px" }}

                    onAccept={(acceptedByScrolling) => {
                        if (acceptedByScrolling) {
                            // triggered if user scrolls past threshold
                        } else {
                            initializeGATracking();
                        }
                    }}
                >
                    <h2>Help us improve Bitbybit</h2>
                    <p>
                        To help us improve Bitbybit and its documentation, we’d like to use Google Analytics, which requires setting cookies. Do you consent to this?
                    </p>
                </CookieConsent>
            )}
        </>
    );
}
