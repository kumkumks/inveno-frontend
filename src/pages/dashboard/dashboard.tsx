import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
      <p className="text-gray-600">Signed in as {user?.email} ({user?.role})</p>
      <Button type="button" variant="dark" onClick={handleSignOut}>Sign out</Button>
    </main>
  );
}