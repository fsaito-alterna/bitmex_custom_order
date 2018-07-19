module.exports = (ctx) => {
  return {
    plugins: [
      require('postcss-import')({addDependencyTo: ctx.webpack}),
      require('stylelint')({}),
      require('postcss-url')(),
      require('postcss-cssnext')(),
      require('postcss-browser-reporter')(),
      require('postcss-reporter')(),
    ],
  };
};
