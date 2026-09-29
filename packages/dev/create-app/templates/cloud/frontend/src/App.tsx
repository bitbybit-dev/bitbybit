import { useCallback, useState, type ReactElement } from "react";
import { Header } from "./components/Header";
import { Tabs } from "./components/Tabs";
import { ModelsPanel } from "./panels/ModelsPanel";
import { PipelinesPanel } from "./panels/PipelinesPanel";
import { Viewer } from "./components/Viewer";
import { ApiKeyWarning } from "./components/ApiKeyWarning";

export type TabId = "models" | "pipelines";

export function App(): ReactElement {
    const initialTab = new URLSearchParams(window.location.search).has("pipeline-task") ? "pipelines" : "models";
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [viewerUrls, setViewerUrls] = useState<string[] | null>(null);

    const loadModel = useCallback((url: string): void => {
        setViewerUrls(null);
        setViewerUrl(url);
    }, []);

    const loadModels = useCallback((urls: string[]): void => {
        setViewerUrl(null);
        setViewerUrls(urls);
    }, []);

    const clearViewer = (): void => {
        setViewerUrl(null);
        setViewerUrls(null);
    };

    const modelLoaded = viewerUrl !== null || viewerUrls !== null;

    return (
        <>
            <Header />
            <ApiKeyWarning />
            <Tabs activeTab={activeTab} onTabChange={(tab) => { clearViewer(); setActiveTab(tab); }} />
            <ModelsPanel active={activeTab === "models"} modelLoaded={modelLoaded} onLoadModel={loadModel} onLoadModels={loadModels} />
            <PipelinesPanel active={activeTab === "pipelines"} modelLoaded={modelLoaded} onLoadModel={loadModel} />
            <Viewer url={viewerUrl} urls={viewerUrls} />
        </>
    );
}
