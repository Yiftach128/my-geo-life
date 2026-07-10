import { Polygon, Tooltip } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { useLabelsVisible } from '../../hooks/useLabelsVisible';
import { ObjectHoverPopup } from './ObjectHoverPopup';
import { toPathOptions } from '../../types/api';
import type { PolygonDto, SelectedItem } from '../../types/api';

interface Props {
  polygons: PolygonDto[];
  onSelect: (item: SelectedItem) => void;
  onContextMenu: (item: SelectedItem, e: LeafletMouseEvent) => void;
}

export function PolygonLayer({ polygons, onSelect, onContextMenu }: Props) {
  const showLabels = useLabelsVisible();
  return (
    <>
      {polygons.map((polygon) => (
        <Polygon
          key={polygon.id}
          positions={polygon.points.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={toPathOptions(polygon.style)}
          bubblingMouseEvents={false}
          eventHandlers={{
            click: () => onSelect({ type: 'polygon', item: polygon }),
            contextmenu: (e) => onContextMenu({ type: 'polygon', item: polygon }, e),
            mouseover: (e) => e.target.openPopup(e.latlng),
            mouseout: (e) => e.target.closePopup(),
          }}
        >
          {showLabels && (
            <Tooltip permanent direction="center" className="map-label">
              {polygon.name}
            </Tooltip>
          )}
          <ObjectHoverPopup
            name={polygon.name}
            addressLabel={polygon.addressLabel}
            description={polygon.description}
          />
        </Polygon>
      ))}
    </>
  );
}
