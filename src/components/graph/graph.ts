import "./styles.sass"

const c3 = require("c3");
const _ = require("lodash");
const moment = require("moment");

export default {
    computed: {
        days(): Array<string> {
            let firstDay = moment(`${ this.month }-01`);
            let daysInMonth = firstDay.daysInMonth();

            return _.map(Array.from(Array(daysInMonth).keys()), (day: number) => {
                return firstDay.clone().add(day, "d").format("DD");
            });
        }
    },
    data() {
        return {
            chart: null as any
        }
    },
    mounted() {
        this.chart = c3.generate({
            axis: {
                x: {
                    tick: {
                        values: this.days
                    }
                }
            },
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            bindto: this.$el,
            data: {
                columns: [
                    ["days"].concat(this.days),
                    ["values"].concat(this.xValues)
                ],
                type: "bar",
                x: "days"
            },
            grid: {
                y: {
                    show: true
                }
            },
            legend: {
                show: false
            }
        });
    },
    props: {
        month: {
            type: String,
            default: moment().format("YYYY-MM")
        },
        xValues: {
            default: []
        }
    },
    template: `<div class="graph" style="height: 300px"></div>`
};
