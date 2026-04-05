import {type SkillCategory, skillCategories as fallbackSkillCategories} from "@/lib/skills-data";
import {type ProjectItem, projectsData as fallbackProjects} from "@/lib/projects-data";
import {experienceData as fallbackExperience} from "@/lib/experience-data";
import {siteConfig as fallbackSiteConfig} from "@/config/site";
import {getSanityClient} from "@/sanity/client";
import {
  ABOUT_SECTION_QUERY,
  CERTIFICATIONS_QUERY,
  EXPERIENCE_QUERY,
  HERO_SECTION_QUERY,
  PROJECTS_QUERY,
  SITE_CONFIG_QUERY,
  SKILL_CATEGORIES_QUERY,
} from "@/sanity/queries";

const SANITY_VERBOSE =
  process.env.APP_VERBOSE === "true" ||
  process.env.NEXT_PUBLIC_APP_VERBOSE === "true";

function logSanity(message: string, error?: unknown) {
  if (!SANITY_VERBOSE) {
    return;
  }

  if (error) {
    console.error(`[sanity] ${message}`, error);
    return;
  }
  console.info(`[sanity] ${message}`);
}

type HeroSectionContent = {
  headline: string;
  subheadline: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

const siteConfigFallback: SiteConfigContent = {
  title: fallbackSiteConfig.title,
  domain: fallbackSiteConfig.domain,
  tagline: fallbackSiteConfig.tagline,
  description: fallbackSiteConfig.description,
  navItems: fallbackSiteConfig.navItems.map((item) => ({
    label: item.label,
    href: item.href,
  })),
  socialLinks: {
    linkedin: fallbackSiteConfig.socialLinks.linkedin,
    gitlab: fallbackSiteConfig.socialLinks.gitlab,
  },
};

type AboutSectionContent = {
  title: string;
  description: string;
  paragraphs: string[];
  profileLinksHeading: string;
  profileLinksDescription: string;
};

type SiteConfigContent = {
  title: string;
  domain: string;
  tagline: string;
  description: string;
  navItems: {label: string; href: string}[];
  socialLinks: {linkedin: string; gitlab: string};
};

type ExperienceGroup = {
  groupTitle: string;
  accentColor: string;
  items: string[];
};

type ExperienceContent = {
  role: string;
  company: string;
  period: string;
  highlightGroups: ExperienceGroup[];
};

export type CertificationContent = {
  _id: string;
  name: string;
  date: string;
  certType: "cert" | "education";
  details?: string;
};

const heroFallback: HeroSectionContent = {
  headline:
    "Cloud & Infrastructure Engineer building resilient, cost-aware AWS platforms.",
  subheadline:
    "5+ years supporting production environments across cloud, networking, and hybrid infrastructure. Focused on Terraform automation, CI/CD, and practical reliability engineering.",
  ctaPrimaryLabel: "Get in Touch",
  ctaPrimaryHref: "#contact",
  ctaSecondaryLabel: "View Projects",
  ctaSecondaryHref: "#projects",
};

const aboutFallback: AboutSectionContent = {
  title: "Cloud-first engineering with practical operations depth",
  description:
    "Methodical problem solver with production experience across AWS and Microsoft 365 environments, multi-account Terraform deployments, and SOC 2-aligned infrastructure workflows.",
  paragraphs: [
    "I specialize in building and maintaining infrastructure that is scalable, secure, and straightforward to operate. My day-to-day work spans cloud architecture, networking, automation, and escalation support.",
    "Recent focus areas include website development, Terraform module design, CI/CD pipelines, hybrid cloud migrations, and cost-optimized AWS environments designed for high reliability under real production constraints.",
  ],
  profileLinksHeading: "Profile Links",
  profileLinksDescription: "Check out my LinkedIn profile and GitLab.",
};

const certificationsFallback: CertificationContent[] = [
  {
    _id: "cert-aws-sa",
    name: "AWS Certified Solutions Architect – Associate",
    date: "March 2024",
    certType: "cert",
  },
  {
    _id: "cert-ejpt",
    name: "eLearnSecurity Junior Penetration Tester (eJPT)",
    date: "July 2023",
    certType: "cert",
  },
  {
    _id: "cert-a-plus",
    name: "CompTIA A+",
    date: "April 2021",
    certType: "cert",
  },
  {
    _id: "education-bhcc",
    name: "Bunker Hill Community College",
    date: "May 2025",
    certType: "education",
    details: "Associate in Science, Computer Science Transfer",
  },
];

export async function fetchHeroSection(): Promise<HeroSectionContent> {
  const sanityClient = getSanityClient();
  if (!sanityClient) {
    return heroFallback;
  }
  try {
    const result = await sanityClient.fetch<HeroSectionContent | null>(
      HERO_SECTION_QUERY,
    );
    return result ?? heroFallback;
  } catch (error) {
    logSanity("Failed to fetch hero section, using fallback.", error);
    return heroFallback;
  }
}

export async function fetchAboutSection(): Promise<AboutSectionContent> {
  const sanityClient = getSanityClient();
  if (!sanityClient) {
    return aboutFallback;
  }
  try {
    const result = await sanityClient.fetch<AboutSectionContent | null>(
      ABOUT_SECTION_QUERY,
    );
    return result ?? aboutFallback;
  } catch (error) {
    logSanity("Failed to fetch about section, using fallback.", error);
    return aboutFallback;
  }
}

export async function fetchSiteConfig(): Promise<SiteConfigContent> {
  const sanityClient = getSanityClient();
  if (!sanityClient) {
    return siteConfigFallback;
  }
  try {
    const result = await sanityClient.fetch<SiteConfigContent | null>(
      SITE_CONFIG_QUERY,
    );
    return result ?? siteConfigFallback;
  } catch (error) {
    logSanity("Failed to fetch site config, using fallback.", error);
    return siteConfigFallback;
  }
}

export async function fetchExperience(): Promise<ExperienceContent> {
  const sanityClient = getSanityClient();
  if (!sanityClient) {
    return {
      role: fallbackExperience.role,
      company: fallbackExperience.company,
      period: fallbackExperience.period,
      highlightGroups: [
        {
          groupTitle: "AWS Cloud Engineering",
          accentColor: "#60a5fa",
          items: fallbackExperience.highlights.awsCloudEngineering,
        },
        {
          groupTitle: "Windows & On-Premises Infrastructure",
          accentColor: "#c084fc",
          items: fallbackExperience.highlights.windowsAndOnPrem,
        },
      ],
    };
  }
  try {
    const result = await sanityClient.fetch<ExperienceContent | null>(
      EXPERIENCE_QUERY,
    );
    if (result) {
      return result;
    }
  } catch (error) {
    logSanity("Failed to fetch experience, using fallback.", error);
  }
  return {
    role: fallbackExperience.role,
    company: fallbackExperience.company,
    period: fallbackExperience.period,
    highlightGroups: [
      {
        groupTitle: "AWS Cloud Engineering",
        accentColor: "#60a5fa",
        items: fallbackExperience.highlights.awsCloudEngineering,
      },
      {
        groupTitle: "Windows & On-Premises Infrastructure",
        accentColor: "#c084fc",
        items: fallbackExperience.highlights.windowsAndOnPrem,
      },
    ],
  };
}

export async function fetchSkillCategories(): Promise<SkillCategory[]> {
  const sanityClient = getSanityClient();
  if (!sanityClient) {
    return fallbackSkillCategories;
  }
  try {
    const result = await sanityClient.fetch<SkillCategory[] | null>(
      SKILL_CATEGORIES_QUERY,
    );
    return result && result.length > 0 ? result : fallbackSkillCategories;
  } catch (error) {
    logSanity("Failed to fetch skills, using fallback.", error);
    return fallbackSkillCategories;
  }
}

export async function fetchProjects(): Promise<ProjectItem[]> {
  const sanityClient = getSanityClient();
  if (!sanityClient) {
    return fallbackProjects;
  }
  try {
    const result = await sanityClient.fetch<ProjectItem[] | null>(PROJECTS_QUERY);
    return result && result.length > 0 ? result : fallbackProjects;
  } catch (error) {
    logSanity("Failed to fetch projects, using fallback.", error);
    return fallbackProjects;
  }
}

export async function fetchCertifications(): Promise<CertificationContent[]> {
  const sanityClient = getSanityClient();
  if (!sanityClient) {
    return certificationsFallback;
  }
  try {
    const result = await sanityClient.fetch<CertificationContent[] | null>(
      CERTIFICATIONS_QUERY,
    );
    return result && result.length > 0 ? result : certificationsFallback;
  } catch (error) {
    logSanity("Failed to fetch certifications, using fallback.", error);
    return certificationsFallback;
  }
}
