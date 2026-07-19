export interface AudienceOption {
  tag: string;
  category: string;
}

export const AUDIENCE_PERSONAS: AudienceOption[] = [
  // Role
  { tag: "Software Engineers", category: "Role" },
  { tag: "Frontend Developers", category: "Role" },
  { tag: "Backend Developers", category: "Role" },
  { tag: "Full-Stack Developers", category: "Role" },
  { tag: "Mobile Developers", category: "Role" },
  { tag: "DevOps Engineers", category: "Role" },
  { tag: "Site Reliability Engineers", category: "Role" },
  { tag: "Data Scientists", category: "Role" },
  { tag: "Data Engineers", category: "Role" },
  { tag: "ML Engineers", category: "Role" },
  { tag: "AI Researchers", category: "Role" },
  { tag: "Product Managers", category: "Role" },
  { tag: "Engineering Managers", category: "Role" },
  { tag: "CTOs & Tech Leaders", category: "Role" },
  { tag: "Founders", category: "Role" },
  { tag: "UI/UX Designers", category: "Role" },
  { tag: "QA Engineers", category: "Role" },
  { tag: "Security Engineers", category: "Role" },
  { tag: "Cloud Architects", category: "Role" },
  { tag: "Technical Writers", category: "Role" },
  { tag: "Developer Advocates", category: "Role" },
  { tag: "Solutions Architects", category: "Role" },
  { tag: "Open Source Maintainers", category: "Role" },
  { tag: "Community Managers", category: "Role" },
  { tag: "IT Administrators", category: "Role" },
  { tag: "Investors", category: "Role" },
  { tag: "Marketers", category: "Role" },

  // Experience level
  { tag: "Beginners", category: "Experience Level" },
  { tag: "Intermediate", category: "Experience Level" },
  { tag: "Advanced / Experts", category: "Experience Level" },
  { tag: "Students & New Grads", category: "Experience Level" },
  { tag: "Career Switchers", category: "Experience Level" },
  { tag: "Senior Leaders & Executives", category: "Experience Level" },

  // Focus area
  { tag: "Web Development", category: "Focus Area" },
  { tag: "Mobile Development", category: "Focus Area" },
  { tag: "Cloud Computing", category: "Focus Area" },
  { tag: "AI / Machine Learning", category: "Focus Area" },
  { tag: "Blockchain / Web3", category: "Focus Area" },
  { tag: "Cybersecurity", category: "Focus Area" },
  { tag: "DevOps & Infrastructure", category: "Focus Area" },
  { tag: "Data & Analytics", category: "Focus Area" },
  { tag: "Game Development", category: "Focus Area" },
  { tag: "AR / VR", category: "Focus Area" },
  { tag: "Robotics", category: "Focus Area" },
  { tag: "IoT", category: "Focus Area" },
  { tag: "Open Source", category: "Focus Area" },
  { tag: "Product & Design", category: "Focus Area" },
  { tag: "Startups & Entrepreneurship", category: "Focus Area" },
  { tag: "Enterprise IT", category: "Focus Area" },

  // Org type
  { tag: "Startups", category: "Organization Type" },
  { tag: "Enterprises", category: "Organization Type" },
  { tag: "Agencies", category: "Organization Type" },
  { tag: "Freelancers / Independent", category: "Organization Type" },
  { tag: "Nonprofits", category: "Organization Type" },
  { tag: "Government / Public Sector", category: "Organization Type" },
  { tag: "Academia & Research", category: "Organization Type" },
];
