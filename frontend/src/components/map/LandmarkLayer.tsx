import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { useLabelsVisible } from '../../hooks/useLabelsVisible';
import type { LandmarkDto, SelectedItem } from '../../types/api';

interface Props {
  landmarks: LandmarkDto[];
  onSelect: (item: SelectedItem) => void;
}

function makeColorIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export function LandmarkLayer({ landmarks, onSelect }: Props) {
  const showLabels = useLabelsVisible();
  return (
    <>
      {landmarks.map((landmark) => (
        <Marker
          key={landmark.id}
          position={[landmark.position.lat, landmark.position.lng]}
          icon={makeColorIcon(landmark.color)}
          eventHandlers={{ click: () => onSelect({ type: 'landmark', item: landmark }) }}
        >
          {showLabels && (
            <Tooltip permanent direction="top" offset={[0, -10]} className="map-label">
              {landmark.name}
            </Tooltip>
          )}
        </Marker>
      ))}
    </>
  );
}
