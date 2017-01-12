module.exports = function run(wallaby) {
  return {
    files: [
      'src/**/*.js',
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
