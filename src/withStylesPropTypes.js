import PropTypes from 'prop-types';

export const withStylesPropTypes = {
  styles: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  css: PropTypes.func.isRequired,
};

export default withStylesPropTypes;
