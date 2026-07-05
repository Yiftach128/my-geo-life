import { Box, Button, Chip } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  onSignInClick: () => void;
}

export function AuthButton({ onSignInClick }: Props) {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <Button variant="contained" onClick={onSignInClick} size="small">
        Sign In
      </Button>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button variant="outlined" size="small" onClick={logout} sx={{ bgcolor: 'white' }}>
        Sign Out
      </Button>
      <Chip label={`${user!.name}'s Map`} size="small" sx={{ bgcolor: 'white' }} />
    </Box>
  );
}
