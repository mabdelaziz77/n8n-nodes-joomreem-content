import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	getCategories,
	getLanguages,
	getTags,
	joomlaApiRequest,
	joomlaApiRequestAllItems,
} from './GenericFunctions';

import { articleOperations, articleFields } from './descriptions/ArticleDescription';
import { categoryOperations, categoryFields } from './descriptions/CategoryDescription';
import { tagOperations, tagFields } from './descriptions/TagDescription';
import { mediaOperations, mediaFields } from './descriptions/MediaDescription';


export class Joomla implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Joomla Content (JoomReem)',
		name: 'joomla',
		icon: 'file:joomreem.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage Joomla CMS content - by Mohamed Abdelaziz (JoomReem)',
		defaults: {
			name: 'Joomla Content',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'joomlaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Article',
						value: 'article',
					},

					{
						name: 'Category',
						value: 'category',
					},
					{
						name: 'Media',
						value: 'media',
					},
					{
						name: 'Tag',
						value: 'tag',
					},
				],
				default: 'article',
			},
			// Article
			...articleOperations,
			...articleFields,
			// Category
			...categoryOperations,
			...categoryFields,
			// Tag
			...tagOperations,
			...tagFields,
			// Media
			...mediaOperations,
			...mediaFields,

		],
	};

	methods = {
		loadOptions: {
			getCategories,
			getTags,
			getLanguages,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] = {};

				// ----------------------------------------
				//              Article
				// ----------------------------------------
				if (resource === 'article') {
					if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const catid = this.getNodeParameter('catid', i) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

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

						responseData = await joomlaApiRequest.call(
							this,
							'POST',
							'/content/articles',
							body,
						);
					} else if (operation === 'delete') {
						const articleId = this.getNodeParameter('articleId', i) as number;

						responseData = await joomlaApiRequest.call(
							this,
							'DELETE',
							`/content/articles/${articleId}`,
						);
					} else if (operation === 'get') {
						const articleId = this.getNodeParameter('articleId', i) as number;

						responseData = await joomlaApiRequest.call(
							this,
							'GET',
							`/content/articles/${articleId}`,
						);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
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
							const limit = this.getNodeParameter('limit', i);
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
					} else if (operation === 'update') {
						const articleId = this.getNodeParameter('articleId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

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

						responseData = await joomlaApiRequest.call(
							this,
							'PATCH',
							`/content/articles/${articleId}`,
							body,
						);
					}
				}

				// ----------------------------------------
				//              Category
				// ----------------------------------------
				else if (resource === 'category') {
					if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = {
							title,
							extension: 'com_content',
						};

						// Only add non-empty fields
						for (const [key, value] of Object.entries(additionalFields)) {
							if (value !== '' && value !== undefined && value !== null) {
								body[key] = value;
							}
						}

						responseData = await joomlaApiRequest.call(
							this,
							'POST',
							'/content/categories',
							body,
						);
					} else if (operation === 'delete') {
						const categoryId = this.getNodeParameter('categoryId', i) as number;

						responseData = await joomlaApiRequest.call(
							this,
							'DELETE',
							`/content/categories/${categoryId}`,
						);
					} else if (operation === 'get') {
						const categoryId = this.getNodeParameter('categoryId', i) as number;

						responseData = await joomlaApiRequest.call(
							this,
							'GET',
							`/content/categories/${categoryId}`,
						);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
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
								'/content/categories',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
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
					} else if (operation === 'update') {
						const categoryId = this.getNodeParameter('categoryId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

						const body: IDataObject = {};
						// Only add non-empty fields
						for (const [key, value] of Object.entries(updateFields)) {
							if (value !== '' && value !== undefined && value !== null) {
								body[key] = value;
							}
						}

						responseData = await joomlaApiRequest.call(
							this,
							'PATCH',
							`/content/categories/${categoryId}`,
							body,
						);
					}
				}

				else if (resource === 'tag') {
					if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

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
					} else if (operation === 'delete') {
						const tagId = this.getNodeParameter('tagId', i) as number;

						responseData = await joomlaApiRequest.call(
							this,
							'DELETE',
							`/tags/${tagId}`,
						);
					} else if (operation === 'get') {
						const tagId = this.getNodeParameter('tagId', i) as number;

						responseData = await joomlaApiRequest.call(
							this,
							'GET',
							`/tags/${tagId}`,
						);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
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
							const limit = this.getNodeParameter('limit', i);
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
					} else if (operation === 'update') {
						const tagId = this.getNodeParameter('tagId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

						responseData = await joomlaApiRequest.call(
							this,
							'PATCH',
							`/tags/${tagId}`,
							updateFields,
						);
					}
				}

				// ----------------------------------------
				//              Media
				// ----------------------------------------
				else if (resource === 'media') {
					if (operation === 'list') {
						const folderPath = this.getNodeParameter('folderPath', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;
						
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
					} else if (operation === 'upload') {
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const destinationFolder = this.getNodeParameter('destinationFolder', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;

						const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
						const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
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
					} else if (operation === 'createFolder') {
						const parentFolder = this.getNodeParameter('parentFolder', i) as string;
						const folderName = this.getNodeParameter('folderName', i) as string;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
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
					} else if (operation === 'delete') {
						const path = this.getNodeParameter('path', i) as string;
						// Path goes in URL (no trailing slash for delete)
						const pathPart = `local-images:/${path}`;

						responseData = await joomlaApiRequest.call(
							this,
							'DELETE',
							`/media/files/${pathPart}`,
						);
					}
				}



				// Process response
				if (responseData === undefined) {
					responseData = { success: true };
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
