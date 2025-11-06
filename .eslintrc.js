module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:prettier/recommended', // Adds Prettier rules
  ],
  rules: {
    'prettier/prettier': 'error', // Show Prettier errors as ESLint errors
  },
};
