import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./src/sanity/schemas";

const singletonTypes = new Set(["heroSection", "aboutSection", "siteConfig", "experience"]);

export default defineConfig({
  name: "default",
  title: "JP Portfolio CMS",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Hero Section")
              .child(
                S.document().schemaType("heroSection").documentId("heroSection"),
              ),
            S.listItem()
              .title("About Section")
              .child(
                S.document().schemaType("aboutSection").documentId("aboutSection"),
              ),
            S.listItem()
              .title("Site Config")
              .child(
                S.document().schemaType("siteConfig").documentId("siteConfig"),
              ),
            S.listItem()
              .title("Experience")
              .child(S.document().schemaType("experience").documentId("experience")),
            S.divider(),
            S.documentTypeListItem("skillCategory").title("Skill Categories"),
            S.documentTypeListItem("project").title("Projects"),
            S.documentTypeListItem("certification").title("Certifications"),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (prev, context) =>
      singletonTypes.has(context.schemaType)
        ? prev.filter(
            ({action}) => action !== "duplicate" && action !== "unpublish",
          )
        : prev,
  },
});
