import {defineField, defineType} from "sanity";

export const siteConfigSchema = defineType({
  name: "siteConfig",
  title: "Site Config",
  type: "document",
  fields: [
    defineField({name: "title", title: "Title", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "domain", title: "Domain", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "tagline", title: "Tagline", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "description", title: "Description", type: "text", rows: 3, validation: (rule) => rule.required()}),
    defineField({
      name: "navItems",
      title: "Navigation items",
      type: "array",
      of: [
        defineField({
          type: "object",
          name: "navItem",
          fields: [
            defineField({name: "label", title: "Label", type: "string", validation: (rule) => rule.required()}),
            defineField({name: "href", title: "Href", type: "string", validation: (rule) => rule.required()}),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [
        defineField({name: "linkedin", title: "LinkedIn URL", type: "url", validation: (rule) => rule.required()}),
        defineField({name: "gitlab", title: "GitLab URL", type: "url", validation: (rule) => rule.required()}),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
});
