import Vue from "vue";
import _ from "lodash";
import "./styles.sass"

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
}

type AutoCompleteData = {
    currentItem:ListItem
    listHovered:boolean
    listVisible:boolean
}

const getNextItem = function(items:Array<ListItem>, item:ListItem):ListItem {
    if (_.isEmpty(item)) {
        return _.first(items);
    }

    if (item === _.last(items)) {
        return _.first(items)
    }

    return items[_.indexOf(items, item) + 1];
}

const getPreviousItem = function(items:Array<ListItem>, item:ListItem):ListItem {
    if (_.isEmpty(item)) {
        return _.first(items);
    }

    if (item === _.first(items)) {
        return _.last(items)
    }

    return items[_.indexOf(items, item) - 1];
}

const autoCompleteField = Vue.component("auto-complete-field", {
    computed: {
        currentValue: {
            get():string {
                return this.currentItem.getLabel();
            },
            set(value:string) {
                if (this.currentItem.getLabel() !== value) {
                    this.currentItem = this.getItemByLabel(value);
                }

                this.$emit("input", this.currentItem);
            }
        }
    },
    data: function() {
        return <AutoCompleteData>{
            currentItem: <ListItem>new Item(""),
            listHovered: false,
            listVisible: false
        };
    },
    methods: {
        getItemByLabel(label:string):ListItem {
            let item:ListItem = _.find(this.items, (item:ListItem) => item.getLabel() === label);

            if (_.isNil(item)) {
                return new Item(label);
            }

            return item;
        },
        isCurrentItem: function(item:ListItem) {
            return item === this.currentItem;
        },
        onBlur: function() {
            if (!this.listHovered) {
                this.listVisible = false;
            }
        },
        onClick(item:ListItem) {
            this.updateValue(item.getLabel());
            this.listHovered = false;
            this.listVisible = false;
        },
        onFocus: function() {
            if (!_.isEmpty(this.items)) this.listVisible = true;
        },
        onInput: function(input:string) {
            this.updateValue(input);
            this.onValueChange(input);
        },
        onMoveDown: function() {
            this.currentItem = getNextItem(this.items, this.currentItem);
            this.updateValue(this.currentItem.getLabel());
            this.selectText();
        },
        onMoveUp: function() {
            this.currentItem = getPreviousItem(this.items, this.currentItem);
            this.updateValue(this.currentItem.getLabel());
            this.selectText();
        },
        selectText: function() {
            let inputField:HTMLInputElement = this.$el.querySelector("input[type=text]");

            // This is weird but selection works only if invoked asynchronously
            window.setTimeout(
                () => inputField.select(),
                0
            )
        },
        updateValue: function(newValue:string) {
            console.log(newValue);
            this.currentValue = newValue;
        }
    },
    props: ["items", "onValueChange"],
    template: `
        <div>
            <input
                type="text"
                v-on="{ blur: onBlur, focus: onFocus }"
                :value="currentValue"
                @input="onInput($event.target.value)"
                @keyup.down="onMoveDown"
                @keyup.up="onMoveUp">
            <ul class="auto-complete-list" v-if="listVisible">
                <li @click="onClick(item)" @mouseover="listHovered = true" @mouseout="listHovered = false" :class="{ selected: isCurrentItem(item) }" v-for="item in items">{{ item.getLabel() }}</li>
            </ul>
        </div>
    `,
    watch: {
        items: function(newList:Array<ListItem>) {
            if (_.isEmpty(newList)) {
                this.currentItem = new Item(this.currentValue);
                this.listVisible = false;
                return;
            }

            this.listVisible = true;
        },
        currentItem: function(item:ListItem) {

        }
    }
});

export { autoCompleteField, ListItem };
