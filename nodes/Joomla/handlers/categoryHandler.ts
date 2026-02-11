import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { joomlaApiRequest, joomlaApiRequestAllItems } from '../GenericFunctions';
import { OPERATION } from '../constants';

/**
 * Handle all category-related operations
 */
export async function handleCategory(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	if (operation === OPERATION.CREATE) {
		const title = this.getNodeParameter('title', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		const body: IDataObject = {
			title,
			extension: 'com_content',
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
			'POST',
			'/content/categories',
			body,
		);
	} else if (operation === OPERATION.DELETE) {
		const categoryId = this.getNodeParameter('categoryId', itemIndex) as number;

		responseData = await joomlaApiRequest.call(
			this,
			'DELETE',
			`/content/categories/${categoryId}`,
		);
	} else if (operation === OPERATION.GET) {
		const categoryId = this.getNodeParameter('categoryId', itemIndex) as number;

		responseData = await joomlaApiRequest.call(
			this,
			'GET',
			`/content/categories/${categoryId}`,
		);
	} else if (operation === OPERATION.GET_ALL) {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		const qs: IDataObject = {};

		// Only search and extension filters are supported by Joomla Categories API
		if (filters.search) {
			qs['filter[search]'] = filters.search;
		}
		if (filters.extension) {
			qs['filter[extension]'] = filters.extension;
		}
		if (returnAll) {
			responseData = await joomlaApiRequestAllItems.call(
				this,
				'GET',
				'/content/categories',
				{},
				qs,
			);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			qs['page[limit]'] = limit;
			const response = await joomlaApiRequest.call(
				this,
				'GET',
				'/content/categories',
				{},
				qs,
			);
			responseData = (response as IDataObject).data as IDataObject[];
		}
	} else if (operation === OPERATION.UPDATE) {
		const categoryId = this.getNodeParameter('categoryId', itemIndex) as number;
		const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;

		const body: IDataObject = {};
		// Only add non-empty fields
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

		// When updating associations, ensure the category's own language is included
		// in the PATCH body and NOT in the associations object
		// (the Joomla CategoryModel adds "self" to associations automatically)
		if (body.associations && typeof body.associations === 'object') {
			// If language wasn't explicitly provided, fetch the current category to get it
			if (!body.language) {
				const currentCategory = await joomlaApiRequest.call(
					this,
					'GET',
					`/content/categories/${categoryId}`,
				);
				const attributes = ((currentCategory as IDataObject).data as IDataObject)?.attributes as IDataObject;
				if (attributes?.language) {
					body.language = attributes.language as string;
				}
			}
			// Remove the category's own language from associations (model adds it automatically)
			if (body.language && (body.associations as IDataObject)[body.language as string] !== undefined) {
				delete (body.associations as IDataObject)[body.language as string];
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
			`/content/categories/${categoryId}`,
			body,
		);
	}

	return responseData;
}
