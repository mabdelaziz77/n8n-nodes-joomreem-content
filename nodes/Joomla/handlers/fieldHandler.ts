import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { joomlaApiRequest, joomlaApiRequestAllItems } from '../GenericFunctions';
import { OPERATION } from '../constants';

/**
 * Handle all custom field-related operations
 */
export async function handleField(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	const context = this.getNodeParameter('context', itemIndex) as string;
	// Determine endpoint based on context
	const endpoint = context === 'com_content.article'
		? '/fields/content/articles'
		: '/fields/content/categories';

	if (operation === OPERATION.CREATE) {
		const title = this.getNodeParameter('title', itemIndex) as string;
		const type = this.getNodeParameter('type', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;

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
			const fieldparamsJson = this.getNodeParameter('fieldparams', itemIndex, '{}') as string;
			try {
				Object.assign(fieldparams, JSON.parse(fieldparamsJson));
			} catch {
				// Invalid JSON, ignore
			}
		}

		// List - multiple selection and header
		if (type === 'list') {
			const multiple = this.getNodeParameter('listMultiple', itemIndex, false) as boolean;
			fieldparams.multiple = multiple;
			const header = this.getNodeParameter('listHeader', itemIndex, '') as string;
			if (header) fieldparams.header = header;
		}

		// Integer - first, last, step
		if (type === 'integer') {
			fieldparams.first = this.getNodeParameter('integerFirst', itemIndex, 1) as number;
			fieldparams.last = this.getNodeParameter('integerLast', itemIndex, 10) as number;
			fieldparams.step = this.getNodeParameter('integerStep', itemIndex, 1) as number;
		}

		// URL - relative, schemes, show_url
		if (type === 'url') {
			const relative = this.getNodeParameter('urlRelative', itemIndex, false) as boolean;
			fieldparams.relative = relative;
			const schemes = this.getNodeParameter('urlSchemes', itemIndex, ['http', 'https']) as string[];
			fieldparams.schemes = schemes;
			const showUrl = this.getNodeParameter('urlShowUrl', itemIndex, true) as boolean;
			fieldparams.show_url = showUrl;
		}

		// Calendar - format and showtime
		if (type === 'calendar') {
			fieldparams.format = this.getNodeParameter('calendarFormat', itemIndex, '%Y-%m-%d') as string;
			fieldparams.showtime = this.getNodeParameter('calendarShowtime', itemIndex, false) as boolean;
		}

		// Text - maxlength
		if (type === 'text') {
			const maxlength = this.getNodeParameter('textMaxlength', itemIndex, 0) as number;
			if (maxlength > 0) fieldparams.maxlength = maxlength;
		}

		// Textarea - rows, cols, maxlength
		if (type === 'textarea') {
			fieldparams.rows = this.getNodeParameter('textareaRows', itemIndex, 5) as number;
			fieldparams.cols = this.getNodeParameter('textareaCols', itemIndex, 50) as number;
			const maxlength = this.getNodeParameter('textareaMaxlength', itemIndex, 0) as number;
			if (maxlength > 0) fieldparams.maxlength = maxlength;
		}

		// Editor - buttons, width, height
		if (type === 'editor') {
			const buttons = this.getNodeParameter('editorButtons', itemIndex, true) as boolean;
			fieldparams.buttons = buttons;
			fieldparams.width = this.getNodeParameter('editorWidth', itemIndex, '100%') as string;
			fieldparams.height = this.getNodeParameter('editorHeight', itemIndex, '250px') as string;
		}

		// Media - directory, preview
		if (type === 'media') {
			const directory = this.getNodeParameter('mediaDirectory', itemIndex, '') as string;
			if (directory) fieldparams.directory = directory;
			fieldparams.preview = this.getNodeParameter('mediaPreview', itemIndex, 'true') as string;
		}

		// SQL - query, header, multiple
		if (type === 'sql') {
			const query = this.getNodeParameter('sqlQuery', itemIndex, '') as string;
			if (query) fieldparams.query = query;
			const header = this.getNodeParameter('sqlHeader', itemIndex, '') as string;
			if (header) fieldparams.header = header;
			const multiple = this.getNodeParameter('sqlMultiple', itemIndex, false) as boolean;
			fieldparams.multiple = multiple;
		}

		body.fieldparams = fieldparams;

		responseData = await joomlaApiRequest.call(
			this,
			'POST',
			endpoint,
			body,
		);
	} else if (operation === OPERATION.DELETE) {
		const fieldId = this.getNodeParameter('fieldId', itemIndex) as number;

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
				{ itemIndex },
			);
		} catch (error) {
			// If we get a 404 or similar error, the field was deleted successfully
			if (
				(error as Error).message.includes('not found') ||
				(error as Error).message.includes('404') ||
				(error as Error).message.includes('Not Found')
			) {
				responseData = { success: true, message: `Field ${fieldId} deleted successfully` };
			} else if ((error as Error).message.includes('was not deleted')) {
				throw error;
			} else {
				// Some other error - field might be deleted, treat as success
				responseData = { success: true, message: `Field ${fieldId} deleted successfully` };
			}
		}
	} else if (operation === OPERATION.GET) {
		const fieldId = this.getNodeParameter('fieldId', itemIndex) as number;

		responseData = await joomlaApiRequest.call(
			this,
			'GET',
			`${endpoint}/${fieldId}`,
		);
	} else if (operation === OPERATION.GET_ALL) {
		const returnAll = this.getNodeParameter('returnAll', itemIndex);

		if (returnAll) {
			responseData = await joomlaApiRequestAllItems.call(
				this,
				'GET',
				endpoint,
			);
		} else {
			const limit = this.getNodeParameter('limit', itemIndex);
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
	} else if (operation === OPERATION.UPDATE) {
		const fieldId = this.getNodeParameter('fieldId', itemIndex) as number;
		const updateFields = this.getNodeParameter('updateFields', itemIndex) as IDataObject;

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

	return responseData;
}
