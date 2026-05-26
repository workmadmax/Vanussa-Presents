import { HomeClient } from "./homeClient";

type HomeSearchParams = Promise<{
	category?: string | string[];
}>;

export default async function Home({
	searchParams,
}: {
	searchParams: HomeSearchParams;
}) {
	const params = await searchParams;
	const rawCategory = params.category;
	const category = Array.isArray(rawCategory)
		? (rawCategory[0] ?? null)
		: (rawCategory ?? null);

	return <HomeClient category={category} />;
}
