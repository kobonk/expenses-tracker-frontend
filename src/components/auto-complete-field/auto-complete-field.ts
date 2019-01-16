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
        }
    },
    data() {
        return {
            currentItem: <ListItem>new Item(""),
            listVisible: false
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
        onBlur() {
            window.setTimeout(
                () => this.listVisible = false,
                fieldBlurDelay
            )
        },
        onClick(item:ListItem) {
            this.setCurrentValue(item.getLabel());
            this.listVisible = false;
            this.setFieldFocus()
            .then(this.selectFieldText);
        },
        onFocus() {
            if (!_.isEmpty(this.items)) {
                this.listVisible = true;
            }
        },
        onMoveDown() {
            let nextItem = getNextItem(this.items, this.currentItem);
            this.currentItem = _.isNil(nextItem) ? _.first(this.items) : nextItem;
            this.setCurrentValue(this.currentItem.getLabel());
            this.selectFieldText();
        },
        onMoveUp() {
            let previousItem = getPreviousItem(this.items, this.currentItem);
            this.currentItem = _.isNil(previousItem) ? _.first(this.items) : previousItem;
            this.setCurrentValue(this.currentItem.getLabel());
            this.selectFieldText();
        },
        selectFieldText():Promise<any> {
            let inputField:HTMLInputElement = this.$refs.input;

            // This is weird but select() works only if invoked asynchronously
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
        setFieldFocus():Promise<any> {
            let inputField:HTMLInputElement = this.$refs.input;

            // This is weird but focus() works only if invoked asynchronously
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
        setCurrentValue(value:string) {
            if (this.currentItem.getLabel() !== value) {
                this.currentItem = this.getItemByLabel(value);
            }

            this.$emit("input", this.currentItem);
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
                v-on="{ blur: onBlur, focus: onFocus }"
                :value="currentValue.getLabel()"
                @input="setCurrentValue($event.target.value)"
                @keyup.down="onMoveDown"
                @keyup.up="onMoveUp">
            <ul class="auto-complete-list" v-if="listVisible">
                <li
                    @click="onClick(item)"
                    :class="{ selected: isCurrentItem(item) }"
                    v-for="item in items"
                >{{ item.getLabel() }}</li>
            </ul>
        </div>
    `,
    watch: {
        items(newList:Array<ListItem>) {
            if (_.isEmpty(newList)) {
                this.currentItem = new Item(this.currentValue);
                this.listVisible = false;
                return;
            }

            this.listVisible = true;
        }
    }
};

export { autoCompleteField, ListItem };
