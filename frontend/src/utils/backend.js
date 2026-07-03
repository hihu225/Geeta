export const backend_url = import.meta.env.VITE_APP_API_URL;

if (!backend_url) {
  // Surface configuration errors early — helps catch missing .env in CI/deploy.
  console.error(
    '[backend] VITE_APP_API_URL is not set. API calls will fail. ' +
      'Set it in frontend/.env (see frontend/.env.example).'
  );
}
