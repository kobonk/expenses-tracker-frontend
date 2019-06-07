export default {
    props: ["onClose"],
    template: `
        <h3>
            <button @click="onClose">«</button>
            <slot></slot>
        </h3>
    `
};
