import { redirect } from "next/navigation";

export default function Home() {
	// Redirect to dashboard page when this component renders
	redirect("/dashboard");

	// The following return statement will never be reached due to the redirect
	// but is required to satisfy TypeScript
	return null;
}