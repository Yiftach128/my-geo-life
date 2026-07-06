import { useState } from 'react';
import { Avatar, Button, IconButton, Popover } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { ControlPanel } from './ControlPanel';

interface Props {
  onSignInClick: () => void;
  onManageProfileClick: () => void;
}

export function AuthButton({ onSignInClick, onManageProfileClick }: Props) {
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <Button variant="contained" onClick={onSignInClick} size="small">
        Sign In
      </Button>
    );
  }

  const closePanel = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Account menu"
        sx={{ p: 0 }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'grey.500', color: 'common.white' }}>
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closePanel}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 1, bgcolor: 'transparent', boxShadow: 'none' } } }}
      >
        <ControlPanel
          user={user}
          onManageProfile={() => {
            closePanel();
            onManageProfileClick();
          }}
          onSignOut={() => {
            closePanel();
            logout();
          }}
        />
      </Popover>
    </>
  );
}
