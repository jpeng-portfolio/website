export type Skill = {
  name: string;
  level: number;
};

export type SkillCategory = {
  id: string;
  title: string;
  skills: Skill[];
};

export const skillCategories: SkillCategory[] = [
  {
    id: "cloud-platforms",
    title: "Cloud Platforms and Operating Systems",
    skills: [
      { name: "Amazon Web Services (AWS)", level: 100 },
      { name: "Microsoft Azure", level: 55 },
      { name: "Google Cloud Platform (GCP)", level: 25 },
      { name: "Windows 10 and 11", level: 100 },
      { name: "Windows Server 2016 through 2025", level: 100 },
      { name: "Ubuntu", level: 95 },
      { name: "Debian", level: 75 },
      { name: "Microsoft 365 / Entra ID", level: 92 }
    ],
  },
  {
    id: "languages",
    title: "Languages",
    skills: [
      { name: "Java", level: 100 },
      { name: "C++", level: 100 },
      { name: "JavaScript / TypeScript", level: 90 },
      { name: "Python", level: 75 },
      { name: "Bash Scripting", level: 80 },
      { name: "PowerShell", level: 100 },
      { name: "HTML", level: 80 },
      { name: "CSS", level: 75 },
      { name: "PostgreSQL", level: 77 },
      { name: "Microsoft SQL", level: 70 },
      { name: "Oracle SQL", level: 60 },
      { name: "REST API", level: 85 },
      { name: "Websocket API", level: 78 }
    ],
  },
  {
    id: "software-tools",
    title: "Software, Tools and Frameworks",
    skills: [
      { name: "JetBrains IDEs", level: 100 },
      { name: "Visual Studio Code", level: 100 },
      { name: "GitHub Actions", level: 75 },
      { name: "Terraform", level: 100 },
      { name: "Ansible", level: 58 },
      { name: "Docker", level: 91 },
      { name: "VMware", level: 83 },
      { name: "Next.js", level: 83 },
      { name: "SpringBoot", level: 83 },
      { name: "Auth0", level: 83 }

    ],
  },
  {
    id: "networking-email",
    title: "Networking and Email",
    skills: [
      { name: "Domains", level: 93},
      { name: "DNS", level: 95 },
      { name: "DHCP", level: 93 },
      { name: "VPN - Site-to-Site / Client", level: 85 },
      { name: "Routers / Gateways", level: 81 },
      { name: "Microsoft 365", level: 100 },
      { name: "MX Records", level: 92 },
      { name: "SPF", level: 95 },
      { name: "DKIM", level: 85 },
      { name: "DMARC", level: 91 },
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    skills: [
      { name: "SSL Certificates", level: 87 },
      { name: "Firewalls", level: 92 },
      { name: "Port Security", level: 85 },
      { name: "Phishing Attacks", level: 91 },
      { name: "Enumeration", level: 98 },
      { name: "Privilege Escalation", level: 45 },
      { name: "Common Exploits and Vulnerabilities", level: 75 },
      { name: "System Hardening", level: 55 },
      { name: "SOC 2", level: 65 },
      { name: "Compliance", level: 75 }
    ]
  }
];
