export default {
    inheritAttrs: true,
    props: {
        checked: {
            required: true,
            type: Boolean
        },
        onChange: {
            required: true,
            type: Function
        },
        value: {
            required: true,
            type: String
        }
    },
    template: `
        <input
            class="input-field input-checkbox"
            ref="input"
            type="checkbox"
            :checked="checked"
            :value="value"
            @change="onChange"
        />`
};
