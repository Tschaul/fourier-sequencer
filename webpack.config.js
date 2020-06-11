var path = require('path');
module.exports = {
  entry: [
    './src/index.js'
  ],
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path:     path.resolve(__dirname, 'dist/js')
  },
  devtool: 'source-map',
  resolve: {
    extensions: [
      '.js'
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
};