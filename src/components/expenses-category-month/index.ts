import { component as dataTableComponent } from "./../data-table/data-table";
import ViewTitle from "./../view-title";

export default {
    components: {
        "data-table": dataTableComponent,
        "view-title": ViewTitle
    },
    props: ["categoryName", "data", "monthName", "onClose", "onEdit"],
    template: `
        <div class="expenses-category-month" v-else>
            <view-title :on-close="onClose">
                {{ categoryName }} / {{ monthName }}
            </view-title>
            <data-table
                class="columns-3"
                :on-cell-edited="onEdit"
                :data="data"
            />
        </div>
    `
};
