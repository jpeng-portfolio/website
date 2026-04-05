import {defineField, defineType} from "sanity";

export const skillCategorySchema = defineType({
  name: "skillCategory",
  title: "Skill Category",
  type: "document",
  fields: [
    defineField({name: "id", title: "ID", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "title", title: "Title", type: "string", validation: (rule) => rule.required()}),
    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      of: [
        defineField({
          type: "object",
          name: "skill",
          fields: [
            defineField({name: "name", title: "Name", type: "string", validation: (rule) => rule.required()}),
            defineField({
              name: "level",
              title: "Level",
              type: "number",
              validation: (rule) => rule.required().integer().min(0).max(100),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({name: "order", title: "Order", type: "number", validation: (rule) => rule.required().integer()}),
  ],
});
