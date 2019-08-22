import Vue from "vue";
import AutoCompleteField from "./AutoCompleteField";
import "./ExpenseTagsFieldStyles.sass";

// enable `v-on:keyup.comma`
Vue.config.keyCodes.comma = 188;

export default {
    components: {
        "auto-complete-field": AutoCompleteField
    },
    computed: {
        tag: {
            get() {
                return this.temporaryTag;
            },
            set(newTag: string) {
                if (newTag.endsWith(",")) {
                    const tag = newTag.substring(0, newTag.length - 1);

                    this.appendTag(tag);

                    return;
                }

                this.temporaryTag = newTag;
            }
        }
    },
    data() {
        return {
            tags: [] as Array<String>,
            temporaryTag: "" as String
        }
    },
    methods: {
        appendTag(tag: string) {
            if (!this.tags.includes(tag)) {
                this.tags = [...this.tags, tag].filter((tag : string) => tag);
            }

            this.$emit("change", this.tags);

            this.temporaryTag = "";
        },
        onChange(tag: string) {
            this.appendTag(tag);
        },
        onClick(event: Event) {
            (event.target as HTMLInputElement).focus();
        },
        removeTag(tagIndex: number, event: Event) {
            this.tags = [...this.tags.slice(0, tagIndex), ...this.tags.slice(tagIndex + 1)];

            this.$emit("change", this.tags);
        }
    },
    inheritAttrs: true,
    props: {
        placeholder: String,
        value: {
            default: [],
            type: Array
        },
        values: {
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
                    autofocus="false"
                    class="input-tag-remove-button"
                    @click="(event) => removeTag(i, event)"
                >&times;</button>
            </span>
            <auto-complete-field
                v-model.lazy="tag"
                :items="values"
                :keepFocus="true"
                :placeholder="placeholder"
                @change="onChange"
                autofocus
                name="tags">
            </auto-complete-field>
        </div>
    `
};
