import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
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

	const handleSignIn = async () => {
		await authClient.signIn.email(
			{
				email: "maciek.sykula@gmail.com",
				password: "qweqweqwe",
				// callbackURL: "/",
			},
			{
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);
	};

	const handleSignUp = async () => {
		await authClient.signUp.email(
			{
				name: "Maciuś",
				email: "maciek.sykula@gmail.com",
				password: "qweqweqwe",
				// callbackURL: "/",
			},
			{
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
			},
		);
	};

	return (
		<div className="p-2">
			<h3>Welcome Home!</h3>

			<pre>{JSON.stringify({ session }, null, 2)}</pre>
			<pre>{JSON.stringify({ isPending }, null, 2)}</pre>
			<pre>{JSON.stringify({ error }, null, 2)}</pre>
			<pre>{JSON.stringify({ refetch }, null, 2)}</pre>

			<Button onClick={handleSignIn}>Sign In</Button>
			<Button onClick={handleSignUp}>Sign Up</Button>
			<Button onClick={() => authClient.signOut()}>Logout</Button>
		</div>
	);
}
