const TerserPlugin = require("terser-webpack-plugin");

class TimestampPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap("TimestampPlugin", (compilation) => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
        "TimestampPlugin",
        (data, cb) => {
          let timestamp = new Date().getTime();
          data.head = data.head.map((item) => {
            if (item.tagName === "link") {
              item.attributes.href = item.attributes.href.replace(
                item.attributes.href,
                `${item.attributes.href}?${timestamp}`
              );
            }
            return item;
          });

          data.body = data.body.map((item) => {
            if (item.tagName === "script") {
              item.attributes.src = item.attributes.src.replace(
                item.attributes.src,
                `${item.attributes.src}?${timestamp}`
              );
            }
            return item;
          });
          cb(null, data);
        }
      );
    });
  }
}

module.exports = {
  pages: {
    popup_main: {
      template: "public/browser-extension.html",
      entry: "./src/popup/main.js",
      title: "Popup",
    },
    index: {
      template: "public/index.html",
      entry: "./src/main.js",
      title: "gokidsapp",
    },
  },
  pluginOptions: {
    browserExtension: {
      extensionReloaderOptions: {
        port: 9094, //cat ./node_modules/webpack-extension-reloader/README.md
      },
      componentOptions: {
        background: {
          entry: "src/background.js",
        },
        contentScripts: {
          entries: {
            "content-script": ["src/content-scripts/content-script.js"],
          },
        },
      },
    },
  },
  publicPath: "",
  productionSourceMap: false,
  filenameHashing: false,
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: true,
    // 开启 CSS source maps?
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {},
    // 启用 CSS modules for all css / pre-processor files.
    modules: false,
  },
  devServer: {
    port: 8084,
    proxy: {
      "/t": {
        target: "http://localhost:8081",
        changeOrigin: true,
        pathRewrite: {
          "^/t": "/t",
        },
      },
    },
  },
  configureWebpack: {
    plugins: [
      new TimestampPlugin(), // 自定义的webpack插件*
    ],
    optimization: {
      minimize: process.env.NODE_ENV === "production",
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ["console.log"],
            },
            extractComments: false,
          },
        }),
      ],
    },
  },
};
