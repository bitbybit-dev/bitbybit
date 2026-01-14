import React, { useRef, useEffect, useState, useCallback, useId, CSSProperties } from "react";
import Admonition from "@theme/Admonition";
import CodeBlock from "@theme/CodeBlock";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

type ScriptType = "rete" | "blockly" | "typescript";

interface ScriptProp {
    script: string;
    version?: string; // Made optional - will use default from config if not provided
    type: ScriptType;
}

interface ScriptForIframe {
    script: string;
    type: ScriptType;
}

interface PostMessageData {
    script: ScriptForIframe;
    type: "openScript";
}

interface Props {
    script?: ScriptProp;
    title?: string;
    description?: string;
    iframeUrl?: string;
    requireManualStart?: boolean;
    backgroundImageUrl?: string;
    height?: string;
    style?: CSSProperties;
    className?: string;
    showScriptPreviewInitially?: boolean;
}

interface IframeReadyMessage {
    status?: "initialised" | string;
    source?: string;
}

const LOGO_BASE_URL = "https://bitbybit.dev/assets/";
const SCRIPT_TYPE_LOGOS: Record<ScriptType, string> = {
    rete: `${LOGO_BASE_URL}rete_logo_mini.png`,
    blockly: `${LOGO_BASE_URL}blockly_logo_mini.png`,
    typescript: `${LOGO_BASE_URL}typescript_logo_mini.png`,
};
const BITBYBIT_LOGO_URL_MANUAL_START = "/img/logo-gold-small.png";
const BITBYBIT_LOGO_URL_NAVBAR = "/img/logo-gold-small.png";

