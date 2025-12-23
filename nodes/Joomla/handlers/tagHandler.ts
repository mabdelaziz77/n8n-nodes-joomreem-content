import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { joomlaApiRequest, joomlaApiRequestAllItems } from '../GenericFunctions';
import { OPERATION } from '../constants';

/**
 * Handle all tag-related operations
 */
export async function handleTag(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	if (operation === OPERATION.CREATE) {
		const title = this.getNodeParameter('title', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;

		// Tags require parent_id (1 = root level, unless specified)
		const body: IDataObject = {
			title,
			parent_id: additionalFields.parent_id || 1,
		};

		// Add other optional fields
		const allowedFields = ['alias', 'description', 'language', 'published'];
		for (const [key, value] of Object.entries(additionalFields)) {
			if (value !== '' && value !== undefined && value !== null && allowedFields.includes(key)) {
				body[key] = value;
			}
		}

		responseData = await joomlaApiRequest.call(
			this,
			'POST',
			'/tags',
			body,
		);
	} else if (operation === OPERATION.DELETE) {
		const tagId = this.getNodeParameter('tagId', itemIndex) as number;

		responseData = await joomlaApiRequest.call(
			this,
			'DELETE',
			`/tags/${tagId}`,
		);
	} else if (operation === OPERATION.GET) {
		const tagId = this.getNodeParameter('tagId', itemIndex) as number;

		responseData = await joomlaApiRequest.call(
			this,
			'GET',
			`/tags/${tagId}`,
		);
	} else if (operation === OPERATION.GET_ALL) {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);
		const filters = this.getNodeParameter('filters', itemIndex) as IDataObject;
		const qs: IDataObject = {};

		if (filters.parent_id) {
			qs['filter[parent_id]'] = filters.parent_id;
		}
		if (filters.state) {
			qs['filter[state]'] = filters.state;
		}
		if (filters.language) {
			qs['filter[language]'] = filters.language;
		}
		if (filters.search) {
			qs['filter[search]'] = filters.search;
		}

		if (returnAll) {
			responseData = await joomlaApiRequestAllItems.call(
				this,
				'GET',
				'/tags',
				{},
				qs,
			);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
			qs['page[limit]'] = limit;
			const response = await joomlaApiRequest.call(
				this,
				'GET',
				'/tags',
				{},
				qs,
			);
			responseData = (response as IDataObject).data as IDataObject[];
		}
	} else if (operation === OPERATION.UPDATE) {
		const tagId = this.getNodeParameter('tagId', itemIndex) as number;
		const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;

		responseData = await joomlaApiRequest.call(
			this,
			'PATCH',
			`/tags/${tagId}`,
			updateFields,
		);
	}

	return responseData;
}
