import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Make an authenticated API request to Joomla
 */
export async function joomlaApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	option: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('joomlaApi');

	const options: IHttpRequestOptions = {
		method,
		url: `${credentials.siteUrl}/api/index.php/v1${endpoint}`,
		headers: {
			'Accept': 'application/vnd.api+json',
			'Content-Type': 'application/json',
		},
		qs,
		body,
		json: true,
		skipSslCertificateValidation: credentials.skipSslVerification as boolean,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	if (Object.keys(qs).length === 0) {
		delete options.qs;
	}

	Object.assign(options, option);

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'joomlaApi',
			options,
		);
		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an API request to retrieve all items (handles pagination)
 */
export async function joomlaApiRequestAllItems(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let responseData: IDataObject;
	let offset = 0;
	const limit = 20;

	qs['page[limit]'] = limit;

	do {
		qs['page[offset]'] = offset;
		responseData = (await joomlaApiRequest.call(this, method, endpoint, body, qs)) as IDataObject;

		const data = responseData.data as IDataObject[];
		if (data) {
			returnData.push(...data);
		}

		offset += limit;
	} while (
		responseData.links &&
		(responseData.links as IDataObject).next
	);

	return returnData;
}

/**
 * Get categories for dropdown
 */
export async function getCategories(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const categories = await joomlaApiRequestAllItems.call(this, 'GET', '/content/categories');

	for (const category of categories) {
		const attributes = category.attributes as IDataObject;
		returnData.push({
			name: attributes.title as string,
			value: category.id as number,
		});
	}

	return returnData;
}

/**
 * Get tags for dropdown
 */
export async function getTags(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const tags = await joomlaApiRequestAllItems.call(this, 'GET', '/tags');

	for (const tag of tags) {
		const attributes = tag.attributes as IDataObject;
		returnData.push({
			name: attributes.title as string,
			value: tag.id as number,
		});
	}

	return returnData;
}

/**
 * Get languages for dropdown
 */
export async function getLanguages(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];

	try {
		const languages = await joomlaApiRequestAllItems.call(this, 'GET', '/languages/content');

		for (const language of languages) {
			const attributes = language.attributes as IDataObject;
			returnData.push({
				name: attributes.title as string,
				value: attributes.lang_code as string,
			});
		}
	} catch (error) {
		// Return default if languages API not available
		returnData.push({
			name: 'All',
			value: '*',
		});
	}

	return returnData;
}

/**
 * Get custom fields for articles dropdown
 */
export async function getArticleCustomFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];

	try {
		const fields = await joomlaApiRequestAllItems.call(this, 'GET', '/fields/content/articles');

		for (const field of fields) {
			const attributes = field.attributes as IDataObject;
			returnData.push({
				name: `${attributes.title as string} (${attributes.name as string})`,
				value: attributes.name as string,
				description: `Type: ${attributes.type as string}`,
			});
		}
	} catch (error) {
		// Return empty if fields API not available or no fields defined
	}

	return returnData;
}
