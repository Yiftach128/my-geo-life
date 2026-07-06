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
 * Address field that forces a real, geocoded pick — the same Nominatim search the
 * map SearchBar uses, but without `freeSolo`, so only a selected suggestion counts.
 * Emits `{ label, lat, lon }` on select, or `null` when cleared.
 */
export function AddressAutocomplete({ value, onChange, label = 'Address (optional)' }: Props) {
  const { results, loading, search } = useGeocode();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value?.label ?? '');

  return (
    <Autocomplete
      fullWidth
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      filterOptions={(x) => x}
      options={results}
      inputValue={inputValue}
      getOptionLabel={(opt) => opt.display_name}
      isOptionEqualToValue={(opt, val) => opt.place_id === val.place_id}
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
        if (selected) {
          onChange({
            label: selected.display_name,
            lat: parseFloat(selected.lat),
            lon: parseFloat(selected.lon),
          });
          setInputValue(selected.display_name);
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
