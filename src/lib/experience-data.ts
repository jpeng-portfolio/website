export type ExperienceRole = {
  role: string;
  company: string;
  companyUrl?: string;
  period: string;
  freelance?: boolean;
  bullets: string[];
};

export const experienceRoles: ExperienceRole[] = [
  {
    role: "Senior Cloud Engineer",
    company: "Direct IT",
    period: "April 2023 – Present",
    bullets: [
      "Designed, deployed, and managed AWS and Microsoft 365 infrastructure for multiple clients in parallel, including a SOC 2–compliant environment running 30+ servers on a $200K–$250K annual cloud budget.",
      "Designed and deployed a Zero Trust Network Access (ZTNA) solution for the SOC 2–compliant environment, enforcing identity-based access controls and eliminating implicit network trust.",
      "Provisioned production infrastructure as code with Terraform — VPCs, EC2, least-privilege IAM, Lambda, and security groups across multiple accounts under AWS Organizations.",
      "Architected and deployed highly available disaster recovery environments in AWS with Terraform, enabling routine DR testing and business continuity planning.",
      "Built and maintained multi-environment CI/CD pipelines using GitLab CI/CD and GitHub Actions for repeatable dev, pre-production, and production deployments.",
      "Used resource tagging and cost analysis to tune infrastructure for both technical performance and budget efficiency across client environments.",
      "Deployed virtual SonicWall firewall appliances in AWS and built site-to-site VPN tunnels connecting on-premises networks to cloud environments.",
      "Monitored infrastructure health and performance across 30+ servers using CloudWatch, Grafana, and DattoRMM spanning multiple client environments.",
    ],
  },
  {
    role: "Support Engineer",
    company: "Direct IT",
    period: "July 2021 – April 2023",
    bullets: [
      "Resolved 15–20 support tickets daily across L1–L3 in cloud, networking, and on-premises environments, with weekly on-site client visits.",
      "Administered Windows Server environments — Active Directory (ADUC, ADCS), Group Policy, DNS, and DHCP across multiple client domains.",
      "Deployed on-premises SonicWall firewalls and configured NAT policies, access rules, client and site-to-site VPN, LDAP/RADIUS authentication, and VLAN segmentation.",
      "Deployed and maintained Remote Desktop Services farms with FSLogix profile containers for optimized user session management.",
      "Imaged and provisioned Debian-based Linux monitoring appliances tracking uptime, SNMP, storage, and HTTP/HTTPS availability across 1,000+ endpoints.",
      "Wrote automation scripts in PowerShell, Bash, and Python to streamline repetitive infrastructure tasks.",
      "Trained new engineers, resolved complex escalations, and coordinated with external vendors on hardware and software issues.",
    ],
  },
  {
    role: "Junior Java Developer",
    company: "Sullivan and Cogliano",
    period: "February 2018 – March 2020",
    bullets: [
      "Developed and maintained Java applications under senior developer guidance, writing object-oriented code for new features and enhancements.",
      "Built REST APIs in Spring Boot for CRUD operations.",
      "Troubleshot and resolved application defects, collaborating with developers and QA across the software development lifecycle.",
    ],
  },
];
