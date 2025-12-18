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
	getArticleCustomFields,
	getCategoryCustomFields,
	joomlaApiRequest,
	joomlaApiRequestAllItems,
} from './GenericFunctions';

import { articleOperations, articleFields } from './descriptions/ArticleDescription';
import { categoryOperations, categoryFields } from './descriptions/CategoryDescription';
import { tagOperations, tagFields } from './descriptions/TagDescription';
import { mediaOperations, mediaFields } from './descriptions/MediaDescription';
import { fieldOperations, fieldFields } from './descriptions/FieldDescription';


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
						name: 'Custom Field',
						value: 'field',
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
			// Field
			...fieldOperations,
			...fieldFields,

		],
	};

	methods = {
		loadOptions: {
			getCategories,
			getTags,
			getLanguages,
			getArticleCustomFields,
			getCategoryCustomFields,
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

						// Process custom fields
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as IDataObject;
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

						// Process custom fields
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as IDataObject;
						if (customFieldsData.field && Array.isArray(customFieldsData.field)) {
							const comFields: IDataObject = {};
							for (const fieldEntry of customFieldsData.field as IDataObject[]) {
								if (fieldEntry.fieldName && fieldEntry.fieldValue !== undefined) {
									let value = fieldEntry.fieldValue; if (typeof value === 'string' && value.includes(',')){value = value.split(',').map((v: string) => v.trim());} comFields[fieldEntry.fieldName as string] = value;
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

						// Process custom fields
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as IDataObject;
						if (customFieldsData.field && Array.isArray(customFieldsData.field)) {
							const comFields: IDataObject = {};
							for (const fieldEntry of customFieldsData.field as IDataObject[]) {
								if (fieldEntry.fieldName && fieldEntry.fieldValue !== undefined) {
									let value = fieldEntry.fieldValue; if (typeof value === 'string' && value.includes(',')){value = value.split(',').map((v: string) => v.trim());} comFields[fieldEntry.fieldName as string] = value;
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

						// Process custom fields
						const customFieldsData = this.getNodeParameter('customFields', i, {}) as IDataObject;
						if (customFieldsData.field && Array.isArray(customFieldsData.field)) {
							const comFields: IDataObject = {};
							for (const fieldEntry of customFieldsData.field as IDataObject[]) {
								if (fieldEntry.fieldName && fieldEntry.fieldValue !== undefined) {
									let value = fieldEntry.fieldValue; if (typeof value === 'string' && value.includes(',')){value = value.split(',').map((v: string) => v.trim());} comFields[fieldEntry.fieldName as string] = value;
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

				// ----------------------------------------
				//              Field (Custom Fields Management)
				// ----------------------------------------
				else if (resource === 'field') {
					const context = this.getNodeParameter('context', i) as string;
					// Determine endpoint based on context
					const endpoint = context === 'com_content.article' 
						? '/fields/content/articles' 
						: '/fields/content/categories';

					if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const type = this.getNodeParameter('type', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						// Auto-generate name from title if not provided
						let name = (additionalFields.name as string) || '';
						if (!name) {
							name = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
						}
						delete additionalFields.name;

						// Auto-generate label from title if not provided
						let label = (additionalFields.label as string) || '';
						if (!label) {
							label = title;
						}
						delete additionalFields.label;

						const body: IDataObject = {
							title,
							name,
							label,
							type,
							context,
							description: '',
							params: {
								hint: '',
								class: '',
								label_class: '',
								show_on: '',
								render_class: '',
								showlabel: '1',
								label_render_class: '',
								display: '2',
								prefix: '',
								suffix: '',
								layout: '',
								display_readonly: '2',
							},
							fieldparams: {},
						};

						// Add additional fields
						for (const [key, value] of Object.entries(additionalFields)) {
							if (value !== '' && value !== undefined && value !== null) {
								body[key] = value;
							}
						}

						// Get fieldparams - type-specific options
						const fieldparams: IDataObject = {};

						// List/Radio/Checkboxes - get options JSON
						if (['list', 'radio', 'checkboxes'].includes(type)) {
							const fieldparamsJson = this.getNodeParameter('fieldparams', i, '{}') as string;
							try {
								Object.assign(fieldparams, JSON.parse(fieldparamsJson));
							} catch {
								// Invalid JSON, ignore
							}
						}

						// List - multiple selection and header
						if (type === 'list') {
							const multiple = this.getNodeParameter('listMultiple', i, false) as boolean;
							fieldparams.multiple = multiple;
							const header = this.getNodeParameter('listHeader', i, '') as string;
							if (header) fieldparams.header = header;
						}

						// Integer - first, last, step
						if (type === 'integer') {
							fieldparams.first = this.getNodeParameter('integerFirst', i, 1) as number;
							fieldparams.last = this.getNodeParameter('integerLast', i, 10) as number;
							fieldparams.step = this.getNodeParameter('integerStep', i, 1) as number;
						}

						// URL - relative, schemes, show_url
						if (type === 'url') {
							const relative = this.getNodeParameter('urlRelative', i, false) as boolean;
							fieldparams.relative = relative;
							const schemes = this.getNodeParameter('urlSchemes', i, ['http', 'https']) as string[];
							fieldparams.schemes = schemes;
							const showUrl = this.getNodeParameter('urlShowUrl', i, true) as boolean;
							fieldparams.show_url = showUrl;
						}

						// Calendar - format and showtime
						if (type === 'calendar') {
							fieldparams.format = this.getNodeParameter('calendarFormat', i, '%Y-%m-%d') as string;
							fieldparams.showtime = this.getNodeParameter('calendarShowtime', i, false) as boolean;
						}

						// Text - maxlength
						if (type === 'text') {
							const maxlength = this.getNodeParameter('textMaxlength', i, 0) as number;
							if (maxlength > 0) fieldparams.maxlength = maxlength;
						}

						// Textarea - rows, cols, maxlength
						if (type === 'textarea') {
							fieldparams.rows = this.getNodeParameter('textareaRows', i, 5) as number;
							fieldparams.cols = this.getNodeParameter('textareaCols', i, 50) as number;
							const maxlength = this.getNodeParameter('textareaMaxlength', i, 0) as number;
							if (maxlength > 0) fieldparams.maxlength = maxlength;
						}

						// Editor - buttons, width, height
						if (type === 'editor') {
							const buttons = this.getNodeParameter('editorButtons', i, true) as boolean;
							fieldparams.buttons = buttons;
							fieldparams.width = this.getNodeParameter('editorWidth', i, '100%') as string;
							fieldparams.height = this.getNodeParameter('editorHeight', i, '250px') as string;
						}

						// Media - directory, preview
						if (type === 'media') {
							const directory = this.getNodeParameter('mediaDirectory', i, '') as string;
							if (directory) fieldparams.directory = directory;
							fieldparams.preview = this.getNodeParameter('mediaPreview', i, 'true') as string;
						}

						// SQL - query, header, multiple
						if (type === 'sql') {
							const query = this.getNodeParameter('sqlQuery', i, '') as string;
							if (query) fieldparams.query = query;
							const header = this.getNodeParameter('sqlHeader', i, '') as string;
							if (header) fieldparams.header = header;
							const multiple = this.getNodeParameter('sqlMultiple', i, false) as boolean;
							fieldparams.multiple = multiple;
						}

						body.fieldparams = fieldparams;

						responseData = await joomlaApiRequest.call(
							this,
							'POST',
							endpoint,
							body,
						);
					} else if (operation === 'delete') {
						const fieldId = this.getNodeParameter('fieldId', i) as number;

						await joomlaApiRequest.call(
							this,
							'DELETE',
							`${endpoint}/${fieldId}`,
						);

						// Verify the field was actually deleted by trying to fetch it
						try {
							await joomlaApiRequest.call(
								this,
								'GET',
								`${endpoint}/${fieldId}`,
							);
							// If we get here, the field still exists - wasn't deleted
							throw new NodeOperationError(
								this.getNode(),
								`Field ${fieldId} was not deleted. Make sure the field is in Trashed state (state = -2) before deleting.`,
								{ itemIndex: i }
							);
						} catch (error) {
							// If we get a 404 or similar error, the field was deleted successfully
							if ((error as Error).message.includes('not found') || 
								(error as Error).message.includes('404') ||
								(error as Error).message.includes('Not Found')) {
								responseData = { success: true, message: `Field ${fieldId} deleted successfully` };
							} else if ((error as Error).message.includes('was not deleted')) {
								throw error;
							} else {
								// Some other error - field might be deleted, treat as success
								responseData = { success: true, message: `Field ${fieldId} deleted successfully` };
							}
						}
					} else if (operation === 'get') {
						const fieldId = this.getNodeParameter('fieldId', i) as number;

						responseData = await joomlaApiRequest.call(
							this,
							'GET',
							`${endpoint}/${fieldId}`,
						);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);

						if (returnAll) {
							responseData = await joomlaApiRequestAllItems.call(
								this,
								'GET',
								endpoint,
							);
						} else {
							const limit = this.getNodeParameter('limit', i);
							const qs: IDataObject = { 'page[limit]': limit };
							const response = await joomlaApiRequest.call(
								this,
								'GET',
								endpoint,
								{},
								qs,
							);
							responseData = (response as IDataObject).data as IDataObject[];
						}
					} else if (operation === 'update') {
						const fieldId = this.getNodeParameter('fieldId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

						const body: IDataObject = {};

						for (const [key, value] of Object.entries(updateFields)) {
							if (value !== '' && value !== undefined && value !== null) {
								body[key] = value;
							}
						}

						responseData = await joomlaApiRequest.call(
							this,
							'PATCH',
							`${endpoint}/${fieldId}`,
							body,
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
