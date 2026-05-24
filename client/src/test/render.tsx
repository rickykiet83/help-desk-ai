import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
}

export function renderWithClient(ui: ReactElement) {
	const queryClient = makeQueryClient();
	const result = render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>{ui}</MemoryRouter>
		</QueryClientProvider>,
	);
	return { ...result, queryClient };
}
