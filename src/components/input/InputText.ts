export default {
    methods: {
        focus() {
            const field = this.$refs.input;

            field.focus();
            field.setSelectionRange(0, this.value.length);
        },
        onBlur(event: { target: HTMLInputElement }) {
            this.onExit(event.target.value);
        },
        onValueUpdate(event: { target: HTMLInputElement }) {
            this.onChange(event.target.value);
        }
    },
    inheritAttrs: true,
    mounted() {
        setTimeout(this.focus, 50);
    },
    props: {
        onExit: {
            required: true,
            type: Function
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
            class="input-field input-text"
            ref="input"
            type="text"
            :value="value"
            @keyup.enter="(event) => onValueUpdate(event)"
            @keyup.esc="(event) => onBlur(event)"
            @blur="(event) => onBlur(event)"
        />`
};
