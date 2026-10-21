import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
  hydrate,
  type DehydratedState,
} from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultViewTransition: true,
    // Ship the server's query cache with the HTML so the browser doesn't
    // re-request every API call the server already made. The cache only holds
    // JSON from the API; the cast is needed because React Query types query
    // keys as `unknown`, which the router's serializer types cannot verify.
    dehydrate: () =>
      ({
        queryClientState: dehydrate(queryClient, { shouldDehydrateMutation: () => false }),
      }) as never,
    hydrate: (dehydrated: { queryClientState: DehydratedState }) => {
      hydrate(queryClient, dehydrated.queryClientState);
    },
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  return router;
};
