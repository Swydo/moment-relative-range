module.exports = function run(wallaby) {
  return {
    files: [
      'src/**/*.js',
      { pattern: 'README.md', instrument: false },
      { pattern: 'package.json', instrument: false },
    ],

    tests: [
      'tests/**/*.spec.js',
    ],

    compilers: {
      '**/*.js': wallaby.compilers.babel(),
    },

    env: {
      type: 'node',
    },
  };
};
