import {defineField, defineType} from "sanity";

export const certificationSchema = defineType({
  name: "certification",
  title: "Certification",
  type: "document",
  fields: [
    defineField({name: "name", title: "Name", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "date", title: "Date", type: "string", validation: (rule) => rule.required()}),
    defineField({
      name: "certType",
      title: "Type",
      type: "string",
      options: {list: [{title: "Certification", value: "cert"}, {title: "Education", value: "education"}]},
      validation: (rule) => rule.required(),
      initialValue: "cert",
    }),
    defineField({name: "details", title: "Details", type: "string"}),
    defineField({name: "order", title: "Order", type: "number", validation: (rule) => rule.required().integer()}),
  ],
});
