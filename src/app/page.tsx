import { AboutSection } from "@/components/sections/about";
import { CertificationsSection } from "@/components/sections/certifications";
import { ContactSection } from "@/components/sections/contact";
import { ExperienceSection } from "@/components/sections/experience";
import { HeroSection } from "@/components/sections/hero";
import { ProjectsSection } from "@/components/sections/projects";
import { SkillsSection } from "@/components/sections/skills";
import {
  fetchAboutSection,
  fetchCertifications,
  fetchExperience,
  fetchHeroSection,
  fetchProjects,
  fetchSiteConfig,
  fetchSkillCategories,
} from "@/sanity/lib/fetch";

export default async function Home() {
  const [siteConfig, hero, about, skills, experience, projects, certifications] =
    await Promise.all([
      fetchSiteConfig(),
      fetchHeroSection(),
      fetchAboutSection(),
      fetchSkillCategories(),
      fetchExperience(),
      fetchProjects(),
      fetchCertifications(),
    ]);
  return (
    <>
      <HeroSection data={hero} domain={siteConfig.domain} />
      <AboutSection data={about} socialLinks={siteConfig.socialLinks} />
      <SkillsSection categories={skills} />
      <ExperienceSection data={experience} />
      <ProjectsSection projects={projects} />
      <CertificationsSection certifications={certifications} />
      <ContactSection socialLinks={siteConfig.socialLinks} />
    </>
  );
}
