const TerserPlugin = require("terser-webpack-plugin");



let obj = {
  pages: {
    popup_main: {
      template: "public/browser-extension.html",
      entry: "./src/popup/main.js",
      title: "Popup",
      chunks: ["index"],
    },
    index: {
      template: "public/index.html",
      entry: "./src/main.js",
      title: "GoKidsApp - a simple app for kids",
    },
  },
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      config.output
        .filename("js/[name].js?_hash=[contenthash:8]")
        .chunkFilename("js/[name].js?_hash=[contenthash:8]");

      config.plugin("extract-css").tap((args) => {
        args[0].filename = "css/[name].css?_hash=[contenthash:8]";
        args[0].chunkFilename = "css/[name].css?_hash=[contenthash:8]";
        return args;
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("disable pwa");
      config.plugins.delete("pwa");
      config.plugins.delete("workbox");
    }
  },

  pluginOptions: {
    browserExtension: {
      extensionReloaderOptions: {
        port: 9000 + parseInt(Math.random() * 1000), //cat ./node_modules/webpack-extension-reloader/README.md
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
    port: 8085,
    proxy: {
      "/tran": {
        target: "http://localhost:8084",
        changeOrigin: true,
        pathRewrite: {
          "^/tran": "/tran",
        },
      },
    },
  },
  configureWebpack: {
    plugins: [
      // new TimestampPlugin(), // 自定义的webpack插件*
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
  pwa: {
    manifestOptions: {
      name: process.env.VUE_APP_APP_NAME,
      short_name: process.env.VUE_APP_SHORT_NAME,
      start_url: process.env.VUE_APP_START_URL,
      display: "standalone",
      icons: [
        {
          src: "assets/icons/icon-48x48.png",
          sizes: "48x48",
          type: "image/png",
          purpose: "maskable any",
        },
        {
          src: "assets/icons/icon-72x72.png",
          sizes: "72x72",
          type: "image/png",
          purpose: "maskable any",
        },
        {
          src: "assets/icons/icon-96x96.png",
          sizes: "96x96",
          type: "image/png",
          purpose: "maskable any",
        },
        {
          src: "assets/icons/icon-128x128.png",
          sizes: "128x128",
          type: "image/png",
          purpose: "maskable any",
        },
        {
          src: "assets/icons/icon-144x144.png",
          sizes: "144x144",
          type: "image/png",
          purpose: "maskable any",
        },
        {
          src: "assets/icons/icon-152x152.png",
          sizes: "152x152",
          type: "image/png",
          purpose: "maskable any",
        },
        {
          src: "assets/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable any",
        },
        {
          src: "assets/icons/icon-384x384.png",
          sizes: "384x384",
          type: "image/png",
          purpose: "maskable any",
        },
        {
          src: "assets/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable any",
        },
      ],
    },
    workboxPluginMode: "GenerateSW",
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      include: [/.*index.html.*$/, /\/js\/*.js/],
      // exclude: [/games/, /_locales/],
      precacheManifestFilename: "precache-manifest.js?_v=[manifestHash]",
      //dontCacheBustURLsMatching: 1,
      navigateFallback: "index.html",
      navigateFallbackWhitelist: [/^\/$/],
      // importWorkboxFrom: "local",
      // exclude: [/\.(?:png|jpg|jpeg|svg)$/], //在预缓存中排除图片
      importScripts: ["wb-debug.js"],
      runtimeCaching: [
        {
          urlPattern: /.*?.html/,
          handler: "networkFirst",
          method: "GET",
          options: {
            //networkTimeoutSeconds: 20,
            cacheName: "index",
            cacheableResponse: { statuses: [200] },
            networkTimeoutSeconds: 5,
          },
        },

        {
          urlPattern: /.*?baidu.*/,
          handler: "cacheFirst",
          method: "GET",
          options: {
            //networkTimeoutSeconds: 20,
            cacheName: "cache",
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /.*?cache=0/,
          handler: "cacheFirst",
          method: "GET",
          options: {
            //networkTimeoutSeconds: 20,
            cacheName: "acache",
            cacheableResponse: { statuses: [0, 200] },
          },
        },

        {
          urlPattern: /games.*/,
          handler: "cacheFirst",
          method: "GET",
          options: {
            //networkTimeoutSeconds: 20,
            cacheName: "cache",
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /https:\/\/[^/]+\/?/,
          handler: "networkFirst",
          method: "GET",
          options: {
            //networkTimeoutSeconds: 20,
            cacheName: "index",
            cacheableResponse: { statuses: [200] },
            networkTimeoutSeconds: 5,
          },
        },
        {
          urlPattern: /.*?(js|css).*/,
          handler: "networkFirst",
          method: "GET",
          options: {
            networkTimeoutSeconds: 5,
            cacheName: "cssjs",
            cacheableResponse: { statuses: [200] },
          },
        },
        {
          urlPattern: /.*?workbox.*?\.js$/,
          handler: "cacheFirst",
          method: "GET",
          options: {
            //networkTimeoutSeconds: 20,
            cacheName: "cache",
            cacheableResponse: { statuses: [200] },
          },
        },
      ],
    },
  },
};

/**
 * 
 * pwa: {
    name: 'easy-front-vue-cli3',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    // configure the workbox plugin (GenerateSW or InjectManifest)
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: 'src/service-worker.js',
      importWorkboxFrom: 'disabled',
      importScripts: 'https://cdn.your.info/workbox-v4.3.1/workbox-sw.js'
      // ...other Workbox options...
    }
  }
npm install -g browser-sync
browser-sync dist
 */

module.exports = obj;
