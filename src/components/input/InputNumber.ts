export default {
    computed: {
        numericValue(): number {
            return this.convertToNumber(this.value);
        }
    },
    methods: {
        convertToNumber(text: string): number {
            return parseFloat(text.replace(/\s/g, ""));
        },
        focus() {
            const field = this.$refs.input;

            if (!field) return;

            field.focus();
        },
        onBlur(event: { target: HTMLInputElement }) {
            this.onExit(this.convertToNumber(event.target.value));
        },
        onValueUpdate(event: { target: HTMLInputElement }) {
            this.onChange(this.convertToNumber(event.target.value));
        }
    },
    mounted() {
        setTimeout(this.focus, 50);
    },
    inheritAttrs: true,
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
            class="input-field input-number"
            min="0"
            ref="input"
            step="0.01"
            type="number"
            :value="numericValue"
            @keyup.enter="(event) => onValueUpdate(event)"
            @keyup.esc="(event) => onBlur(event)"
            @blur="(event) => onBlur(event)"
        />`
};
