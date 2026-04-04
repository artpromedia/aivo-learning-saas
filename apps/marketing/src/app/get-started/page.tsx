import { redirect } from "next/navigation";

// Marketing site /get-started redirects to the web app's registration page.
// In production the web app lives at app.aivolearning.com; in dev it runs on :3000.
const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "https://app.aivolearning.com";

export default function GetStartedPage() {
  redirect(`${WEB_APP_URL}/get-started`);
}
