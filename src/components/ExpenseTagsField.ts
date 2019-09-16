import Vue from "vue";
import AutoCompleteField from "./AutoCompleteField";
import "./ExpenseTagsFieldStyles.sass";
import ExpenseTag from "./../types/ExpenseTag";

// enable `v-on:keyup.comma`
Vue.config.keyCodes.comma = 188;

export default {
    components: {
        "auto-complete-field": AutoCompleteField
    },
    computed: {
        existingTagNames(): String[] {
            return this.registeredTags.map((tag: ExpenseTag): String => tag.getName());
        },
        tag: {
            get() {
                return this.temporaryTagName;
            },
            set(newTagName: string) {
                if (newTagName.endsWith(",")) {
                    const tagName = newTagName.substring(0, newTagName.length - 1);

                    this.appendTag(this.createTagFromName(tagName));

                    return;
                }

                this.temporaryTagName = newTagName;
            }
        }
    },
    data() {
        return {
            temporaryTagName: "" as String
        }
    },
    methods: {
        appendTag(tag: ExpenseTag) {
            if (!this.tags.includes(tag)) {
                this.tags = [...this.tags, tag].filter((tag : ExpenseTag) => tag);
            }

            this.$emit("change", this.tags);

            this.temporaryTagName = "";
        },
        createTagFromName(tagName: string): ExpenseTag {
            const matchingTags = this.registeredTags
                .filter((existingTag: ExpenseTag) => existingTag.getName() === tagName);

            return matchingTags.length > 0 ? matchingTags[0] : new ExpenseTag(undefined, tagName);
        },
        onChange(tagName: string) {
            this.appendTag(this.createTagFromName(tagName));
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
        tags: {
            default: [],
            type: Array
        },
        registeredTags: {
            default: [],
            type: Array
        },
        tabindex: {
            type: Number
        }
    },
    template: `
        <div class="input-field input-tags" @click="onClick">
            <span
                class="input-tag"
                v-for="tag, i in tags"
            >
                {{tag.getName()}}
                <button
                    autofocus="false"
                    class="input-tag-remove-button"
                    @click="(event) => removeTag(i, event)"
                    type="button"
                >&times;</button>
            </span>
            <auto-complete-field
                v-model.lazy="tag"
                :items="existingTagNames"
                :keepFocus="true"
                :placeholder="placeholder"
                @change="onChange"
                autofocus
                name="tags"
                :tabindex="tabindex">
            </auto-complete-field>
        </div>
    `
};
