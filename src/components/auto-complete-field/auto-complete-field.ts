import "./styles.sass"

const _ = require("lodash");

const getNextItem = function(items:Array<any>, item:any):any {
    return item === _.last(items) ? _.first(items) : items[_.indexOf(items, item) + 1];
};

const getPreviousItem = function(items:Array<any>, item:any):any {
    return item === _.first(items) ? _.last(items) : items[_.indexOf(items, item) - 1];
};

export default {
    computed: {
        currentItem: {
            get(): string {
                return this.value;
            },
            set(item: string) {
                this.temporaryItem = item;
                this.$emit("input", item);
            }
        },
        listVisible(): boolean {
            if (!this.fieldActive || _.isEmpty(this.currentItem)) {
                return false;
            }

            if (this.matchingItems.length === 1 && _.first(this.matchingItems) === this.currentItem) {
                return false;
            }

            return true;
        },
        matchingItems(): Array<string> {
            return _.chain(this.items)
            .filter((item: string) => {
                return (new RegExp(_.trim(this.currentItem), "i")).test(_.trim(item))
            })
            .sortBy((item: string) => _.toLower(_.trim(item)).indexOf(_.toLower(_.trim(this.currentItem))))
            .value();
        }
    },
    created() {
        this.debouncedOnBlur = _.debounce(this.onBlur, 500)
    },
    data() {
        return {
            fieldActive: false,
            temporaryItem: ""
        };
    },
    inheritAttrs: false,
    methods: {
        getHtmlLabelForItem(item: string): string {
            return _.replace(item, new RegExp(`(${ this.currentItem })`, "i"), "<mark>$1</mark>");
        },
        isCurrentItem(item: string): boolean {
            return _.isEqual(item, this.temporaryItem);
        },
        onBlur() {
            this.fieldActive = false;
        },
        onClick(item: string) {
            this.updateCurrentValue(item);
        },
        onFocus() {
            this.fieldActive = true;
        },
        onListItemSelected() {
            if (!_.isEmpty(this.temporaryItem)) {
                this.updateCurrentValue(this.temporaryItem);
            }
        },
        onListMoveDown() {
            let nextItem: string = getNextItem(this.matchingItems, this.temporaryItem);
            this.temporaryItem = _.isNil(nextItem) ? _.first(this.matchingItems) : nextItem;
            this.scrollToItem(this.temporaryItem);
        },
        onListMoveUp() {
            let prevItem = getPreviousItem(this.matchingItems, this.temporaryItem);
            this.temporaryItem = _.isNil(prevItem) ? _.last(this.matchingItems) : prevItem;
            this.scrollToItem(this.temporaryItem);
        },
        scrollToItem(item: string) {
            let itemIndex = _.indexOf(this.matchingItems, item);
            let listElement = this.$refs["value-list"];
            let listElementRect = listElement.getBoundingClientRect();
            let itemElement = listElement.querySelectorAll("li")[itemIndex];
            let itemElementRect = itemElement.getBoundingClientRect();

            let listBounds = {
                top: listElement.scrollTop,
                bottom: listElement.scrollTop + listElementRect.height
            }

            let itemBounds = {
                top: itemElement.offsetTop,
                bottom: itemElement.offsetTop + itemElementRect.height
            }

            let outsideUpwards = itemBounds.top < listBounds.top;
            let outsideDownwards = itemBounds.bottom > listBounds.bottom;
            let outOfBounds = outsideUpwards || outsideDownwards;

            if (outOfBounds) {
                listElement.scrollTop = outsideUpwards ? itemBounds.top : itemBounds.bottom - listElementRect.height;
            }
        },
        updateCurrentValue(item: string) {
            this.currentItem = item;
        }
    },
    props: ["value", "items"],
    template: `
        <div>
            <input
                autocomplete="off"
                ref="value-input"
                type="text"
                v-bind="$attrs"
                v-on="{ blur: debouncedOnBlur, focus: onFocus }"
                :value="currentItem"
                @input="updateCurrentValue($event.target.value)"
                @keydown.enter="onListItemSelected"
                @keyup.down="onListMoveDown"
                @keyup.up="onListMoveUp">
            <ul ref="value-list" class="auto-complete-list" v-if="listVisible">
                <li
                    @click="onClick(item)"
                    :class="{ selected: isCurrentItem(item) }"
                    v-for="item in matchingItems"
                    v-html="getHtmlLabelForItem(item)">
                </li>
            </ul>
        </div>
    `
}
