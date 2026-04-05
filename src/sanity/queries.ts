import {defineQuery} from "next-sanity";

export const HERO_SECTION_QUERY = defineQuery(`
  *[_type == "heroSection" && _id == "heroSection"][0]{
    headline,
    subheadline,
    ctaPrimaryLabel,
    ctaPrimaryHref,
    ctaSecondaryLabel,
    ctaSecondaryHref
  }
`);

export const ABOUT_SECTION_QUERY = defineQuery(`
  *[_type == "aboutSection" && _id == "aboutSection"][0]{
    title,
    description,
    paragraphs,
    profileLinksHeading,
    profileLinksDescription
  }
`);

export const SITE_CONFIG_QUERY = defineQuery(`
  *[_type == "siteConfig" && _id == "siteConfig"][0]{
    title,
    domain,
    tagline,
    description,
    navItems[]{
      label,
      href
    },
    socialLinks{
      linkedin,
      gitlab
    }
  }
`);

export const EXPERIENCE_QUERY = defineQuery(`
  *[_type == "experience" && _id == "experience"][0]{
    role,
    company,
    period,
    highlightGroups[]{
      groupTitle,
      accentColor,
      items
    }
  }
`);

export const SKILL_CATEGORIES_QUERY = defineQuery(`
  *[_type == "skillCategory"] | order(order asc) {
    _id,
    id,
    title,
    skills[]{
      name,
      level
    }
  }
`);

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(order asc){
    _id,
    title,
    period,
    liveUrl,
    repositoryUrl,
    repositoryLabel,
    summary,
    tech,
    bullets
  }
`);

export const CERTIFICATIONS_QUERY = defineQuery(`
  *[_type == "certification"] | order(order asc){
    _id,
    name,
    date,
    certType,
    details
  }
`);
