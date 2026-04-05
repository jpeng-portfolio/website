import {defineField, defineType} from "sanity";

export const aboutSectionSchema = defineType({
  name: "aboutSection",
  title: "About Section",
  type: "document",
  fields: [
    defineField({name: "title", title: "Title", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "description", title: "Description", type: "text", rows: 3, validation: (rule) => rule.required()}),
    defineField({
      name: "paragraphs",
      title: "Paragraphs",
      type: "array",
      of: [{type: "string"}],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({name: "profileLinksHeading", title: "Profile links heading", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "profileLinksDescription", title: "Profile links description", type: "text", rows: 2, validation: (rule) => rule.required()}),
  ],
});
