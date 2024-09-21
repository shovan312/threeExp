const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/client/client.ts', // Your entry file
  output: {
    filename: 'bundle.[contenthash].js', // Output bundle file with hash
    path: path.resolve(__dirname, 'dist'), // Output directory
    clean: true, // Clean the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile JavaScript files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './dist/client/index.html', // HTML template file
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all', // Split vendor and application code
    },
  },
  devtool: 'source-map', // Generate source maps for easier debugging
};