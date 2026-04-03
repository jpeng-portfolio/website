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
    title: "Cloud Platforms",
    skills: [
      { name: "Amazon Web Services (AWS)", level: 100 },
      { name: "Microsoft Azure", level: 100 },
      { name: "Google Cloud Platform (GCP)", level: 100 },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    skills: [
      { name: "Python", level: 99 },
      { name: "JavaScript / TypeScript", level: 100 },
      { name: "NodeJS", level: 97 },
      { name: "Bash Scripting", level: 100 },
      { name: "PowerShell", level: 80 },
      { name: "HTML", level: 100 },
      { name: "CSS", level: 95 },
      { name: "PHP", level: 87 },
      { name: "C++", level: 81 },
      { name: "MySQL", level: 77 },
      { name: "Java", level: 72 },
    ],
  },
  {
    id: "software-tools",
    title: "Software / Tools",
    skills: [
      { name: "Visual Studio Code", level: 100 },
      { name: "GitHub Actions", level: 100 },
      { name: "Azure DevOps", level: 100 },
      { name: "BitBucket", level: 100 },
      { name: "Terraform", level: 100 },
      { name: "CloudFormation / CDK", level: 100 },
      { name: "Azure Data Factory", level: 90 },
      { name: "Ansible", level: 58 },
      { name: "Jenkins / Chef / Puppet", level: 41 },
      { name: "Kubernetes / Docker", level: 85 },
      { name: "Artifactory", level: 97 },
      { name: "VMware", level: 83 },
      { name: "Routing Systems", level: 86 },
      { name: "WordPress", level: 100 },
    ],
  },
  {
    id: "operating-systems",
    title: "Operating Systems",
    skills: [
      { name: "Windows 7 and newer", level: 100 },
      { name: "Windows Server 2012 and newer", level: 100 },
      { name: "Linux / Unix", level: 100 },
      { name: "Mac OS X and newer", level: 76 },
      { name: "Chrome OS", level: 100 },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    skills: [
      { name: "English", level: 100 },
      { name: "French", level: 100 },
    ],
  },
];
