/**
 * Constants for Joomla node resources and operations
 * Provides type-safe string constants to prevent typos and improve maintainability
 */

export const RESOURCE = {
	ARTICLE: 'article',
	CATEGORY: 'category',
	TAG: 'tag',
	MEDIA: 'media',
	FIELD: 'field',
} as const;

export const OPERATION = {
	CREATE: 'create',
	UPDATE: 'update',
	DELETE: 'delete',
	GET: 'get',
	GET_ALL: 'getAll',
	LIST: 'list',
	UPLOAD: 'upload',
	CREATE_FOLDER: 'createFolder',
} as const;

// Type exports for use in handlers
export type ResourceType = typeof RESOURCE[keyof typeof RESOURCE];
export type OperationType = typeof OPERATION[keyof typeof OPERATION];
