import {defineField, defineType} from "sanity";

export const heroSectionSchema = defineType({
  name: "heroSection",
  title: "Hero Section",
  type: "document",
  fields: [
    defineField({name: "headline", title: "Headline", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "subheadline", title: "Subheadline", type: "text", rows: 3, validation: (rule) => rule.required()}),
    defineField({name: "ctaPrimaryLabel", title: "Primary CTA label", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "ctaPrimaryHref", title: "Primary CTA href", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "ctaSecondaryLabel", title: "Secondary CTA label", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "ctaSecondaryHref", title: "Secondary CTA href", type: "string", validation: (rule) => rule.required()}),
  ],
});
