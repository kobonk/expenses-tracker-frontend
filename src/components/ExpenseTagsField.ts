import Vue from "vue";
import "./ExpenseTagsFieldStyles.sass";

// enable `v-on:keyup.comma`
Vue.config.keyCodes.comma = 188;

export default {
    data() {
        return {
            tags: [] as Array<String>,
            tag: "" as String
        }
    },
    methods: {
        onClick() {
            this.$refs.input.focus();
        },
        onBlur() {
            if (!this.tags.includes(this.tag)) {
                this.tags = [...this.tags, this.tag].filter((tag : string) => tag);
            }

            this.tag = "";

            this.$emit("change", this.tags);
        },
        onCommaPressed() {
            const newTags = this.tag
                .split(",")
                .filter((tag : string, i : number, tags : Array<string>) => tags.indexOf(tag) === i);

            this.tag = newTags[newTags.length - 1];
            this.tags = [...this.value, ...newTags.slice(0, -1)];

            this.$emit("change", this.tags);
        },
        removeTag(tagIndex : number) {
            this.tags = [...this.tags.slice(0, tagIndex), ...this.tags.slice(tagIndex + 1)];

            this.$emit("change", this.tags);
        }
    },
    inheritAttrs: true,
    props: {
        value: {
            default: [],
            type: Array
        }
    },
    template: `
        <div class="input-field input-tags" @click="onClick">
            <span
                class="input-tag"
                v-for="tag, i in value"
            >
                {{tag}}
                <button
                    class="input-tag-remove-button"
                    @click="() => removeTag(i)"
                >X</button>
            </span>
            <input
                ref="input"
                type="text"
                v-model="tag"
                @keyup.comma="(event) => onCommaPressed(event)"
                @keyup.esc="(event) => onBlur(event)"
                @blur="(event) => onBlur(event)"
            />
        </div>
    `
};
