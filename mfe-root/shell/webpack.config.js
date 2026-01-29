require("dotenv").config();

const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

if (!process.env.REACT_APP_AUTH_REMOTE) {
  throw new Error("REACT_APP_AUTH_REMOTE is missing");
}
if (!process.env.REACT_APP_PRODUCTS_REMOTE) {
  throw new Error("REACT_APP_PRODUCTS_REMOTE is missing");
}

module.exports = {
  entry: "./src/index.ts",
  output: {
    publicPath: "auto",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    liveReload: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new Dotenv({
      systemvars: true,
    }),

    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        auth: `auth@${process.env.REACT_APP_AUTH_REMOTE}`,
        products: `products@${process.env.REACT_APP_PRODUCTS_REMOTE}`,
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),

    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
