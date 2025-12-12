import type { INodeProperties } from 'n8n-workflow';

export const mediaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['media'],
			},
		},
		options: [
			{
				name: 'Create Folder',
				value: 'createFolder',
				description: 'Create a new folder',
				action: 'Create a folder',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a file or folder (Note: Due to Joomla API limitations with special characters in URLs, this operation may not work reliably. Consider using Joomla Media Manager for delete operations.)',
				action: 'Delete a file or folder',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List files and folders in a directory',
				action: 'List files and folders',
			},
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a file',
				action: 'Upload a file',
			},
		],
		default: 'list',
	},
];

export const mediaFields: INodeProperties[] = [
	// ----------------------------------
	//         media:list
	// ----------------------------------
	{
		displayName: 'Folder Path',
		name: 'folderPath',
		type: 'string',
		required: true,
		default: 'images',
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['list'],
			},
		},
		description: 'The path to list files from (e.g., "images", "images/banners")',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Filter files by name',
			},
		],
	},

	// ----------------------------------
	//         media:upload
	// ----------------------------------
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['upload'],
			},
		},
		description: 'Name of the binary property containing the file to upload',
	},
	{
		displayName: 'Destination Folder',
		name: 'destinationFolder',
		type: 'string',
		default: 'images',
		required: true,
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['upload'],
			},
		},
		description: 'The folder path to upload the file to (e.g., "images", "images/articles")',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['upload'],
			},
		},
		options: [
			{
				displayName: 'Custom File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				description: 'Override the file name (leave empty to use original name)',
			},
		],
	},

	// ----------------------------------
	//         media:createFolder
	// ----------------------------------
	{
		displayName: 'Parent Folder',
		name: 'parentFolder',
		type: 'string',
		default: 'images',
		required: true,
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['createFolder'],
			},
		},
		description: 'The parent folder path (e.g., "images")',
	},
	{
		displayName: 'Folder Name',
		name: 'folderName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['createFolder'],
			},
		},
		description: 'The name of the new folder to create',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['createFolder'],
			},
		},
		options: [
			{
				displayName: 'Ignore If Exists',
				name: 'ignoreIfExists',
				type: 'boolean',
				default: true,
				description: 'Whether to ignore the error if the folder already exists (returns success instead of error)',
			},
		],
	},

	// ----------------------------------
	//         media:delete
	// ----------------------------------
	{
		displayName: 'File/Folder Path',
		name: 'path',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['delete'],
			},
		},
		description: 'The full path to the file or folder to delete (e.g., "images/my-image.jpg")',
	},
];
