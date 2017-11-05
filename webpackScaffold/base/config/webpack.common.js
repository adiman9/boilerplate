const commonPaths = require("./paths");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const config = {
  entry: commonPaths.appEntry,
  output: {
    filename: "bundle.js",
    path: commonPaths.outputPath
  },
  resolve: {
    extensions: [".js"]
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        test: /\.(jpe?g|png|gif)/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 12000
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".js"]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin()
  ]
};

module.exports = config;
