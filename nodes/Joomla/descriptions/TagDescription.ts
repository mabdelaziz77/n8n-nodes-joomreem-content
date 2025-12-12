import type { INodeProperties } from 'n8n-workflow';

export const tagOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['tag'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new tag',
				action: 'Create a tag',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a tag',
				action: 'Delete a tag',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a tag by ID',
				action: 'Get a tag',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many tags',
				action: 'Get many tags',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a tag',
				action: 'Update a tag',
			},
		],
		default: 'getAll',
	},
];

export const tagFields: INodeProperties[] = [
	// ----------------------------------
	//         tag:get
	// ----------------------------------
	{
		displayName: 'Tag ID',
		name: 'tagId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['get', 'delete', 'update'],
			},
		},
		description: 'The ID of the tag',
	},

	// ----------------------------------
	//         tag:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['tag'],
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
				resource: ['tag'],
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
				resource: ['tag'],
				operation: ['getAll'],
			},
		},
		options: [
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
				displayName: 'Parent Tag Name or ID',
				name: 'parent_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTags',
				},
				default: '',
				description: 'Filter by parent tag. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search in title and description',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Published', value: '1' },
					{ name: 'Unpublished', value: '0' },
				],
				default: '',
				description: 'Filter by publish state',
			},
		],
	},

	// ----------------------------------
	//         tag:create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['create'],
			},
		},
		description: 'The title of the tag',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tag'],
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
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				description: 'The description of the tag',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLanguages',
				},
				default: '*',
				description: 'The language of the tag',
			},
			{
				displayName: 'Parent Tag Name or ID',
				name: 'parent_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTags',
				},
				default: '',
				description: 'The parent tag. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'State',
				name: 'published',
				type: 'options',
				options: [
					{ name: 'Published', value: 1 },
					{ name: 'Unpublished', value: 0 },
				],
				default: 1,
				description: 'The publish state of the tag',
			},
		],
	},

	// ----------------------------------
	//         tag:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tag'],
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
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				description: 'The description of the tag',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLanguages',
				},
				default: '*',
				description: 'The language of the tag',
			},
			{
				displayName: 'Parent Tag Name or ID',
				name: 'parent_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTags',
				},
				default: '',
				description: 'The parent tag. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'State',
				name: 'published',
				type: 'options',
				options: [
					{ name: 'Published', value: 1 },
					{ name: 'Unpublished', value: 0 },
				],
				default: 1,
				description: 'The publish state of the tag',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the tag',
			},
		],
	},
];
