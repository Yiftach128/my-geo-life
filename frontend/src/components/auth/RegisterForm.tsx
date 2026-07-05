import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, TextField } from '@mui/material';
import { authApi } from '../../services/auth.api';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../services/api-client';

interface Props {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: Props) {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.length < 2) { setError('Name must be at least 2 characters'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await authApi.register({
        name,
        email,
        password,
        age: age ? parseInt(age, 10) : undefined,
      });
      login(res.user, res.token);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.body.error : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
        inputProps={{ minLength: 2, maxLength: 50 }}
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        inputProps={{ minLength: 8, maxLength: 64 }}
      />
      <TextField
        label="Age (optional)"
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        inputProps={{ min: 0, max: 120 }}
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? <CircularProgress size={20} /> : 'Register'}
      </Button>
    </Box>
  );
}
