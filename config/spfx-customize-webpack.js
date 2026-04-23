'use strict';

// Fix: SPFx 1.22 outputs AMD define with UUID name (e.g. "35b7ef10-..._0.0.1")
// but the hosted workbench's loader still calls require(entryModuleId) = require('hello-world-web-part').
// In dev mode only, rename the AMD library to the bundle name so the workbench can load it.
// Production build keeps the UUID name untouched.
module.exports = function (webpackConfiguration) {
  if (webpackConfiguration.mode !== 'production' && webpackConfiguration.entry) {
    for (const [bundleName, entryConfig] of Object.entries(webpackConfiguration.entry)) {
      if (entryConfig && entryConfig.library) {
        entryConfig.library.name = bundleName;
      }
    }
  }
};
