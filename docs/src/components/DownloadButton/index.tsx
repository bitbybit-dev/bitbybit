import React from "react";

interface DownloadButtonProps {
  href: string;
  label: string;
  variant?: "full" | "lite";
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ href, label, variant = "full" }) => {
  const colors = variant === "full" 
    ? { bg: "linear-gradient(135deg, #F0CEBB 0%, #d6b39f 100%)", text: "#1a1c1f", border: "#d6b39f" }
    : { bg: "linear-gradient(135deg, #2a2d32 0%, #1a1c1f 100%)", text: "#F0CEBB", border: "#F0CEBB" };
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        background: colors.bg,
        color: colors.text,
        padding: "14px 24px",
        borderRadius: "8px",
        fontWeight: 600,
        fontSize: "14px",
        textDecoration: "none",
        border: `1px solid ${colors.border}`,
        transition: "all 0.3s ease",
        marginRight: "12px",
        marginBottom: "12px",
      }}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        style={{ verticalAlign: "middle" }}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {label}
    </a>
  );
};

export default DownloadButton;
