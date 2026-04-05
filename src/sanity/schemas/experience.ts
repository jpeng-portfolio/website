import {defineField, defineType} from "sanity";

export const experienceSchema = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    defineField({name: "role", title: "Role", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "company", title: "Company", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "period", title: "Period", type: "string", validation: (rule) => rule.required()}),
    defineField({
      name: "highlightGroups",
      title: "Highlight groups",
      type: "array",
      of: [
        defineField({
          type: "object",
          name: "highlightGroup",
          fields: [
            defineField({name: "groupTitle", title: "Group title", type: "string", validation: (rule) => rule.required()}),
            defineField({name: "accentColor", title: "Accent color", type: "string", initialValue: "#60a5fa"}),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [{type: "string"}],
              validation: (rule) => rule.required().min(1),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});
