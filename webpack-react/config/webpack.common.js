const commonPaths = require("./paths");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const config = {
  entry: [
    'react-hot-loader/patch',
    commonPaths.appEntry,
  ],
  output: {
    filename: "bundle.js",
    path: commonPaths.outputPath
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
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: true
    })
  ]
};

module.exports = config;
