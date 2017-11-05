module.exports = {
  entry: [
    'react-hot-loader/patch',
    commonPaths.appEntry
  ],
  plugins: [
    new HtmlWebpackPlugin({
      template: commonPaths.appEntry + '/index.html'
    })
  ]
}
