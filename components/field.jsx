import React from 'react';
import PropTypes from 'prop-types';

export default function Field(props) {
  const {
    name,
    label,
    required,
    autoComplete,
    type,
  } = props;
  return (
    <div>
      <label
        id={[name, 'label'].join('-')}
        htmlFor={[name, 'input'].join('-')}
      >
        {label}
        {' '}
        {required ? <span title="Required">*</span> : undefined}
      </label>
      <br />
      <input
        autoComplete={autoComplete}
        id={[name, 'input'].join('-')}
        name={name}
        required={required}
        type={type}
      />
    </div>
  );
}

Field.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  autoComplete: PropTypes.string,
  type: PropTypes.string.isRequired,
};

Field.defaultProps = {
  autoComplete: false,
};
