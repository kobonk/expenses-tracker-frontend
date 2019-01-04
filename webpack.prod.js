const _ = require("lodash");
const common = require("./webpack.common.js");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

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
        optimization: {
            runtimeChunk: "single",
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendors",
                        chunks: "all"
                    }
                }
            }
        },
        output: _.assign(
            {},
            common.output,
            {
                filename: "[name].[contenthash].bundle.js",
                chunkFilename: "[name].[contenthash].bundle.js"
            }
        ),
        plugins: [].concat(
            common.plugins,
            new MiniCssExtractPlugin({
                filename: "[name].[contenthash].css",
                chunkFilename: "[id].[contenthash].css"
            }),
            new webpack.HashedModuleIdsPlugin()
        )
    }
)