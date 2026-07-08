import { useState, type MutableRefObject } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useGeocode, type GeocodeResult } from '../../hooks/useGeocode';
import { POINT_FLY_ZOOM } from '../../types/api';
import type L from 'leaflet';

interface Props {
  mapRef: MutableRefObject<L.Map | null>;
  /** Called with the picked place so the page can drop the address probe pin/popup there. */
  onPickResult: (lat: number, lng: number, address: string) => void;
}

export function SearchBar({ mapRef, onPickResult }: Props) {
  const { results, loading, search } = useGeocode();
  const [open, setOpen] = useState(false);

  const handleSelect = (_: React.SyntheticEvent, value: GeocodeResult | string | null) => {
    if (!value || typeof value === 'string') return;
    mapRef.current?.flyTo([value.lat, value.lon], POINT_FLY_ZOOM, { duration: 1.25 });
    onPickResult(value.lat, value.lon, value.label);
  };

  return (
    <Autocomplete
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      filterOptions={(x) => x}
      options={results}
      getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
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
