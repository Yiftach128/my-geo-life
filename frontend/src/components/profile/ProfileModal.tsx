import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../services/users.api';
import { ApiError } from '../../services/api-client';
import { AddressAutocomplete } from '../common/AddressAutocomplete';
import type { Address } from '../../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: Props) {
  const { user, updateUser } = useAuth();

  // Profile (name / address) section
  const [name, setName] = useState(user?.name ?? '');
  const [address, setAddress] = useState<Address | null>(user?.address ?? null);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password section (reauthenticates with the current password)
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  if (!user) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    if (name.trim().length < 2) {
      setProfileError('Name must be at least 2 characters');
      return;
    }
    setProfileLoading(true);
    try {
      const updated = await usersApi.update(user.id, {
        name: name.trim(),
        address: address ?? undefined,
      });
      updateUser(updated);
      setProfileSuccess('Profile updated');
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.body.error : 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await usersApi.changePassword(user.id, { oldPassword, newPassword });
      setPasswordSuccess('Password changed');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.body.error : 'Password change failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Manage profile</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleProfileSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
          {profileError && <Alert severity="error">{profileError}</Alert>}
          {profileSuccess && <Alert severity="success">{profileSuccess}</Alert>}
          <TextField
            label="Email"
            value={user.email}
            disabled
            helperText="Email cannot be changed"
          />
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            inputProps={{ minLength: 2, maxLength: 50 }}
          />
          <AddressAutocomplete value={address} onChange={setAddress} />
          <Button type="submit" variant="contained" disabled={profileLoading}>
            {profileLoading ? <CircularProgress size={20} /> : 'Save profile'}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Button
            variant="text"
            onClick={() => {
              setShowPasswordForm((v) => !v);
              setPasswordError('');
              setPasswordSuccess('');
            }}
          >
            Change password
          </Button>
          {passwordSuccess && !showPasswordForm && (
            <Alert severity="success" sx={{ mt: 1 }}>
              {passwordSuccess}
            </Alert>
          )}
          <Collapse in={showPasswordForm} timeout="auto" unmountOnExit>
            <Box
              component="form"
              onSubmit={handlePasswordSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
            >
              {passwordError && <Alert severity="error">{passwordError}</Alert>}
              <TextField
                label="Current password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                inputProps={{ minLength: 8, maxLength: 64 }}
                autoComplete="new-password"
              />
              <TextField
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <Button type="submit" variant="contained" disabled={passwordLoading}>
                {passwordLoading ? <CircularProgress size={20} /> : 'Update password'}
              </Button>
            </Box>
          </Collapse>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
