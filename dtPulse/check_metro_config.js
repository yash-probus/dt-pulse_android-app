const {getDefaultConfig} = require('@react-native/metro-config');
const config = getDefaultConfig(__dirname);
console.log('assetExts:', config.resolver.assetExts);
console.log('sourceExts:', config.resolver.sourceExts);
