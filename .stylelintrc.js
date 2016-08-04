const config = require('stylelint-config-strict');

config.rules = Object.assign(config.rules, {
  // we allow pascal case names for the primary fragment
  'selector-class-pattern': '^([a-zA-Z](-[a-z])?)+(__([a-z](-[a-z])?)+)?(--([a-z](-[a-z])?)+)?$',

  // we want cleaner code appearance, so empty lines between nested styles are required
  'rule-nested-empty-line-before': [ 'always', { 'except': [ 'first-nested' ], 'ignore': [ 'after-comment' ] } ],

  // certain bootstrap styles must use type selectors
  'selector-no-type': [ true, { 'ignore': [ 'descendant', 'compounded' ] } ],

  // bumping the max nesting depth and specificity up to 6
  'max-nesting-depth': 6,
  'selector-max-specificity': '0,6,0',

  // fixing deprecated and renamed style rules in stylelint-config-strict
  'font-family-name-quotes': 'always-unless-keyword',
  'function-url-quotes': 'always',
  'length-zero-no-unit': true,
  'media-query-parentheses-space-inside': config.rules['media-query-parentheses-space-inside'],
  // 'no-missing-end-of-source-newline': config.rules['no-missing-eof-newline'],
});

// deleting no longer existing rules
delete config.rules['number-zero-length-no-unit'];
delete config.rules['media-query-parentheses-space-inside'];
delete config.rules['no-missing-eof-newline'];

module.exports = config;
