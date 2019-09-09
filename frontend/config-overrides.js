const { injectBabelPlugin } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');
const rewireSvgReactLoader = require('react-app-rewire-svg-react-loader');
// const AntDesignThemePlugin = require('antd-theme-webpack-plugin');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const cssVariables = require('./src/utils/cssVariables.js');

const path = require('path');
const ruleChildren = loader =>
  loader.use ||
  loader.oneOf ||
  (Array.isArray(loader.loader) && loader.loader) ||
  [];

const findIndexAndRules = (rulesSource, ruleMatcher) => {
  let result = undefined;
  const rules = Array.isArray(rulesSource)
    ? rulesSource
    : ruleChildren(rulesSource);
  rules.some(
    (rule, index) =>
      (result = ruleMatcher(rule)
        ? { index, rules }
        : findIndexAndRules(ruleChildren(rule), ruleMatcher)),
  );
  return result;
};

const createLoaderMatcher = loader => rule =>
  rule.loader && rule.loader.indexOf(`${path.sep}${loader}${path.sep}`) !== -1;
const fileLoaderMatcher = createLoaderMatcher('file-loader');

const addBeforeRule = (rulesSource, ruleMatcher, value) => {
  const { index, rules } = findIndexAndRules(rulesSource, ruleMatcher);
  rules.splice(index, 0, value);
};

module.exports = function override(config, env) {
  // config = rewireLess(config, env);

  config = injectBabelPlugin(
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }], // change importing css to less
    config,
  );
  config = rewireLess.withLoaderOptions({
    modifyVars: cssVariables,
    javascriptEnabled: true,
  })(config, env);

  config = rewireSvgReactLoader(config, env);

  addBeforeRule(config.module.rules, fileLoaderMatcher, {
    test: /\.hbs$/,
    loader: 'handlebars-template-loader',
  });

  // config.plugins.push(new AntDesignThemePlugin(options));
  // Silence mini-css-extract-plugin generating lots of warnings for CSS ordering.
  // We use CSS modules that should not care for the order of CSS imports, so we
  // should be safe to ignore these.
  //
  // See: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250
  config.plugins.push(
    new FilterWarningsPlugin({
      exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
    }),
  );

  return config;
};
