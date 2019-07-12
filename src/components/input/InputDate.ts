export default {
    beforeDestroy() {
        document.body.removeEventListener("click", this.onBlur);
    },
    data() {
        return {
            currentValue: this.value
        }
    },
    methods: {
        focus() {
            if (!this.$refs.input) return;

            this.$refs.input.focus();
        },
        onBlur(event: { target: HTMLInputElement }) {
            if (event.target !== this.$refs.input) {
                this.onExit(event.target.value);
            }
        },
        onValueChange(event: { target: HTMLInputElement }) {
            this.currentValue = event.target.value;
        },
        onValueUpdate() {
            this.onChange(this.currentValue);
        }
    },
    mounted() {
        this.focus();
        setTimeout(
            () => document.body.addEventListener("click", this.onBlur),
            250
        );
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
        <span
            class="input-field input-date"
        >
            <input
                ref="input"
                type="date"
                :value="value"
                @change="(event) => onValueChange(event)"
                @keyup.enter="onValueUpdate"
                @keyup.esc="(event) => onBlur(event)"
            />
            <button
                @click="onValueUpdate"
            >
                &#10004;
            </button>
        </span>`
};
