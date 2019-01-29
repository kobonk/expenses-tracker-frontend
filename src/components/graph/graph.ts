import "./styles.sass"

const c3 = require("c3");
const _ = require("lodash");

type GraphData = {
    xTicks: Array<String>,
    xTitles: Array<String>,
    xValues: Array<GraphInput>
};

type GraphInput = {
    name: String,
    values: Array<Number>
}

const component = {
    computed: {
        values() {
            return _.map(this.data.xValues, (xValue: any) => _.concat([xValue.name], xValue.values));
        }
    },
    data(): any {
        return {
            chart: c3.chart
        };
    },
    methods: {
        createData(): any {
            return {
                columns: [
                    ["xTicks"].concat(this.data.xTicks),
                ].concat(this.values),
                groups: [
                    _.map(this.data.xValues, _.property("name"))
                ],
                type: "bar",
                x: "xTicks"
            }
        }
    },
    mounted() {
        this.chart = c3.generate({
            axis: {
                x: {
                    tick: {
                        values: this.data.xTicks
                    }
                }
            },
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            bindto: this.$el,
            data: this.createData(),
            grid: {
                y: {
                    show: true
                }
            },
            legend: {
                show: false
            },
            tooltip: {
                format: {
                    title: (xTick: string, index: Number) => this.data.xTitles[index as number],
                    value: (value: number) => value.toFixed(2)
                },
                grouped: false,
                show: true
            }
        });
    },
    props: {
        data: {
            default: {
                xTicks: [],
                xTitles: [],
                xValues: []
            } as GraphData
        }
    },
    template: `<div class="graph" style="height: 300px"></div>`,
    watch: {
        data() {
            this.chart.unload();
            this.chart.load(this.createData());
        }
    }
};

export { component, GraphData, GraphInput };
