import type { INodeProperties } from 'n8n-workflow';

export const categoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['category'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new category',
				action: 'Create a category',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a trashed category (must be in Trashed state first)',
				action: 'Delete a category',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a category by ID',
				action: 'Get a category',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many categories',
				action: 'Get many categories',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a category',
				action: 'Update a category',
			},
		],
		default: 'getAll',
	},
];

export const categoryFields: INodeProperties[] = [
	// ----------------------------------
	//         category:get
	// ----------------------------------
	{
		displayName: 'Category ID',
		name: 'categoryId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['category'],
				operation: ['get', 'delete', 'update'],
			},
		},
		description: 'The ID of the category',
	},

	// ----------------------------------
	//         category:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['category'],
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
				resource: ['category'],
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
				resource: ['category'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search in title and description',
			},
			{
				displayName: 'Extension',
				name: 'extension',
				type: 'string',
				default: 'com_content',
				description: 'The extension of the category',
			},
		],
	},

	// ----------------------------------
	//         category:create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['category'],
				operation: ['create'],
			},
		},
		description: 'The title of the category',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['category'],
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
				description: 'The description of the category',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLanguages',
				},
				default: '*',
				description: 'The language of the category',
			},
			{
				displayName: 'Parent Category Name or ID',
				name: 'parent_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCategories',
				},
				default: '',
				description: 'The parent category. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'State',
				name: 'published',
				type: 'options',
				options: [
					{ name: 'Published', value: 1 },
					{ name: 'Unpublished', value: 0 },
					{ name: 'Archived', value: 2 },
					{ name: 'Trashed', value: -2 },
				],
				default: 1,
				description: 'The publish state of the category',
			},
			{
				displayName: 'Associations',
				name: 'associations',
				type: 'json',
				default: '{}',
				description: 'Multilingual associations as JSON object mapping language codes to category IDs. Example: {"en-GB": 123, "ar-AA": 456}',
			},
		],
	},
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		type: 'fixedCollection',
		placeholder: 'Add Custom Field',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['category'],
				operation: ['create'],
			},
		},
		description: 'Set values for category custom fields',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'fieldName',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCategoryCustomFields',
						},
						default: '',
						description: 'The custom field to set. Choose from the list, or specify the field name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
					},
					{
						displayName: 'Value',
						name: 'fieldValue',
						type: 'string',
						default: '',
						description: 'The value for this field. For text: enter text. For list/radio: enter the option value. For checkboxes: enter comma-separated values (e.g., "value1,value2"). For date: use YYYY-MM-DD format.',
					},
				],
			},
		],
	},

	// ----------------------------------
	//         category:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['category'],
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
				description: 'The description of the category',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLanguages',
				},
				default: '*',
				description: 'The language of the category',
			},
			{
				displayName: 'Parent Category Name or ID',
				name: 'parent_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCategories',
				},
				default: '',
				description: 'The parent category. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'State',
				name: 'published',
				type: 'options',
				options: [
					{ name: 'Published', value: 1 },
					{ name: 'Unpublished', value: 0 },
					{ name: 'Archived', value: 2 },
					{ name: 'Trashed', value: -2 },
				],
				default: 1,
				description: 'The publish state of the category',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the category',
			},
			{
				displayName: 'Associations',
				name: 'associations',
				type: 'json',
				default: '{}',
				description: 'Multilingual associations as JSON object mapping language codes to category IDs. Example: {"en-GB": 123, "ar-AA": 456}',
			},
		],
	},
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		type: 'fixedCollection',
		placeholder: 'Add Custom Field',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['category'],
				operation: ['update'],
			},
		},
		description: 'Set values for category custom fields',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'fieldName',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCategoryCustomFields',
						},
						default: '',
						description: 'The custom field to set. Choose from the list, or specify the field name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
					},
					{
						displayName: 'Value',
						name: 'fieldValue',
						type: 'string',
						default: '',
						description: 'The value for this field. For text: enter text. For list/radio: enter the option value. For checkboxes: enter comma-separated values (e.g., "value1,value2"). For date: use YYYY-MM-DD format.',
					},
				],
			},
		],
	},
];
