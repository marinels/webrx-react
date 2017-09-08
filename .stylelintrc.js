module.exports = {
  'extends': 'stylelint-config-standard',
  'plugins': [
    'stylelint-order',
  ],
  'rules': {
    // we want cleaner code appearance, so empty lines between nested styles are required
    'at-rule-empty-line-before': [ 'always', { 'except': [ 'first-nested' ], 'ignore': [ 'after-comment' ] } ],

    // do not permit vendor prefix rules
    'at-rule-no-vendor-prefix': true,

    // force quotes around font names
    'font-family-name-quotes': [ 'always-unless-keyword' ],

    // vlaues using a url function must be quoted. i.e., background: url('bg.png');
    'function-url-quotes': 'always',

    // Limit the length of a line to 120 chars
    'max-line-length': [ 120, { ignore: 'non-comments' } ],

    // do not permit vendor prefix rules
    'media-feature-name-no-vendor-prefix': true,

    // do not permit units applied to zero values
    'length-zero-no-unit': true,

    // ensure all properties are in alphabetical order
    'order/properties-alphabetical-order': true,

    // do not permit vendor prefix rules
    'property-no-vendor-prefix': true,

    // similar to the above at-rule-empty-line-before rule
    'rule-empty-line-before': [ 'always-multi-line', { 'except': [ 'first-nested' ], 'ignore': [ 'after-comment' ] } ],

    // Limit the specificity of selectors (6 layers of nesting max).
    'selector-max-specificity': [ '0,6,0' ],

    // do not permit vendor prefix rules
    'selector-no-vendor-prefix': true,

    // standardize on single quotes
    'string-quotes': [ 'single' ],

    // do not permit vendor prefix rules
    'value-no-vendor-prefix': true,
  }
}
