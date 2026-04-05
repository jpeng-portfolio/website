import {createClient} from "next-sanity";
let cachedClient: ReturnType<typeof createClient> | null = null;

export function getSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-04-05",
    useCdn: true,
    token: process.env.SANITY_API_READ_TOKEN,
  });

  return cachedClient;
}
