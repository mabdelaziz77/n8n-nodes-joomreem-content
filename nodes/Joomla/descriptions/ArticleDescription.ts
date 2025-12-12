import type { INodeProperties } from 'n8n-workflow';

export const articleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['article'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new article',
				action: 'Create an article',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a trashed article (must be in Trashed state first)',
				action: 'Delete an article',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an article by ID',
				action: 'Get an article',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many articles',
				action: 'Get many articles',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an article',
				action: 'Update an article',
			},
		],
		default: 'getAll',
	},
];

export const articleFields: INodeProperties[] = [
	// ----------------------------------
	//         article:get
	// ----------------------------------
	{
		displayName: 'Article ID',
		name: 'articleId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['article'],
				operation: ['get', 'delete', 'update'],
			},
		},
		description: 'The ID of the article',
	},

	// ----------------------------------
	//         article:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['article'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['article'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 20,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['article'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Category Name or ID',
				name: 'catid',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCategories',
				},
				default: '',
				description: 'Filter by category. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Featured',
				name: 'featured',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Featured Only', value: '1' },
					{ name: 'Not Featured', value: '0' },
				],
				default: '',
				description: 'Filter by featured status',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLanguages',
				},
				default: '',
				description: 'Filter by language',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search in title and content',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Published', value: '1' },
					{ name: 'Unpublished', value: '0' },
					{ name: 'Archived', value: '2' },
					{ name: 'Trashed', value: '-2' },
				],
				default: '',
				description: 'Filter by publish state',
			},
		],
	},

	// ----------------------------------
	//         article:create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['article'],
				operation: ['create'],
			},
		},
		description: 'The title of the article',
	},
	{
		displayName: 'Category Name or ID',
		name: 'catid',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCategories',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['article'],
				operation: ['create'],
			},
		},
		description: 'The category for the article. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['article'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Alias',
				name: 'alias',
				type: 'string',
				default: '',
				description: 'URL-friendly alias (auto-generated from title if empty)',
			},
			{
				displayName: 'Featured',
				name: 'featured',
				type: 'boolean',
				default: false,
				description: 'Whether the article is featured',
			},
			{
				displayName: 'Full Article Text',
				name: 'articletext',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				description: 'The full article text (HTML allowed)',
			},
			{
				displayName: 'Intro Text',
				name: 'introtext',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				description: 'The intro/teaser text for the article',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLanguages',
				},
				default: '*',
				description: 'The language of the article',
			},
			{
				displayName: 'Meta Description',
				name: 'metadesc',
				type: 'string',
				default: '',
				description: 'Meta description for SEO',
			},
			{
				displayName: 'Meta Keywords',
				name: 'metakey',
				type: 'string',
				default: '',
				description: 'Meta keywords for SEO (comma-separated)',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'Published', value: 1 },
					{ name: 'Unpublished', value: 0 },
					{ name: 'Archived', value: 2 },
					{ name: 'Trashed', value: -2 },
				],
				default: 1,
				description: 'The publish state of the article',
			},
			{
				displayName: 'Images',
				name: 'images',
				type: 'json',
				default: '{}',
				description: 'Article images as JSON. Example: {"image_intro": "images/articles/my-image.jpg", "image_intro_alt": "Alt text", "image_fulltext": "images/articles/my-image.jpg", "image_fulltext_alt": "Alt text"}',
			},
		],
	},

	// ----------------------------------
	//         article:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['article'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Alias',
				name: 'alias',
				type: 'string',
				default: '',
				description: 'URL-friendly alias',
			},
			{
				displayName: 'Category Name or ID',
				name: 'catid',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCategories',
				},
				default: '',
				description: 'The category for the article. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Featured',
				name: 'featured',
				type: 'boolean',
				default: false,
				description: 'Whether the article is featured',
			},
			{
				displayName: 'Full Article Text',
				name: 'articletext',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				description: 'The full article text (HTML allowed)',
			},
			{
				displayName: 'Intro Text',
				name: 'introtext',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				description: 'The intro/teaser text for the article',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLanguages',
				},
				default: '*',
				description: 'The language of the article',
			},
			{
				displayName: 'Meta Description',
				name: 'metadesc',
				type: 'string',
				default: '',
				description: 'Meta description for SEO',
			},
			{
				displayName: 'Meta Keywords',
				name: 'metakey',
				type: 'string',
				default: '',
				description: 'Meta keywords for SEO (comma-separated)',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'Published', value: 1 },
					{ name: 'Unpublished', value: 0 },
					{ name: 'Archived', value: 2 },
					{ name: 'Trashed', value: -2 },
				],
				default: 1,
				description: 'The publish state of the article',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the article',
			},
			{
				displayName: 'Associations',
				name: 'associations',
				type: 'json',
				default: '{}',
				description: 'Multilingual associations as JSON object mapping language codes to article IDs. Example: {"en-GB": 123, "ar-AA": 456}',
			},
			{
				displayName: 'Images',
				name: 'images',
				type: 'json',
				default: '{}',
				description: 'Article images as JSON. Example: {"image_intro": "images/articles/my-image.jpg", "image_intro_alt": "Alt text", "image_fulltext": "images/articles/my-image.jpg", "image_fulltext_alt": "Alt text"}',
			},
		],
	},
];
