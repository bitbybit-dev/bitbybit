import type { TabId } from "../App";

interface TabsProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
    return (
        <nav className="tabs">
            <button
                className={`tab ${activeTab === "models" ? "active" : ""}`}
                onClick={() => onTabChange("models")}
            >
                Models
            </button>
            <button
                className={`tab ${activeTab === "pipelines" ? "active" : ""}`}
                onClick={() => onTabChange("pipelines")}
            >
                Pipelines
            </button>
        </nav>
    );
}
