const _ = require("lodash");
const common = require("./webpack.common.js");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(
    common,
    {
        devtool: "source-map",
        mode: "production",
        module: {
            rules: [
                {
                    test: /\.sass$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "sass-loader"
                    ]
                }
            ]
        },
        plugins: [].concat(
            common.plugins,
            new MiniCssExtractPlugin({
                filename: "[name].[hash].css",
                chunkFilename: "[id].[hash].css"
            })
        )
    }
)