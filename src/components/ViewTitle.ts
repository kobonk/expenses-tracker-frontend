export default {
    props: {
        onClose: {
            required: true,
            type: Function
        }
    },
    template: `
        <header>
            <button @click="onClose">«</button>
            <h3>
                <slot></slot>
            </h3>
        </header>
    `
};
