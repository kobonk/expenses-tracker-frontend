import "./styles.sass"

const _ = require("lodash");

interface ListItem {
    getLabel():string;
    getId():string;
};

class Item implements ListItem {
    private label:string;

    constructor(label:string) {
        this.label = label;
    }

    getLabel():string {
        return this.label;
    }

    getId():string {
        return null;
    }
};

const getNextItem = function(items:Array<ListItem>, item:ListItem):ListItem {
    return item === _.last(items) ? _.first(items) : items[_.indexOf(items, item) + 1];
};

const getPreviousItem = function(items:Array<ListItem>, item:ListItem):ListItem {
    return item === _.first(items) ? _.last(items) : items[_.indexOf(items, item) - 1];
};

const keyboardInputDelay = 100;
const fieldBlurDelay = keyboardInputDelay + 50;
const fieldFocusDelay = fieldBlurDelay + 50;

const autoCompleteField = {
    computed: {
        currentValue() {
            return this.getItemByLabel(this.value.getLabel());
        },
        listVisible() {
            let value:string = _.trim(this.value.getLabel());

            if (_.isEmpty(value)) {
                return false;
            }

            if (this.items.length === 1 && _.first(this.items).getLabel() === value) {
                return false;
            }

            return true;
        }
    },
    data() {
        return {
            currentItem: <ListItem>new Item("")
        };
    },
    inheritAttrs: false,
    methods: {
        getItemByLabel(label:string):ListItem {
            let item:ListItem = _.find(this.items, (item:ListItem) => item.getLabel() === label);

            return _.isNil(item) ? new Item(label) : item;
        },
        isCurrentItem(item:ListItem):boolean {
            return item === this.currentItem;
        },
        onClick(item:ListItem) {
            this.setCurrentValue(item.getLabel());
            this.setFieldFocus()
            .then(this.selectFieldText);
        },
        onListItemSelected() {
            this.setCurrentValue(this.currentItem.getLabel());
        },
        onListMoveDown() {
            let nextItem = getNextItem(this.items, this.currentItem);
            this.currentItem = _.isNil(nextItem) ? _.first(this.items) : nextItem;
        },
        onListMoveUp() {
            let previousItem = getPreviousItem(this.items, this.currentItem);
            this.currentItem = _.isNil(previousItem) ? _.first(this.items) : previousItem;
        },
        selectFieldText():Promise<any> {
            let inputField:HTMLInputElement = this.$refs.input;

            return new Promise((resolve:any) => {
                window.setTimeout(
                    () => {
                        inputField.select();
                        resolve();
                    },
                    0
                )
            });
        },
        setCurrentValue(value:string) {
            if (_.isNil(this.currentItem) || this.currentItem.getLabel() !== value) {
                this.currentItem = this.getItemByLabel(value);
            }

            this.$emit("input", this.currentItem);
        },
        setFieldFocus():Promise<any> {
            let inputField:HTMLInputElement = this.$refs.input;

            return new Promise((resolve:any) => {
                window.setTimeout(
                    () => {
                        inputField.focus();
                        resolve();
                    },
                    fieldFocusDelay
                )
            });

        },
        getHtmlLabelForItem(item:ListItem):string {
            return _.replace(item.getLabel(), new RegExp(`(${ this.value.getLabel() })`, "i"), "<mark>$1</mark>")
        }
    },
    props: ["items", "value"],
    template: `
        <div>
            <input
                autocomplete="off"
                ref="input"
                type="text"
                v-bind="$attrs"
                :value="currentValue.getLabel()"
                @input.prevent="setCurrentValue($event.target.value)"
                @keydown.enter="onListItemSelected"
                @keyup.down="onListMoveDown"
                @keyup.up="onListMoveUp">
            <ul class="auto-complete-list" v-if="listVisible">
                <li
                    @click="onClick(item)"
                    :class="{ selected: isCurrentItem(item) }"
                    v-for="item in items"
                    v-html="getHtmlLabelForItem(item)">
                </li>
            </ul>
        </div>
    `
};

export { autoCompleteField, ListItem };
