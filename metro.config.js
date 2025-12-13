const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (async () => {
  const config = getDefaultConfig(__dirname);

  const {
    resolver: { assetExts },
  } = config;

  return withNativeWind(
    {
      ...config,
      resolver: {
        ...config.resolver,
        assetExts: [...assetExts, "lottie"],
      },
    },
    { input: "./global.css" }
  );
})();
