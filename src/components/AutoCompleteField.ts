import "./AutoCompleteFieldStyles.sass";
import { debounce } from "utils/commonUtils";

const getNextItem: Function = (items: string[], item: string): string => {
    return item === items[items.length - 1]
        ? items[0]
        : items[items.indexOf(item) + 1];
};

const getPreviousItem: Function = (items: string[], item: string): string => {
    return item === items[0]
        ? items[items.length - 1]
        : items[items.indexOf(item) - 1];
};

const getMatchingItems: Function = (
    items: string[],
    item: string
): string[] => {
    const trimmedItem = item.trim();

    return items
        .filter(
            (listItem: string): boolean => {
                return new RegExp(trimmedItem, "i").test(listItem.trim());
            }
        )
        .sort(
            (itemA: string, itemB: string): number => {
                const indexA: number = itemA
                    .trim()
                    .toLowerCase()
                    .indexOf(trimmedItem.toLowerCase());
                const indexB: number = itemB
                    .trim()
                    .toLowerCase()
                    .indexOf(trimmedItem.toLowerCase());

                return indexA - indexB;
            }
        );
};

export default {
    computed: {
        currentItem: {
            get(): string {
                return this.value;
            },
            set(item: string) {
                this.temporaryItem = item;
                this.matchingItems = getMatchingItems(
                    this.items,
                    this.temporaryItem
                );
                this.listVisible = this.shouldDisplayList();

                this.$emit("input", item);
            },
        },
    },
    created() {
        this.debouncedOnBlur = debounce(this.onBlur, 500);
    },
    data() {
        return {
            fieldActive: false,
            listVisible: false,
            matchingItems: [] as string[],
            temporaryItem: "",
        };
    },
    inheritAttrs: false,
    methods: {
        getHtmlLabelForItem(item: string): string {
            return item.replace(
                new RegExp(`(${this.currentItem})`, "i"),
                "<mark>$1</mark>"
            );
        },
        isCurrentItem(item: string): boolean {
            return item.trim() === this.temporaryItem.trim();
        },
        onBlur() {
            this.fieldActive = false;
            this.listVisible = this.shouldDisplayList();

            if (this.temporaryItem) {
                this.$emit("change", this.temporaryItem);
            }
        },
        onClick(item: string) {
            this.updateCurrentValue(item);
        },
        onFocus() {
            this.fieldActive = true;
            this.listVisible = this.shouldDisplayList();
        },
        onListItemSelected(event: KeyboardEvent) {
            event.preventDefault();

            if (
                this.listVisible &&
                this.matchingItems.includes(this.temporaryItem)
            ) {
                event.stopPropagation();
            }

            if (this.temporaryItem) {
                this.updateCurrentValue(this.temporaryItem);
                this.$emit("change", this.temporaryItem);
                this.temporaryItem = "";
            }

            if (!this.keepFocus) {
                this.debouncedOnBlur();
            }
        },
        onListMoveDown() {
            const nextItem: string = getNextItem(
                this.matchingItems,
                this.temporaryItem
            );

            this.temporaryItem = !nextItem ? this.matchingItems[0] : nextItem;
            this.scrollToItem(this.temporaryItem);
        },
        onListMoveUp() {
            const prevItem = getPreviousItem(
                this.matchingItems,
                this.temporaryItem
            );

            this.temporaryItem = !prevItem
                ? this.matchingItems[this.matchingItems.length - 1]
                : prevItem;

            this.scrollToItem(this.temporaryItem);
        },
        scrollToItem(item: string) {
            const itemIndex = this.matchingItems.indexOf(item);
            const listElement = this.$refs["value-list"];

            if (!listElement) {
                return;
            }

            const listElementRect = listElement.getBoundingClientRect();
            const itemElement = listElement.querySelectorAll("li")[itemIndex];
            const itemElementRect = itemElement.getBoundingClientRect();

            const listBounds = {
                top: listElement.scrollTop,
                bottom: listElement.scrollTop + listElementRect.height,
            };

            const itemBounds = {
                top: itemElement.offsetTop,
                bottom: itemElement.offsetTop + itemElementRect.height,
            };

            const outsideUpwards = itemBounds.top < listBounds.top;
            const outsideDownwards = itemBounds.bottom > listBounds.bottom;
            const outOfBounds = outsideUpwards || outsideDownwards;

            if (outOfBounds) {
                listElement.scrollTop = outsideUpwards
                    ? itemBounds.top
                    : itemBounds.bottom - listElementRect.height;
            }
        },
        shouldDisplayList(): boolean {
            if (!this.temporaryItem) {
                return false;
            }

            if (this.matchingItems.length === 0 || !this.fieldActive) {
                return false;
            }

            if (
                this.matchingItems.length === 1 &&
                this.matchingItems[0] === this.temporaryItem
            ) {
                return false;
            }

            return true;
        },
        updateCurrentValue(item: string) {
            this.currentItem = item;
            this.onFocus();
        },
    },
    props: {
        items: Array,
        value: String,
        keepFocus: {
            default: false,
            type: Boolean,
        },
    },
    template: `
        <div class="auto-complete-field">
            <input
                autocomplete="off"
                ref="value-input"
                type="text"
                v-bind="$attrs"
                v-on="{ blur: debouncedOnBlur, focus: onFocus }"
                :value="currentItem"
                @input="updateCurrentValue($event.target.value)"
                @keydown.down="onListMoveDown"
                @keydown.enter="onListItemSelected"
                @keydown.escape="debouncedOnBlur"
                @keydown.up="onListMoveUp">
            <ul ref="value-list" class="auto-complete-list" v-if="listVisible">
                <li
                    @click="onClick(item)"
                    :class="{ selected: isCurrentItem(item) }"
                    v-for="item in matchingItems"
                    v-html="getHtmlLabelForItem(item)">
                </li>
            </ul>
        </div>
    `,
};
