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
            get():String {
                return this.value;
            },
            set(item:String) {
                this.temporaryItem = item;
                this.$emit("input", item);
            }
        },
        listVisible():Boolean {
            if (!this.fieldActive || _.isEmpty(this.currentItem)) {
                return false;
            }

            if (this.matchingItems.length === 1 && _.first(this.matchingItems) === this.currentItem) {
                return false;
            }

            return true;
        },
        matchingItems():Array<String> {
            return _.filter(this.items, (item:String) => {
                return (new RegExp(_.trim(this.currentItem), "i")).test(_.trim(item))
            });
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
        getHtmlLabelForItem(item:String):String {
            return _.replace(item, new RegExp(`(${ this.currentItem })`, "i"), "<mark>$1</mark>");
        },
        isCurrentItem(item:String):Boolean {
            return _.isEqual(item, this.temporaryItem);
        },
        onBlur() {
            this.fieldActive = false;
        },
        onClick(item:String) {
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
            let nextItem:String = getNextItem(this.matchingItems, this.temporaryItem);
            this.temporaryItem = _.isNil(nextItem) ? _.first(this.matchingItems) : nextItem;
        },
        onListMoveUp() {
            let prevItem = getPreviousItem(this.matchingItems, this.temporaryItem);
            this.temporaryItem = _.isNil(prevItem) ? _.last(this.matchingItems) : prevItem;
        },
        updateCurrentValue(item:String) {
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
            <ul class="auto-complete-list" v-if="listVisible">
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
