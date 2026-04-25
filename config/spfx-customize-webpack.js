'use strict';

module.exports = function (webpackConfiguration) {
  // Fix 5: webpack 5 emits arrow functions by default; sp-loader compat requires ES5
  if (!webpackConfiguration.output) webpackConfiguration.output = {};
  if (!webpackConfiguration.output.environment) webpackConfiguration.output.environment = {};
  webpackConfiguration.output.environment.arrowFunction = false;

  try {
    const webpack = require('webpack');
    webpackConfiguration.plugins = webpackConfiguration.plugins || [];
    webpackConfiguration.plugins.push(
      new webpack.BannerPlugin({
        banner: 'try{console.log("[wp:1]");}catch(e){}',
        raw: true,
        entryOnly: true,
      })
    );
  } catch (_e) { /* webpack not accessible */ }

  if (webpackConfiguration.mode === 'production') return;

  if (webpackConfiguration.devServer) {
    // Fix 2: PNA header so Chrome allows https://sharepoint → http(s)://localhost
    webpackConfiguration.devServer.headers = Object.assign(
      {},
      webpackConfiguration.devServer.headers,
      { 'Access-Control-Allow-Private-Network': 'true' }
    );

    // Fix 4: prevent WDS client injection into AMD bundle
    webpackConfiguration.devServer.hot = false;
    webpackConfiguration.devServer.client = false;
  }
};
