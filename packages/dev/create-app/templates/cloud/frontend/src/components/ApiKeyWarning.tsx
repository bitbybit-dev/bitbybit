import { useEffect, useState } from "react";

export function ApiKeyWarning() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Probe the backend to check if the API key is configured
        fetch("/api/generate", { method: "POST" })
            .then(async (res) => {
                // 503 = API key not configured, 502/504 = backend not reachable
                if (res.status === 503 || res.status === 502 || res.status === 504) {
                    setVisible(true);
                }
            })
            .catch(() => {
                // Backend not reachable — show generic warning
                setVisible(true);
            });
    }, []);

    if (!visible) return null;

    return (
        <div className="api-key-warning">
            <div className="api-key-warning-icon">⚠️</div>
            <div className="api-key-warning-content">
                <strong>API Key Not Configured</strong>
                <p>
                    You need a Bitbybit API key to use this application.
                    Create an account on{" "}
                    <a href="https://bitbybit.dev" target="_blank" rel="noopener noreferrer">bitbybit.dev</a>{" "}
                    and purchase an API key plan at{" "}
                    <a href="https://bitbybit.dev/auth/pick-plan?api-keys=true" target="_blank" rel="noopener noreferrer">
                        bitbybit.dev/auth/pick-plan
                    </a>{" "}
                    to get access to managed CAD cloud servers.
                </p>
            </div>
        </div>
    );
}
