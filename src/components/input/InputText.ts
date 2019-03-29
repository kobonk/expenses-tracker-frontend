const InputText = {
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
    props: ["onExit", "onChange", "value"],
    template: `
        <input
            ref="input"
            type="text"
            :value="value"
            @keyup.enter="(event) => onValueUpdate(event)"
            @keyup.esc="(event) => onBlur(event)"
            @blur="(event) => onBlur(event)"
        />`
};

export { InputText };
