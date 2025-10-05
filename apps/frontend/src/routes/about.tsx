import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/about")({
	component: About,
});

function About() {
	const { data: session } = authClient.useSession();

	return (
		<div className="p-2">
			<h3>Hello from About!</h3>
			<pre>{JSON.stringify({ session }, null, 2)}</pre>
		</div>
	);
}
