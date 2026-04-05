import {defineField, defineType} from "sanity";

export const projectSchema = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({name: "title", title: "Title", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "period", title: "Period", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "liveUrl", title: "Live URL", type: "url", validation: (rule) => rule.required()}),
    defineField({name: "repositoryUrl", title: "Repository URL", type: "url"}),
    defineField({name: "repositoryLabel", title: "Repository label", type: "string"}),
    defineField({name: "summary", title: "Summary", type: "text", rows: 3, validation: (rule) => rule.required()}),
    defineField({
      name: "tech",
      title: "Tech tags",
      type: "array",
      of: [{type: "string"}],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "bullets",
      title: "Bullets",
      type: "array",
      of: [{type: "string"}],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({name: "order", title: "Order", type: "number", validation: (rule) => rule.required().integer()}),
  ],
});
