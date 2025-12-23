import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	getCategories,
	getLanguages,
	getTags,
	getArticleCustomFields,
	getCategoryCustomFields,
} from './GenericFunctions';

import { articleOperations, articleFields } from './descriptions/ArticleDescription';
import { categoryOperations, categoryFields } from './descriptions/CategoryDescription';
import { tagOperations, tagFields } from './descriptions/TagDescription';
import { mediaOperations, mediaFields } from './descriptions/MediaDescription';
import { fieldOperations, fieldFields } from './descriptions/FieldDescription';

import { RESOURCE } from './constants';
import {
	handleArticle,
	handleCategory,
	handleTag,
	handleMedia,
	handleField,
} from './handlers';

// Type for resource handler functions
type ResourceHandler = (
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
) => Promise<IDataObject | IDataObject[]>;

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
						value: RESOURCE.ARTICLE,
					},

					{
						name: 'Category',
						value: RESOURCE.CATEGORY,
					},
					{
						name: 'Custom Field',
						value: RESOURCE.FIELD,
					},
					{
						name: 'Media',
						value: RESOURCE.MEDIA,
					},
					{
						name: 'Tag',
						value: RESOURCE.TAG,
					},
				],
				default: RESOURCE.ARTICLE,
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
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Map resources to their handlers
		const resourceHandlers: Record<string, ResourceHandler> = {
			[RESOURCE.ARTICLE]: handleArticle,
			[RESOURCE.CATEGORY]: handleCategory,
			[RESOURCE.TAG]: handleTag,
			[RESOURCE.MEDIA]: handleMedia,
			[RESOURCE.FIELD]: handleField,
		};

		const handler = resourceHandlers[resource];

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] = {};

				if (handler) {
					responseData = await handler.call(this, operation, i);
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
