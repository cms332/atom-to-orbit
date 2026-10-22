import { motionArticle } from './motion-article';
import { atomicSpaceArticle } from './atomic-space-article';
import { atomicScaleArticle } from './atomic-scale-article';
import { earthMoonArticle } from './earth-moon-article';

export interface Article {
	slug: string;
	title: string;
	category: string;
	categoryId: string;
	intro: string;
	date?: string;
	sourceIds: string[];
	diagram: 'moon' | 'atom' | 'motion' | 'atomic-space';
	opening?: string[];
	sourceNote?: string;
	closing?: { title: string; paragraphs: string[]; keyPoint?: string };
	sections: {
		title: string;
		text: string;
		paragraphs?: string[];
		keyPoint?: string;
		sourceIds?: string[];
		visual?:
			| 'inertia'
			| 'frames'
			| 'atomic-distance'
			| 'atomic-probability'
			| 'atomic-reference'
			| 'atom-ball-moon'
			| 'earth-moon-distance'
			| 'earth-moon-balls'
			| 'log-steps';
	}[];
	takeaway: string;
}
export const articles: Article[] = [
	atomicSpaceArticle,
	motionArticle,
	earthMoonArticle,
	atomicScaleArticle
];

export const articleTopics = [
	{ id: 'all', label: '전체' },
	...new Map(
		articles.map((article) => [
			article.categoryId,
			{ id: article.categoryId, label: article.category }
		])
	).values()
];
