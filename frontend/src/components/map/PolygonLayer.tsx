import { Polygon, Tooltip } from 'react-leaflet';
import { useLabelsVisible } from '../../hooks/useLabelsVisible';
import { toPathOptions } from '../../types/api';
import type { PolygonDto, SelectedItem } from '../../types/api';

interface Props {
  polygons: PolygonDto[];
  onSelect: (item: SelectedItem) => void;
}

export function PolygonLayer({ polygons, onSelect }: Props) {
  const showLabels = useLabelsVisible();
  return (
    <>
      {polygons.map((polygon) => (
        <Polygon
          key={polygon.id}
          positions={polygon.points.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={toPathOptions(polygon.style)}
          eventHandlers={{ click: () => onSelect({ type: 'polygon', item: polygon }) }}
        >
          {showLabels && (
            <Tooltip permanent direction="center" className="map-label">
              {polygon.name}
            </Tooltip>
          )}
        </Polygon>
      ))}
    </>
  );
}
