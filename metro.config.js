const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Adiciona suporte para alias @ no Metro bundler
config.resolver.alias = {
  '@': path.resolve(__dirname, 'app'),
};

module.exports = config;