import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import type { UserDto } from '../../types/api';

interface Props {
  user: UserDto;
  onManageProfile: () => void;
  onSignOut: () => void;
}

/** Account dropdown shown below the avatar: identity header + profile / sign-out actions. */
export function ControlPanel({ user, onManageProfile, onSignOut }: Props) {
  return (
    <Paper elevation={3} sx={{ width: 240, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {user.email}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, gap: 0.5 }}>
        <Button
          variant="text"
          size="small"
          startIcon={<PersonOutlineIcon />}
          onClick={onManageProfile}
          sx={{ justifyContent: 'flex-start' }}
        >
          Manage profile
        </Button>
        <Button
          variant="text"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={onSignOut}
          sx={{ justifyContent: 'flex-start' }}
        >
          Sign out
        </Button>
      </Box>
    </Paper>
  );
}
