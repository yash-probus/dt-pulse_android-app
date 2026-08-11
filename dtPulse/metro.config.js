const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const root = path.resolve(__dirname, '..');
const defaultConfig = getDefaultConfig(__dirname);
const {
  resolver: {assetExts, sourceExts},
} = defaultConfig;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    path.resolve(root, 'lib'),
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(root, 'node_modules'),
    ],
    assetExts: [...assetExts, 'mp4', 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
