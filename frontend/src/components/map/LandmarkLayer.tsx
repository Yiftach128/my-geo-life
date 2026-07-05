import { Marker, Tooltip } from 'react-leaflet';
import { useLabelsVisible } from '../../hooks/useLabelsVisible';
import { landmarkDivIcon } from './landmarkIcons';
import type { LandmarkDto, SelectedItem } from '../../types/api';

interface Props {
  landmarks: LandmarkDto[];
  onSelect: (item: SelectedItem) => void;
}

export function LandmarkLayer({ landmarks, onSelect }: Props) {
  const showLabels = useLabelsVisible();
  return (
    <>
      {landmarks.map((landmark) => (
        <Marker
          key={landmark.id}
          position={[landmark.position.lat, landmark.position.lng]}
          icon={landmarkDivIcon(landmark.iconUrl, landmark.color)}
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
