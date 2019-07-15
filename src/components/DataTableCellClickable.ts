import { InputCheckbox } from "./input";

export default {
    components: {
        "input-checkbox": InputCheckbox
    },
    computed: {
        checked() {
            if (this.format !== "checkbox") {
                return false;
            }

            return this.checkedOptions.includes(this.value);
        }
    },
    props: {
        checkedOptions: {
            type: Array
        },
        format: {
            type: String
        },
        value: {
            required: true
        },
        onClick: {
            required: true,
            type: Function
        }
    },
    template: `
        <input-checkbox
            v-if="format === 'checkbox'"
            :checked="checked"
            :value="value"
            :on-change="onClick"
        />

        <span
            v-else
            class="clickable"
            @click="onClick()"
        >
            {{ value }}
        </span>
    `
};
