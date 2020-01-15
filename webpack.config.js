var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var path = require('path');
var env = require('yargs').argv.mode;

var pkg = require("./package.json");

var plugins = [];
var outputFile;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  outputFile = pkg.name + '.min.js';
} else {
  outputFile = pkg.name + '.js';
}

var config = {
  entry: path.join(__dirname, '/src/index.js'),
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: outputFile,
    library: pkg.name,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js']
  },
  plugins: plugins
};

module.exports = config;
