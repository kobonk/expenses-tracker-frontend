export default {
    props: {
        value: {
            required: true
        },
        onClick: {
            required: true,
            type: Function
        }
    },
    template: `
        <span
            class="clickable"
            @click="onClick()"
        >
            {{ value }}
        </span>
    `
};
