const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    entry: {
        app: "./src/index.ts"
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        "scss": "vue-style-loader!css-loader!sass-loader",
                        "sass": "vue-style-loader!css-loader!sass-loader?indentedSyntax"
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(["dist"]),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            title: "Expenses Tracker"
        })
    ],
    resolve: {
        alias: {
            "config.json": path.resolve(__dirname, "config.json"),
            types: path.resolve(__dirname, "src/types"),
            utils: path.resolve(__dirname, "src/utils"),
            vue: "vue/dist/vue.esm.js"
        },
        extensions: [".tsx", ".ts", ".js", ".json", ".vue"]
    },
    output: {
        filename: "[name].bundle.js",
        chunkFilename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/"
    }
};
