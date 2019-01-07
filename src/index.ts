import Vue from "vue";

Vue.component(
    "todo-item",
    {
        props: ["title"],
        template: "\
            <li>\
                {{ title }}\
                <button v-on:click=\"$emit('remove')\">Remove</button>\
            </li>\
        "
    }
);

new Vue({
    el: "#todo-list-example",
    data: {
        newTodoText: "",
        todos: [
            { id: 1, title: "Do the dishes" },
            { id: 2, title: "Take out the trash" },
            { id: 3, title: "Walk the dog" }
        ],
        nextTodoId: 4
    },
    methods: {
        addNewTodo: function() {
            this.todos.push({
                id: this.nextTodoId++,
                title: this.newTodoText
            });
            this.newTodoText = "";
        }
    }
})
