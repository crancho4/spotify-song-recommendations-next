import { signIn } from 'next-auth/react';

export default function LoginButton() {
  return (
    <div>
      <h1>Login to Spotify</h1>
      <button onClick={() => signIn('spotify')}>Login with Spotify</button>
    </div>
  );
}


