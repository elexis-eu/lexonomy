const { VueLoaderPlugin } = require("vue-loader");
const path = require("path");

module.exports = {
  entry: {
    editor: "./src/main.js",
  },
  output: {
    path: path.resolve(__dirname, "../js"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.(eot|ttf|woff|woff2)(\?\S*)?$/,
        loader: "file-loader",
        options: {
          name: "[name][contenthash:8].[ext]",
        },
      },
      {
        test: /\.(png|jpe?g|gif|webm|mp4|svg)$/,
        loader: "file-loader",
        options: {
          outputPath: "assets",
          esModule: false,
        },
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
  resolve: {
    alias: {
      vue$: "vue/dist/vue.runtime.esm.js",
    },
    extensions: ["*", ".js", ".vue", ".json"],
  },
};
