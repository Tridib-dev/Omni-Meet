import React from "react";

export interface InfoRowProps {
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  title: string;
  description: string;
  badge?: string;
}

const InfoRow = ({ icon, iconBg, iconColor, title, description, badge = "Coming soon" }: InfoRowProps) => {
  return (
    <div className="onb-info-row">
      <div className="onb-info-row-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="onb-info-row-body">
        <p className="onb-info-row-title">{title}</p>
        <p className="onb-info-row-desc">{description}</p>
      </div>
      <span className="onb-info-row-badge">{badge}</span>
    </div>
  );
};

export default InfoRow;
