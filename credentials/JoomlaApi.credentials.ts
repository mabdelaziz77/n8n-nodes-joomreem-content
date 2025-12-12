import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class JoomlaApi implements ICredentialType {
	name = 'joomlaApi';
	displayName = 'Joomla API';
	documentationUrl = 'https://docs.joomla.org/J4.x:Joomla_Core_APIs';
	properties: INodeProperties[] = [
		{
			displayName: 'Site URL',
			name: 'siteUrl',
			type: 'string',
			default: '',
			placeholder: 'https://example.com',
			description: 'The base URL of your Joomla website (without trailing slash)',
			required: true,
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Joomla API Token generated from User Profile → Joomla API Token tab',
			required: true,
		},
		{
			displayName: 'Ignore SSL Issues',
			name: 'skipSslVerification',
			type: 'boolean',
			default: false,
			description: 'Whether to skip SSL certificate verification (use for self-signed certificates or local development)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.siteUrl}}',
			url: '/api/index.php/v1/content/articles',
			method: 'GET',
			qs: {
				'page[limit]': 1,
			},
			skipSslCertificateValidation: '={{$credentials.skipSslVerification}}',
		},
	};
}

