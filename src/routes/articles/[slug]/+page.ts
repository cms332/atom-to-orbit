import { error } from '@sveltejs/kit';
import { articles } from '$lib/content/articles';
import type { PageLoad } from './$types';
export const entries = () => articles.map((article) => ({ slug: article.slug }));
export const load: PageLoad = ({ params }) => {
	const article = articles.find((a) => a.slug === params.slug);
	if (!article) error(404, '이야기를 찾을 수 없습니다.');
	return { article };
};
