
module.exports = {
  module: {
    rules: [
      {
        test: /opencascade\.wasm\.wasm$/,
        type: "javascript/auto",
        loader: "file-loader"
      }
    ]
  },
  node: {
    fs: "empty"
  }
};

