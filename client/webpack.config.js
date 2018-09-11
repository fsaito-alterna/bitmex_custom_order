const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const isDevelopment = (process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'development')
  
module.exports = {
  devtool: isDevelopment ? 'cheap-eval-source-map' : undefined,
  // debug: isDevelopment,
  entry: {
    app: [
      './js/block/client.js',
    ],
    vendor: [
      'bluebird',
      'encoding-japanese',
      'i18next',
      'lodash',
      'moment',
      'papaparse',
      'react',
      'react-bootstrap',
      'react-dom',
      'react-dropzone',
      'react-notification-system',
      'react-redux',
      'react-router',
      'react-select',
      'reduce-reducers',
      'redux',
      'redux-thunk',
      'superagent',
      'superagent-bluebird-promise',
    ],
  },
  output: {
    path: `${__dirname}/public`,
    filename: 'client.js',
    publicPath: '/',
  },
  externals: {
    jquery: 'jQuery',
  },
  resolve: {
    modules: ['node_modules', `${__dirname}/js`],
  },
  plugins: (() => {
    const plugins = []
    if (process.env.NODE_ENV === 'production') {
      plugins.push(new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
      }))
      plugins.push(new UglifyJSPlugin())
    }
    plugins.push(new webpack.HotModuleReplacementPlugin())
    plugins.push(new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.js'}))
    plugins.push(new ExtractTextPlugin('client.css'))
    plugins.push(new webpack.DefinePlugin({
      USE_FREEZED_STORE: isDevelopment,
    }))
    return plugins
  })(),
  module: {
    noParse: /object-hash\/dist\/object_hash.js/,
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {loader: 'css-loader', options: {importLoaders: 1}},
          'postcss-loader',
        ],
      },
      {
        test: /\.json$/,
        use: ['json-loader'],
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
    ],
    loaders: [
      {test: /\.png$/, loader: 'file-loader'},
      {test: /\.jpg$/, loader: 'file-loader'},
    ],
  },
  devServer: {
    port: 10011,
    inline: true,
    host: '0.0.0.0',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    },
    contentBase: 'public',
  },
  devtool: 'cheap-module-eval-source-map'
}
