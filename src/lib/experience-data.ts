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
    role: "Cloud & Infrastructure Engineer",
    company: "Direct IT",
    period: "April 2023 – Present",
    bullets: [
      "Designed, deployed, and managed AWS and Microsoft 365 infrastructure for multiple clients, including a SOC 2-compliant environment running 30+ servers on a $200K–$250K annual cloud budget.",
      "Provisioned production infrastructure as code with Terraform — VPCs, EC2, IAM roles/policies, Lambda functions, and security groups across multiple accounts.",
      "Architected and deployed disaster recovery environments in AWS with Terraform, enabling routine DR testing and business continuity planning.",
      "Deployed virtual SonicWall firewall appliances in AWS and built site-to-site VPN tunnels connecting on-premises networks to cloud environments.",
      "Built and maintained CI/CD pipelines using GitLab CI/CD and GitHub Actions for repeatable, multi-environment deployments.",
      "Monitored infrastructure health and performance across 30+ servers using CloudWatch and DattoRMM spanning multiple client environments.",
      "Managed a hybrid fleet of 30+ Windows servers and multiple Linux instances — patching, monitoring, and access controls.",
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
      "Trained new engineers and collaborated cross-functionally to resolve complex escalations; coordinated with external vendors on hardware and software issues.",
    ],
  },
];
