import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { joomlaApiRequest, joomlaApiRequestAllItems } from '../GenericFunctions';
import { OPERATION } from '../constants';

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
				// Parse JSON fields (images)
				if (key === 'images' && typeof value === 'string') {
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

		// Process custom fields
		const customFieldsData = this.getNodeParameter('customFields', itemIndex, {}) as IDataObject;
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
			qs['filter[category_id]'] = filters.catid;
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
				// Parse JSON fields (associations, images)
				if ((key === 'associations' || key === 'images') && typeof value === 'string') {
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

		// Process custom fields
		const customFieldsData = this.getNodeParameter('customFields', itemIndex, {}) as IDataObject;
		if (customFieldsData.field && Array.isArray(customFieldsData.field)) {
			const comFields: IDataObject = {};
			for (const fieldEntry of customFieldsData.field as IDataObject[]) {
				if (fieldEntry.fieldName && fieldEntry.fieldValue !== undefined) {
					let value = fieldEntry.fieldValue;
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

		responseData = await joomlaApiRequest.call(
			this,
			'PATCH',
			`/content/articles/${articleId}`,
			body,
		);
	}

	return responseData;
}
