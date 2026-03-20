const path = require("path");
const { getDefaultConfig } = require("@react-native/metro-config");
const { fileURLToPath } = require("url");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

module.exports = (async () => {
  const config = await getDefaultConfig(projectRoot);

  return {
    ...config,
    watchFolders: [workspaceRoot],
    resolver: {
      ...config.resolver,
      nodeModulesPaths: [
        path.resolve(projectRoot, "node_modules"),
        path.resolve(workspaceRoot, "node_modules"),
      ],
    },
  };
})();
