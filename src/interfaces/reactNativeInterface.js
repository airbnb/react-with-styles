import { StyleSheet } from 'react-native';

export default {
  create(styleHash) {
    return StyleSheet.create(styleHash);
  },

  // Styles is an array of properties returned by `create()`, a POJO, or an
  // array thereof. POJOs are treated as inline styles.
  // This function returns an object to be spread onto an element.
  resolve(styles) {
    return { style: styles };
  },
};
