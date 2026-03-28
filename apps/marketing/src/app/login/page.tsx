import { redirect } from "next/navigation";

// Marketing site /login redirects to the web app's login page.
// In production both share the same domain; in dev the web app runs on :3000.
const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "http://localhost:3000";

export default function LoginRedirect() {
  redirect(`${WEB_APP_URL}/login`);
}
