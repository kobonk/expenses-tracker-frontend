import { InputDate, InputNumber, InputText } from "./input";

export default {
    components: {
        "input-date": InputDate,
        "input-number": InputNumber,
        "input-text": InputText
    },
    data() {
        return {
            editing: false
        }
    },
    methods: {
        onClick() {
            this.editing = true;
        },
        onExit() {
            this.editing = false;
        },
        onFieldUpdated(value: any) {
            if ((typeof this.onChange === "function") && this.value !== value) {
                this.onChange(value);
            }

            this.onExit();
        }
    },
    props: {
        value: {
            required: true
        },
        format: {
            required: true,
            type: String
        },
        onChange: {
            type: Function
        }
    },
    template: `
        <span
            class="clickable"
            @click="onClick()"
            v-if="!editing"
        >
            {{ value }}
        </span>

        <input-number
            v-else-if="editing && format === 'number'"
            :value="value"
            :on-change="(value) => onFieldUpdated(value)"
            :on-exit="onExit"
        />

        <input-date
            v-else-if="editing && format === 'date'"
            :value="value"
            :on-change="(value) => onFieldUpdated(value)"
            :on-exit="onExit"
        />

        <input-text
            v-else
            :value="value"
            :on-change="(value) => onFieldUpdated(value)"
            :on-exit="onExit"
        />
    `
};
