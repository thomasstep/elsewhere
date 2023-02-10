import React, { useEffect, useRef, useState } from 'react';

function AutocompleteField() {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [autoCompleteWidget, setAutoCompleteWidget] = useState();

  useEffect(() => {
    if (inputRef.current && !autoCompleteWidget) {
      // eslint-disable-next-line no-undef
      const autocompleteWidget = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment'],
        componentRestrictions: { country: ['US'] },
        fields: ['place_id'],
      });
      autocompleteRef.current = autocompleteWidget;
      setAutoCompleteWidget(autocompleteWidget);
    }
  }, [inputRef, autoCompleteWidget]);

  return (
    <input ref={inputRef} />
  );
}

export default AutocompleteField;
