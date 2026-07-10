import { Marker, Tooltip } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { useLabelsVisible } from '../../hooks/useLabelsVisible';
import { landmarkDivIcon } from './landmarkIcons';
import { ObjectHoverPopup } from './ObjectHoverPopup';
import type { LandmarkDto, SelectedItem } from '../../types/api';

interface Props {
  landmarks: LandmarkDto[];
  onSelect: (item: SelectedItem) => void;
  onContextMenu: (item: SelectedItem, e: LeafletMouseEvent) => void;
}

export function LandmarkLayer({ landmarks, onSelect, onContextMenu }: Props) {
  const showLabels = useLabelsVisible();
  return (
    <>
      {landmarks.map((landmark) => (
        <Marker
          key={landmark.id}
          position={[landmark.position.lat, landmark.position.lng]}
          icon={landmarkDivIcon(landmark.iconUrl, landmark.color)}
          eventHandlers={{
            click: () => onSelect({ type: 'landmark', item: landmark }),
            contextmenu: (e) => onContextMenu({ type: 'landmark', item: landmark }, e),
            mouseover: (e) => e.target.openPopup(),
            mouseout: (e) => e.target.closePopup(),
          }}
        >
          {showLabels && (
            <Tooltip permanent direction="top" offset={[0, -10]} className="map-label">
              {landmark.name}
            </Tooltip>
          )}
          <ObjectHoverPopup
            name={landmark.name}
            addressLabel={landmark.addressLabel}
            description={landmark.description}
          />
        </Marker>
      ))}
    </>
  );
}
