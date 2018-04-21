const webpack = require('webpack');

const config = {
  devtool: "eval-source-map", // webpack.js.org/configuration/devtool
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          "style-loader",
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      process: {
        env: {
          NODE_ENV: JSON.stringify('development'),
        }
      },
      PRODUCTION: JSON.stringify(false),
    }),
  ]
};

module.exports = config;