const BitByBitRenderCanvas: React.FC<Props> = React.memo(({
    script: scriptProp,
    title = "Interactive Script",
    description,
    iframeUrl: baseUrl = "https://s.bitbybit.dev",
    requireManualStart = false,
    backgroundImageUrl = "https://bitbybit.dev/assets/landscape.jpeg",
    height = "600px",
    style: customCanvasContainerStyle = {},
    className: customCanvasContainerClassName,
    showScriptPreviewInitially = true,
}: Props) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const uniqueId = useId();
    const { siteConfig } = useDocusaurusContext();
    const defaultVersion = siteConfig.customFields?.bitbybitVersion as string || "0.21.1";

    const [isIframeReady, setIsIframeReady] = useState(false);
    const [loadIframe, setLoadIframe] = useState(!requireManualStart);
    const [isInFullscreen, setIsInFullscreen] = useState(false);

    const fullIframeUrl = React.useMemo(() => {
        if (!scriptProp || !scriptProp.type) return baseUrl;
        try {
            const url = new URL(baseUrl);
            url.searchParams.set("editor", scriptProp.type);
            return url.toString();
        }
        catch (e) {
            console.error("Invalid iframeUrl:", baseUrl, e);
            return baseUrl;
        }
    }, [baseUrl, scriptProp]);

    const dataToPost = React.useMemo<PostMessageData | null>(() => {
        if (!scriptProp || !scriptProp.script) return null;
        try {
            // Use version from script prop if provided, otherwise use default from config
            const scriptWithVersion = {
                ...scriptProp,
                version: scriptProp.version || defaultVersion
            };
            const stringifiedFullScriptProp = JSON.stringify(scriptWithVersion);
            return { script: { script: stringifiedFullScriptProp, type: scriptProp.type }, type: "openScript" as const };
        }
        catch (error) {
            console.error("Error stringifying scriptProp:", error, scriptProp);
            return null;
        }
    }, [scriptProp, defaultVersion]);

    const postMessageToIframe = useCallback((message: PostMessageData) => {
        if (iframeRef.current?.contentWindow && fullIframeUrl) {
            try {
                const targetOrigin = new URL(fullIframeUrl).origin;
                iframeRef.current.contentWindow.postMessage(message, targetOrigin);
            }
            catch (error) {
                console.error("Error posting message:", error, fullIframeUrl);
            }
        }
    }, [fullIframeUrl]);

    useEffect(() => {
        if (!loadIframe || !fullIframeUrl) return;
        const handleMessage = (event: MessageEvent<IframeReadyMessage>) => {
            try {
                const expectedOrigin = new URL(fullIframeUrl).origin;
                if (event.origin === expectedOrigin && event.data?.status === "initialised") setIsIframeReady(true);
            }
            catch (error) {
                console.error("Error in handleMessage:", error, fullIframeUrl);
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [fullIframeUrl, loadIframe]);

    useEffect(() => {
        if (loadIframe && isIframeReady && dataToPost) {
            postMessageToIframe(dataToPost);
        }
    }, [loadIframe, isIframeReady, dataToPost, postMessageToIframe]);

    const handleStartScript = useCallback(() => setLoadIframe(true), []);

    const handleFullscreenChange = useCallback(() => {
        if (document.fullscreenElement === canvasContainerRef.current || !document.fullscreenElement) {
            setIsInFullscreen(!!document.fullscreenElement);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, [handleFullscreenChange]);

    const requestFullscreen = useCallback(() => {
        if (canvasContainerRef.current) {
            canvasContainerRef.current.requestFullscreen().catch(err => console.error(`Fullscreen request failed: ${err.message} (${err.name})`));
        }
    }, []);
    const exitFullscreen = useCallback(() => {
        if (document.fullscreenElement) document.exitFullscreen().catch(err => console.error(`Exit fullscreen failed: ${err.message} (${err.name})`));
    }, []);

    const getScriptLanguage = useCallback(() => {
        if (!scriptProp || !scriptProp.type) {
            return "text";
        }
        switch (scriptProp.type) {
            case "rete": return "json";
            case "typescript": return "typescript";
            case "blockly": return "xml";
            default: return "text";
        }
    }, [scriptProp?.type]);

    const formattedScriptForPreview = React.useMemo(() => {
        if (!scriptProp || !scriptProp.script) return "";
        if (scriptProp.type === "rete") {
            try {
                return JSON.stringify(JSON.parse(scriptProp.script), null, 2);
            } catch (e) {
                console.warn("Could not parse Rete script:", e);
                return scriptProp.script;
            }
        }
        return scriptProp.script;
    }, [scriptProp]);


    const canvasContainerActualStyle: CSSProperties = React.useMemo(() => ({
        position: "relative", width: "100%", height: height,
        overflow: "hidden",
        marginBottom: "20px",
        backgroundColor: "var(--ifm-background-color, #ffffff)",
    }), [height]);

    const preStartOverlayStyle: CSSProperties = React.useMemo(() => ({
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: "cover",
        backgroundPosition: "center", textAlign: "center", padding: "20px", boxSizing: "border-box",
    }), [backgroundImageUrl]);

    const bitbybitLogoManualStartStyle: CSSProperties = { width: "80px", marginBottom: "15px" };
    const titleManualStartStyle: CSSProperties = { color: "white", fontSize: "24px", fontWeight: "bold", textShadow: "1px 1px 3px rgba(0,0,0,0.7)", marginBottom: "20px" };
    const startButtonStyle: CSSProperties = { padding: "12px 24px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", backgroundColor: "var(--ifm-color-primary)", color: "var(--ifm-button-color, white)", border: "none", borderRadius: "var(--ifm-button-border-radius)", boxShadow: "var(--ifm-global-shadow-lw)", marginBottom: "15px" };
    const scriptTypeIndicatorManualStartStyle: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", color: "white", backgroundColor: "rgba(0, 0, 0, 0.6)", padding: "5px 10px", borderRadius: "3px", fontSize: "14px" };
    const scriptTypeLogoStyle: CSSProperties = { width: "20px", height: "20px", marginRight: "8px" };
    const navbarStyle: CSSProperties = { position: "absolute", top: 0, left: 0, right: 0, height: "40px", backgroundColor: "rgba(0, 0, 0, 0.85)", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", zIndex: 15, boxSizing: "border-box" };
    const navbarLeftItemsStyle: CSSProperties = { display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", flexGrow: 1, marginRight: "10px" };
    const navbarLogoStyle: CSSProperties = { height: "24px", width: "auto", display: "block", flexShrink: 0 };
    const navbarTitleStyle: CSSProperties = { fontSize: "14px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexGrow: 1, cursor: description ? "help" : "default" };
    const fullscreenButtonStyleNavbar: CSSProperties = { padding: "4px 8px", border: "none", borderRadius: "var(--ifm-button-border-radius)", backgroundColor: "rgba(255, 255, 255, 0.2)", color: "white", cursor: "pointer", fontSize: "12px", lineHeight: "1", flexShrink: 0 };
    const exitFullscreenButtonStyleNavbar: CSSProperties = { ...fullscreenButtonStyleNavbar };
    const iframeWrapperStyle: CSSProperties = { width: "100%", height: "100%", position: "relative" };
    const iframeStyle: CSSProperties = { width: "100%", height: "100%", border: "none" };

    const scriptPreviewSectionStyle: CSSProperties = {
        marginTop: "20px",
        marginBottom: "20px",
        padding: "10px",
        backgroundColor: "var(--ifm-background-surface-color, var(--ifm-background-color))",
    };
    const codeBlockWrapperStyle: CSSProperties = {
        maxHeight: "500px",
        overflowY: "auto",
    };

    if (scriptProp && !scriptProp.script) {
        return <Admonition type="danger" title="Component Configuration Error">The 'script.script' content is missing from the provided 'script' prop.</Admonition>;
    }

    return (
        <>
            <div
                ref={canvasContainerRef}
                style={{ ...canvasContainerActualStyle, ...customCanvasContainerStyle }}
                className={`bitbybit-canvas-container ${customCanvasContainerClassName || ""}`}
            >
                {!loadIframe && requireManualStart ? (
                    <div style={preStartOverlayStyle}>
                        <a href="https://bitbybit.dev" target="_blank" rel="noopener noreferrer">
                            <img src={BITBYBIT_LOGO_URL_MANUAL_START} alt="Bitbybit Platform" style={bitbybitLogoManualStartStyle} />
                        </a>
                        {title && <h2 style={titleManualStartStyle}>{title}</h2>}
                        <button onClick={handleStartScript} style={startButtonStyle}>
                            Start Script
                        </button>
                        {scriptProp && scriptProp.type && (
                            <div style={scriptTypeIndicatorManualStartStyle}>
                                <img src={SCRIPT_TYPE_LOGOS[scriptProp.type]} alt={`${scriptProp.type} logo`} style={scriptTypeLogoStyle} />
                                <span>{scriptProp.type.charAt(0).toUpperCase() + scriptProp.type.slice(1)}</span>
                            </div>
                        )}
                    </div>
                ) : null}

                {loadIframe ? (
                    <div style={iframeWrapperStyle}>
                        <div style={navbarStyle}>
                            <div style={navbarLeftItemsStyle}>
                                <a href="https://bitbybit.dev" target="_blank" rel="noopener noreferrer" title="Visit Bitbybit.dev">
                                    <img src={BITBYBIT_LOGO_URL_NAVBAR} alt="Bitbybit" style={navbarLogoStyle} />
                                </a>
                                <div style={navbarTitleStyle} title={description || title}>
                                    {title}
                                </div>
                            </div>
                            {isInFullscreen ? (
                                <button onClick={exitFullscreen} style={exitFullscreenButtonStyleNavbar}>Exit Fullscreen</button>
                            ) : (
                                <button onClick={requestFullscreen} style={fullscreenButtonStyleNavbar}>Fullscreen</button>
                            )}
                        </div>
                        <iframe
                            ref={iframeRef}
                            title={scriptProp && scriptProp.type ? `BitByBit ${scriptProp.type} Editor - ${title}` : `BitByBit Content - ${title}`}
                            id={`bitbybit-iframe-${uniqueId}`}
                            src={fullIframeUrl}
                            sandbox="allow-scripts allow-same-origin allow-downloads allow-forms allow-popups"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone; xr-spatial-tracking; fullscreen"
                            style={{ ...iframeStyle, paddingTop: "40px" }}
                        />
                    </div>
                ) : null}
            </div>

            {showScriptPreviewInitially && scriptProp && scriptProp.script && (
                <div style={scriptPreviewSectionStyle} className="script-preview-section">
                    <div style={codeBlockWrapperStyle}>
                        <CodeBlock language={getScriptLanguage()} title={`Script Source (${scriptProp.type})`}>
                            {formattedScriptForPreview}
                        </CodeBlock>
                    </div>
                </div>
            )}
        </>
    );
});

export default BitByBitRenderCanvas;