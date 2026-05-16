import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { joomlaApiRequest, joomlaApiRequestAllItems } from '../GenericFunctions';
import { OPERATION } from '../constants';

/**
 * Build the images object from a structured fixedCollection (single-group)
 */
function buildImagesFromCollection(imagesData: IDataObject): IDataObject {
	const images: IDataObject = {};

	if (imagesData.imageSettings) {
		// fixedCollection with multipleValues:false returns an object, not an array
		const settings = (Array.isArray(imagesData.imageSettings)
			? (imagesData.imageSettings as IDataObject[])[0]
			: imagesData.imageSettings) as IDataObject;
		if (settings) {
			// Process intro image fields
			if (settings.image_intro) images.image_intro = settings.image_intro;
			if (settings.image_intro_alt) images.image_intro_alt = settings.image_intro_alt;
			if (settings.image_intro_caption) images.image_intro_caption = settings.image_intro_caption;
			// Process fulltext image fields
			if (settings.image_fulltext) images.image_fulltext = settings.image_fulltext;
			if (settings.image_fulltext_alt) images.image_fulltext_alt = settings.image_fulltext_alt;
			if (settings.image_fulltext_caption) images.image_fulltext_caption = settings.image_fulltext_caption;
		}
	}

	return images;
}

/**
 * Process custom fields from a fixedCollection and add them to the body
 */
function processCustomFields(customFieldsData: IDataObject, body: IDataObject): void {
	if (customFieldsData.field && Array.isArray(customFieldsData.field)) {
		const comFields: IDataObject = {};
		for (const fieldEntry of customFieldsData.field as IDataObject[]) {
			if (fieldEntry.fieldName && fieldEntry.fieldValue !== undefined) {
				let value = fieldEntry.fieldValue;
				// Handle comma-separated values for checkboxes/multi-select
				if (typeof value === 'string' && value.includes(',')) {
					value = value.split(',').map((v: string) => v.trim());
				}
				comFields[fieldEntry.fieldName as string] = value;
			}
		}
		if (Object.keys(comFields).length > 0) {
			body.com_fields = comFields;
		}
	}
}

/**
 * Handle all article-related operations
 */
