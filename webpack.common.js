const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const lodash = require("lodash");
const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        app: "./src/index.js"
    },
    plugins: [
        new CleanWebpackPlugin(["dist"]),
        new HtmlWebpackPlugin({
            title: "Production"
        }),
        new webpack.ProvidePlugin({
            join: ["lodash", "join"]
        })
    ],
    output: {
        filename: "[name].bundle.js",
        chunkFilename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist")
    }
};