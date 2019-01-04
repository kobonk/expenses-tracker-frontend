const _ = require("lodash");
const common = require("./webpack.common.js");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(
    common,
    {
        devtool: "inline-source-map",
        devServer: {
            contentBase: "./dist"
        },
        mode: "development",
        module: {
            rules: [
                {
                    test: /\.sass$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        "sass-loader"
                    ]
                }
            ]
        },
        plugins: _.concat(
            common.plugins,
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            })
        )
    }
)