import VueFormGenerator from "vue-form-generator";

/**
 * Generate an object containing data necessary for vue-form-generator.
 *
 * @param {Object} schema - The schema for the form. An empty model
 *   will be generated from this schema.
 * @param {Object} formOptions - Options for the form.
 * @return {Object}
 */
export default function generateFormData(schema, formOptions) {
    let model = VueFormGenerator.schema.createDefaultObject(schema);
    return {
        schema,
        model,
        formOptions,
    };
}
