import { Marker, Tooltip } from 'react-leaflet';
import { useAuth } from '../../hooks/useAuth';
import { useLabelsVisible } from '../../hooks/useLabelsVisible';
import { landmarkDivIcon } from './landmarkIcons';
import { ObjectHoverPopup } from './ObjectHoverPopup';
import { DEFAULT_COLOR } from '../../types/api';

/** Blue home tint, matching the default object color. */
const HOME_COLOR = DEFAULT_COLOR;

/**
 * A special "Home" marker derived directly from the signed-in user's saved address — not a
 * persisted landmark. It renders only on the map (never in the objects list) and is not
 * editable: it appears/moves automatically whenever the address is set or changed in
 * register/profile, and disappears when there is no address. Rendered under the Landmarks
 * layer gate in AppMap, so it follows that toggle.
 */
export function HomeMarker() {
  const { user } = useAuth();
  const showLabels = useLabelsVisible();
  const address = user?.address;
  if (!address) return null;

  return (
    <Marker
      position={[address.lat, address.lon]}
      icon={landmarkDivIcon('home', HOME_COLOR)}
      eventHandlers={{
        mouseover: (e) => e.target.openPopup(),
        mouseout: (e) => e.target.closePopup(),
      }}
    >
      {showLabels && (
        <Tooltip permanent direction="top" offset={[0, -10]} className="map-label">
          Home
        </Tooltip>
      )}
      <ObjectHoverPopup name="Home" addressLabel={address.label} />
    </Marker>
  );
}
