import path from "path";

import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

const config: webpack.Configuration = {
    entry: ["./frontend/index.tsx"],
    output: {
        path: path.resolve("dist"),
    },
    devtool: "cheap-module-source-map",
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
            },
            {
                test: /\.jsx?$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve("frontend", "index.html"),
        }),
    ],
};

export default config;
