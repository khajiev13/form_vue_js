module.exports = {
    configureWebpack: {
      resolve: {
        fallback: {
          "timers": require.resolve("timers-browserify"),
          "util": require.resolve("util/"),
        }
      }
    }
    
  };
  