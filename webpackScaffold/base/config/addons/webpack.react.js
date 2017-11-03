module.exports = {
  entry: [
    'react-hot-loader/patch',
    commonPaths.appEntry
  ],
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ]
}
