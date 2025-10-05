import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const {
		data: session,
		isPending, //loading state
		error, //error object
		refetch, //refetch the session
	} = authClient.useSession();

	const handleGoogleSignIn = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: "http://localhost:5173",
		});
	};

	return (
		<div className="p-2">
			<h3>Welcome Home!</h3>

			<pre>{JSON.stringify({ session }, null, 2)}</pre>
			<pre>{JSON.stringify({ isPending }, null, 2)}</pre>
			<pre>{JSON.stringify({ error }, null, 2)}</pre>
			<pre>{JSON.stringify({ refetch }, null, 2)}</pre>

			<Button onClick={handleGoogleSignIn}>Google Sign In</Button>
			<Button onClick={() => authClient.signOut()}>Logout</Button>
		</div>
	);
}
