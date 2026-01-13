import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { joomlaApiRequest } from '../GenericFunctions';
import { OPERATION } from '../constants';

/**
 * Handle all media-related operations
 */
export async function handleMedia(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	if (operation === OPERATION.LIST) {
		const folderPath = this.getNodeParameter('folderPath', itemIndex) as string;
		const options = this.getNodeParameter('options', itemIndex) as IDataObject;

		// Pass path as query parameter (confirmed working via curl)
		const qs: IDataObject = {
			path: folderPath ? `local-images:/${folderPath}/` : 'local-images:/',
		};

		if (options.search) {
			qs['filter[search]'] = options.search;
		}

		responseData = await joomlaApiRequest.call(
			this,
			'GET',
			'/media/files',
			{},
			qs,
		);
	} else if (operation === OPERATION.UPLOAD) {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;
		const destinationFolder = this.getNodeParameter('destinationFolder', itemIndex) as string;
		const options = this.getNodeParameter('options', itemIndex) as IDataObject;

		const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
		const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
		const base64Content = buffer.toString('base64');

		const fileName = options.fileName || binaryData.fileName || 'uploaded-file';

		const body: IDataObject = {
			path: `local-images:/${destinationFolder}/${fileName}`,
			content: base64Content,
		};

		responseData = await joomlaApiRequest.call(
			this,
			'POST',
			'/media/files',
			body,
		);
	} else if (operation === OPERATION.CREATE_FOLDER) {
		const parentFolder = this.getNodeParameter('parentFolder', itemIndex) as string;
		const folderName = this.getNodeParameter('folderName', itemIndex) as string;
		const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
		const ignoreIfExists = options.ignoreIfExists !== false; // Default true

		const body: IDataObject = {
			path: `local-images:/${parentFolder}/${folderName}`,
			override: ignoreIfExists, // Joomla API supports this parameter
		};

		try {
			responseData = await joomlaApiRequest.call(
				this,
				'POST',
				'/media/files',
				body,
			);
		} catch (error: unknown) {
			// If ignoreIfExists is true and the folder already exists, return success
			const errorStr = JSON.stringify(error);
			if (ignoreIfExists && errorStr.includes('File exists')) {
				responseData = {
					success: true,
					message: 'Folder already exists',
					path: `${parentFolder}/${folderName}`,
				};
			} else {
				throw error;
			}
		}
	} else if (operation === OPERATION.DELETE) {
		const path = this.getNodeParameter('path', itemIndex) as string;
		// Path goes in URL (no trailing slash for delete)
		const pathPart = `local-images:/${path}`;

		responseData = await joomlaApiRequest.call(
			this,
			'DELETE',
			`/media/files/${pathPart}`,
		);
	}

	return responseData;
}
