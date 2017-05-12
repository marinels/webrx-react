const config = require('stylelint-config-suitcss');

config.rules = Object.assign(config.rules, {
  // standardize on single quotes
  'string-quotes': [ 'single' ],

  // Limit the length of a line to 120 chars
  'max-line-length': [ 120 ],

  // Limit the specificity of selectors.
  'selector-max-specificity': [ '0,6,0' ],

  // force quotes around font names
  'font-family-name-quotes': [ 'always-unless-keyword' ],

  // we want cleaner code appearance, so empty lines between nested styles are required
  'rule-empty-line-before': [ 'always-multi-line', { 'except': [ 'first-nested' ], 'ignore': [ 'after-comment' ] } ],
});

module.exports = config;
