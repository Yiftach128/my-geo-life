import { Circle, Tooltip } from 'react-leaflet';
import { useLabelsVisible } from '../../hooks/useLabelsVisible';
import { toPathOptions } from '../../types/api';
import type { CircleDto, SelectedItem } from '../../types/api';

interface Props {
  circles: CircleDto[];
  onSelect: (item: SelectedItem) => void;
}

export function CircleLayer({ circles, onSelect }: Props) {
  const showLabels = useLabelsVisible();
  return (
    <>
      {circles.map((circle) => (
        <Circle
          key={circle.id}
          center={[circle.center.lat, circle.center.lng]}
          radius={circle.radius}
          pathOptions={toPathOptions(circle.style)}
          eventHandlers={{ click: () => onSelect({ type: 'circle', item: circle }) }}
        >
          {showLabels && (
            <Tooltip permanent direction="center" className="map-label">
              {circle.name}
            </Tooltip>
          )}
        </Circle>
      ))}
    </>
  );
}
