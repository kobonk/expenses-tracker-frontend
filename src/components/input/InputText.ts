const InputText = {
    methods: {
        onBlur(event: { target: HTMLInputElement }) {
            console.log("onBlur()");
            this.onExit(event.target.value);
        },
        onValueUpdate(event: { target: HTMLInputElement }) {
            console.log("onValueUpdate()");
            this.onChange(event.target.value);
        }
    },
    inheritAttrs: true,
    props: ["onExit", "onChange", "value"],
    template: `
        <input
            type="text"
            :value="value"
            @keyup.enter="(event) => onValueUpdate(event)"
            @blur="(event) => onBlur(event)"
        />`
};

export { InputText };
