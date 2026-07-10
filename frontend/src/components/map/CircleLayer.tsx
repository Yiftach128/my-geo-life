import { Circle, Tooltip } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { useLabelsVisible } from '../../hooks/useLabelsVisible';
import { ObjectHoverPopup } from './ObjectHoverPopup';
import { toPathOptions } from '../../types/api';
import type { CircleDto, SelectedItem } from '../../types/api';

interface Props {
  circles: CircleDto[];
  onSelect: (item: SelectedItem) => void;
  onContextMenu: (item: SelectedItem, e: LeafletMouseEvent) => void;
}

export function CircleLayer({ circles, onSelect, onContextMenu }: Props) {
  const showLabels = useLabelsVisible();
  return (
    <>
      {circles.map((circle) => (
        <Circle
          key={circle.id}
          center={[circle.center.lat, circle.center.lng]}
          radius={circle.radius}
          pathOptions={toPathOptions(circle.style)}
          bubblingMouseEvents={false}
          eventHandlers={{
            click: () => onSelect({ type: 'circle', item: circle }),
            contextmenu: (e) => onContextMenu({ type: 'circle', item: circle }, e),
            mouseover: (e) => e.target.openPopup(e.latlng),
            mouseout: (e) => e.target.closePopup(),
          }}
        >
          {showLabels && (
            <Tooltip permanent direction="center" className="map-label">
              {circle.name}
            </Tooltip>
          )}
          <ObjectHoverPopup
            name={circle.name}
            addressLabel={circle.addressLabel}
            description={circle.description}
          />
        </Circle>
      ))}
    </>
  );
}
