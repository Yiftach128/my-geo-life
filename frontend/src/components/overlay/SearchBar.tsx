import { useState, type MutableRefObject } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useGeocode, type NominatimResult } from '../../hooks/useGeocode';
import { POINT_FLY_ZOOM } from '../../types/api';
import type L from 'leaflet';

interface Props {
  mapRef: MutableRefObject<L.Map | null>;
}

export function SearchBar({ mapRef }: Props) {
  const { results, loading, search } = useGeocode();
  const [open, setOpen] = useState(false);

  const handleSelect = (_: React.SyntheticEvent, value: NominatimResult | string | null) => {
    if (!value || typeof value === 'string') return;
    mapRef.current?.flyTo([parseFloat(value.lat), parseFloat(value.lon)], POINT_FLY_ZOOM, {
      duration: 1.25,
    });
  };

  return (
    <Autocomplete
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      filterOptions={(x) => x}
      options={results}
      getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.display_name)}
      onInputChange={(_, value, reason) => {
        if (reason !== 'input') return; // ignore 'reset' (fired on selection) / 'clear'
        setOpen(true);
        search(value);
      }}
      onChange={handleSelect}
      loading={loading}
      sx={{ width: 450 }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search address..."
          size="small"
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
