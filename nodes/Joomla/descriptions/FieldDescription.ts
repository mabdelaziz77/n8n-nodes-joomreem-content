import type { INodeProperties } from 'n8n-workflow';

export const fieldOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['field'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new custom field',
				action: 'Create a field',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a trashed custom field (must be in Trashed state first)',
				action: 'Delete a field',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a custom field by ID',
				action: 'Get a field',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many custom fields',
				action: 'Get many fields',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a custom field',
				action: 'Update a field',
			},
		],
		default: 'getAll',
	},
];

export const fieldFields: INodeProperties[] = [
	// ----------------------------------
	//         field:context (for all operations)
	// ----------------------------------
	{
		displayName: 'Context',
		name: 'context',
		type: 'options',
		required: true,
		options: [
			{
				name: 'Article',
				value: 'com_content.article',
				description: 'Custom fields for articles',
			},
			{
				name: 'Category',
				value: 'com_content.categories',
				description: 'Custom fields for categories',
			},
		],
		default: 'com_content.article',
		displayOptions: {
			show: {
				resource: ['field'],
			},
		},
		description: 'The content context for custom fields',
	},

	// ----------------------------------
	//         field:get
	// ----------------------------------
	{
		displayName: 'Field ID',
		name: 'fieldId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['get', 'delete', 'update'],
			},
		},
		description: 'The ID of the custom field',
	},

	// ----------------------------------
	//         field:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['field'],
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
				resource: ['field'],
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

	// ----------------------------------
	//         field:create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
			},
		},
		description: 'The display title of the field',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		options: [
			{ name: 'Text', value: 'text' },
			{ name: 'Textarea', value: 'textarea' },
			{ name: 'Editor', value: 'editor' },
			{ name: 'List', value: 'list' },
			{ name: 'Radio', value: 'radio' },
			{ name: 'Checkboxes', value: 'checkboxes' },
			{ name: 'Calendar', value: 'calendar' },
			{ name: 'Media', value: 'media' },
			{ name: 'URL', value: 'url' },
			{ name: 'Email', value: 'email' },
			{ name: 'Integer', value: 'integer' },
			{ name: 'Color', value: 'color' },
			{ name: 'User', value: 'user' },
			{ name: 'SQL', value: 'sql' },
		],
		default: 'text',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
			},
		},
		description: 'The type of custom field',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Default Value',
				name: 'default_value',
				type: 'string',
				default: '',
				description: 'The default value for this field',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description/help text for the field',
			},
			{
				displayName: 'Group ID',
				name: 'group_id',
				type: 'number',
				default: 0,
				description: 'The field group ID (0 for no group)',
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'The label displayed for this field (auto-generated from title if empty)',
			},
			{
				displayName: 'Name (Machine Name)',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The machine name for the field (auto-generated from title if empty)',
			},
			{
				displayName: 'Required',
				name: 'required',
				type: 'boolean',
				default: false,
				description: 'Whether the field is required',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'Published', value: 1 },
					{ name: 'Unpublished', value: 0 },
					{ name: 'Trashed', value: -2 },
				],
				default: 1,
				description: 'The publish state of the field',
			},
		],
	},
	// Field Options - only for list/radio/checkboxes
	{
		displayName: 'Field Options (JSON)',
		name: 'fieldparams',
		type: 'json',
		default: '{"options": {"options0": {"name": "Option 1", "value": "option1"}, "options1": {"name": "Option 2", "value": "option2"}}}',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['list', 'radio', 'checkboxes'],
			},
		},
		description: 'Define the options for list/radio/checkboxes fields. Format: {"options": {"options0": {"name": "Label", "value": "value"}, ...}}',
	},
	// Multiple selection - for list type
	{
		displayName: 'Allow Multiple Selection',
		name: 'listMultiple',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['list'],
			},
		},
		description: 'Whether to allow selecting multiple values',
	},
	// Integer type options
	{
		displayName: 'First Value',
		name: 'integerFirst',
		type: 'number',
		default: 1,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['integer'],
			},
		},
		description: 'The lowest value in the range (required for integer fields)',
	},
	{
		displayName: 'Last Value',
		name: 'integerLast',
		type: 'number',
		default: 10,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['integer'],
			},
		},
		description: 'The highest value in the range (required for integer fields)',
	},
	{
		displayName: 'Step Increment',
		name: 'integerStep',
		type: 'number',
		default: 1,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['integer'],
			},
		},
		description: 'Increment between each value in the range',
	},
	// URL type options
	{
		displayName: 'Allow Relative URLs',
		name: 'urlRelative',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['url'],
			},
		},
		description: 'Whether to allow relative URLs instead of requiring fully qualified URLs',
	},
	// Calendar type options
	{
		displayName: 'Date Format',
		name: 'calendarFormat',
		type: 'string',
		default: '%Y-%m-%d',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['calendar'],
			},
		},
		description: 'Date format using PHP date format codes (e.g., %Y-%m-%d for 2024-12-25)',
	},
	{
		displayName: 'Show Time',
		name: 'calendarShowtime',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['calendar'],
			},
		},
		description: 'Whether to include time selection in the date picker',
	},
	// URL - schemes
	{
		displayName: 'Allowed URL Schemes',
		name: 'urlSchemes',
		type: 'multiOptions',
		options: [
			{ name: 'HTTP', value: 'http' },
			{ name: 'HTTPS', value: 'https' },
			{ name: 'FTP', value: 'ftp' },
			{ name: 'FTPS', value: 'ftps' },
			{ name: 'FILE', value: 'file' },
			{ name: 'MAILTO', value: 'mailto' },
		],
		default: ['http', 'https'],
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['url'],
			},
		},
		description: 'URL protocols/schemes to allow',
	},
	{
		displayName: 'Show URL in Frontend',
		name: 'urlShowUrl',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['url'],
			},
		},
		description: 'Whether to display the URL text in the frontend',
	},
	// List - header
	{
		displayName: 'Header/Placeholder Text',
		name: 'listHeader',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['list'],
			},
		},
		description: 'Placeholder text shown as the first option (e.g., "Please select...")',
	},
	// Text - maxlength
	{
		displayName: 'Max Length',
		name: 'textMaxlength',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['text'],
			},
		},
		description: 'Maximum number of characters allowed (0 = unlimited)',
	},
	// Textarea options
	{
		displayName: 'Rows',
		name: 'textareaRows',
		type: 'number',
		default: 5,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['textarea'],
			},
		},
		description: 'Number of visible text rows',
	},
	{
		displayName: 'Columns',
		name: 'textareaCols',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['textarea'],
			},
		},
		description: 'Number of visible text columns',
	},
	{
		displayName: 'Max Length',
		name: 'textareaMaxlength',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['textarea'],
			},
		},
		description: 'Maximum number of characters allowed (0 = unlimited)',
	},
	// Editor options
	{
		displayName: 'Show Buttons',
		name: 'editorButtons',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['editor'],
			},
		},
		description: 'Whether to show editor buttons (article, image, pagebreak, readmore)',
	},
	{
		displayName: 'Width',
		name: 'editorWidth',
		type: 'string',
		default: '100%',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['editor'],
			},
		},
		description: 'Width of the editor (e.g., 100% or 500px)',
	},
	{
		displayName: 'Height',
		name: 'editorHeight',
		type: 'string',
		default: '250px',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['editor'],
			},
		},
		description: 'Height of the editor (e.g., 250px)',
	},
	// Media options
	{
		displayName: 'Directory',
		name: 'mediaDirectory',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['media'],
			},
		},
		description: 'Limit selection to this directory within /images/',
	},
	{
		displayName: 'Show Preview',
		name: 'mediaPreview',
		type: 'options',
		options: [
			{ name: 'Yes', value: 'true' },
			{ name: 'No', value: 'false' },
		],
		default: 'true',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['media'],
			},
		},
		description: 'Whether to show image preview',
	},
	// SQL options
	{
		displayName: 'SQL Query',
		name: 'sqlQuery',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['sql'],
			},
		},
		description: 'SQL query to get options (e.g., SELECT id AS value, title AS text FROM #__content)',
	},
	{
		displayName: 'Header/Placeholder',
		name: 'sqlHeader',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['sql'],
			},
		},
		description: 'Placeholder text for the dropdown',
	},
	{
		displayName: 'Allow Multiple',
		name: 'sqlMultiple',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['create'],
				type: ['sql'],
			},
		},
		description: 'Whether to allow selecting multiple values',
	},

	// ----------------------------------
	//         field:update
	// ----------------------------------
	{
		displayName: 'Update Options',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['field'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Default Value',
				name: 'default_value',
				type: 'string',
				default: '',
				description: 'The default value for this field',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description/help text for the field',
			},
			{
				displayName: 'Group ID',
				name: 'group_id',
				type: 'number',
				default: 0,
				description: 'The field group ID (0 for no group)',
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'The label displayed for this field',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The machine name of the field',
			},
			{
				displayName: 'Required',
				name: 'required',
				type: 'boolean',
				default: false,
				description: 'Whether the field is required',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'Published', value: 1 },
					{ name: 'Unpublished', value: 0 },
					{ name: 'Trashed', value: -2 },
				],
				default: 1,
				description: 'The publish state of the field',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The display title of the field',
			},
		],
	},
];