export async function handleArticle(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	if (operation === OPERATION.CREATE) {
		const title = this.getNodeParameter('title', itemIndex) as string;
		const catid = this.getNodeParameter('catid', itemIndex) as number;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		const body: IDataObject = {
			title,
			catid,
		};

		// Only add non-empty fields
		for (const [key, value] of Object.entries(additionalFields)) {
			if (value !== '' && value !== undefined && value !== null) {
				// Parse JSON fields (associations)
				if (key === 'associations' && typeof value === 'string') {
					try {
						body[key] = JSON.parse(value);
					} catch {
						body[key] = value;
					}
				} else if (key === 'tags' && Array.isArray(value)) {
					// Tags from multiOptions come as an array of IDs
					body.tags = value;
				} else {
					body[key] = value;
				}
			}
		}

		// Process structured images from fixedCollection
		const articleImages = this.getNodeParameter('articleImages', itemIndex, {}) as IDataObject;
		const images = buildImagesFromCollection(articleImages);
		if (Object.keys(images).length > 0) {
			body.images = images;
		}

		// Process custom fields
		const customFieldsData = this.getNodeParameter('customFields', itemIndex, {}) as IDataObject;
		processCustomFields(customFieldsData, body);

		responseData = await joomlaApiRequest.call(
			this,
			'POST',
			'/content/articles',
			body,
		);
	} else if (operation === OPERATION.DELETE) {
		const articleId = this.getNodeParameter('articleId', itemIndex) as number;

		responseData = await joomlaApiRequest.call(
			this,
			'DELETE',
			`/content/articles/${articleId}`,
		);
	} else if (operation === OPERATION.GET) {
		const articleId = this.getNodeParameter('articleId', itemIndex) as number;

		responseData = await joomlaApiRequest.call(
			this,
			'GET',
			`/content/articles/${articleId}`,
		);
	} else if (operation === OPERATION.GET_ALL) {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		const qs: IDataObject = {};

		// Apply filters
		if (filters.catid) {
			qs['filter[category]'] = filters.catid;
		}
		if (filters.state) {
			qs['filter[state]'] = filters.state;
		}
		if (filters.language) {
			qs['filter[language]'] = filters.language;
		}
		if (filters.featured) {
			qs['filter[featured]'] = filters.featured;
		}
		if (filters.search) {
			qs['filter[search]'] = filters.search;
		}

		if (returnAll) {
			responseData = await joomlaApiRequestAllItems.call(
				this,
				'GET',
				'/content/articles',
				{},
				qs,
			);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			qs['page[limit]'] = limit;
			const response = await joomlaApiRequest.call(
				this,
				'GET',
				'/content/articles',
				{},
				qs,
			);
			responseData = (response as IDataObject).data as IDataObject[];
		}
	} else if (operation === OPERATION.UPDATE) {
		const articleId = this.getNodeParameter('articleId', itemIndex) as number;
		const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const body: IDataObject = {};

		// Process update fields
		for (const [key, value] of Object.entries(updateFields)) {
			if (value !== '' && value !== undefined && value !== null) {
				// Parse JSON fields (associations)
				if (key === 'associations' && typeof value === 'string') {
					try {
						body[key] = JSON.parse(value);
					} catch {
						body[key] = value;
					}
				} else {
					body[key] = value;
				}
			}
		}

		// ---- Process Tags ----
		const updateTagsData = this.getNodeParameter('updateTags', itemIndex, {}) as IDataObject;
		if (updateTagsData.tagSettings) {
			// fixedCollection with multipleValues:false returns an object, not an array
			const tagSettings = (Array.isArray(updateTagsData.tagSettings)
				? (updateTagsData.tagSettings as IDataObject[])[0]
				: updateTagsData.tagSettings) as IDataObject;
			if (tagSettings) {
				const mode = tagSettings.mode as string;
				const selectedTags = (tagSettings.tags as number[]) || [];

				if (mode === 'replace') {
					// Replace all tags with the selected ones
					body.tags = selectedTags;
				} else if (mode === 'clear') {
					// Remove all tags
					body.tags = [];
				} else if (mode === 'add' || mode === 'remove') {
					// Need to fetch existing article to get current tags
					const existingArticle = await joomlaApiRequest.call(
						this,
						'GET',
						`/content/articles/${articleId}`,
					);

					const articleData = (existingArticle as IDataObject).data
						? ((existingArticle as IDataObject).data as IDataObject)
						: existingArticle as IDataObject;
					const attributes = (articleData.attributes || articleData) as IDataObject;
					const existingTags: number[] = [];

					// Extract existing tag IDs from the article's tags relationship
					if (attributes.tags && Array.isArray(attributes.tags)) {
						for (const tag of attributes.tags as (number | string)[]) {
							existingTags.push(Number(tag));
						}
					} else if (articleData.relationships && (articleData.relationships as IDataObject).tags) {
						const tagsRelation = (articleData.relationships as IDataObject).tags as IDataObject;
						if (tagsRelation.data && Array.isArray(tagsRelation.data)) {
							for (const tagRef of tagsRelation.data as IDataObject[]) {
								existingTags.push(Number(tagRef.id));
							}
						}
					}

					if (mode === 'add') {
						// Merge: add new tags to existing, deduplicate
						const mergedTags = [...new Set([...existingTags, ...selectedTags])];
						body.tags = mergedTags;
					} else {
						// Remove: filter out the selected tags from existing
						const selectedSet = new Set(selectedTags.map(Number));
						body.tags = existingTags.filter((t) => !selectedSet.has(t));
					}
				}
			}
		}

		// ---- Process Images ----
		const updateImagesData = this.getNodeParameter('updateImages', itemIndex, {}) as IDataObject;
		if (updateImagesData.imageSettings) {
			// fixedCollection with multipleValues:false returns an object, not an array
			const imgSettings = (Array.isArray(updateImagesData.imageSettings)
				? (updateImagesData.imageSettings as IDataObject[])[0]
				: updateImagesData.imageSettings) as IDataObject;
			if (imgSettings) {
				const introAction = (imgSettings.introAction as string) || 'skip';
				const fulltextAction = (imgSettings.fulltextAction as string) || 'skip';

				// Only fetch existing article if we need to modify images
				if (introAction !== 'skip' || fulltextAction !== 'skip') {
					// Fetch existing article to get current images
					const existingArticle = await joomlaApiRequest.call(
						this,
						'GET',
						`/content/articles/${articleId}`,
					);

					const articleData = (existingArticle as IDataObject).data
						? ((existingArticle as IDataObject).data as IDataObject)
						: existingArticle as IDataObject;
					const attributes = (articleData.attributes || articleData) as IDataObject;
					const existingImages = (attributes.images || {}) as IDataObject;

					// Start with existing images
					const images: IDataObject = { ...existingImages };

					// Process intro image
					if (introAction === 'remove') {
						images.image_intro = '';
						images.image_intro_alt = '';
						images.image_intro_caption = '';
					} else if (introAction === 'set') {
						if (imgSettings.image_intro !== undefined && imgSettings.image_intro !== '') {
							images.image_intro = imgSettings.image_intro;
						}
						if (imgSettings.image_intro_alt !== undefined && imgSettings.image_intro_alt !== '') {
							images.image_intro_alt = imgSettings.image_intro_alt;
						}
						if (imgSettings.image_intro_caption !== undefined && imgSettings.image_intro_caption !== '') {
							images.image_intro_caption = imgSettings.image_intro_caption;
						}
					}

					// Process fulltext image
					if (fulltextAction === 'remove') {
						images.image_fulltext = '';
						images.image_fulltext_alt = '';
						images.image_fulltext_caption = '';
					} else if (fulltextAction === 'set') {
						if (imgSettings.image_fulltext !== undefined && imgSettings.image_fulltext !== '') {
							images.image_fulltext = imgSettings.image_fulltext;
						}
						if (imgSettings.image_fulltext_alt !== undefined && imgSettings.image_fulltext_alt !== '') {
							images.image_fulltext_alt = imgSettings.image_fulltext_alt;
						}
						if (imgSettings.image_fulltext_caption !== undefined && imgSettings.image_fulltext_caption !== '') {
							images.image_fulltext_caption = imgSettings.image_fulltext_caption;
						}
					}

					body.images = images;
				}
			}
		}

		// Process custom fields
		const customFieldsData = this.getNodeParameter('customFields', itemIndex, {}) as IDataObject;
		processCustomFields(customFieldsData, body);

		responseData = await joomlaApiRequest.call(
			this,
			'PATCH',
			`/content/articles/${articleId}`,
			body,
		);
	}

	return responseData;
}
