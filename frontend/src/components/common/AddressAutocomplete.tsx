import { useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useGeocode } from '../../hooks/useGeocode';
import type { Address } from '../../types/api';

interface Props {
  value: Address | null;
  onChange: (address: Address | null) => void;
  label?: string;
}

/**
 * Address field over the same Nominatim search the map SearchBar uses. Uses `freeSolo`
 * (like SearchBar) so no dropdown chevron shows, but still only emits an `Address` when a
 * real suggestion is picked — free text is ignored on select.
 * Emits `{ label, lat, lon }` on select, or `null` when cleared.
 */
export function AddressAutocomplete({ value, onChange, label = 'Address (optional)' }: Props) {
  const { results, loading, search } = useGeocode();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value?.label ?? '');

  return (
    <Autocomplete
      freeSolo
      fullWidth
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      filterOptions={(x) => x}
      options={results}
      inputValue={inputValue}
      getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
      onInputChange={(_, val, reason) => {
        if (reason === 'input') {
          setInputValue(val);
          setOpen(true);
          search(val);
        } else if (reason === 'clear') {
          setInputValue('');
        }
      }}
      onChange={(_, selected) => {
        if (typeof selected === 'string') return; // Enter on unmatched free text → don't save
        if (selected) {
          onChange({
            label: selected.label,
            lat: selected.lat,
            lon: selected.lon,
          });
          setInputValue(selected.label);
        } else {
          onChange(null);
          setInputValue('');
        }
      }}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={16} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
