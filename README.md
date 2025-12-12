# n8n-nodes-joomreem-content

This is an n8n community node by [JoomReem](https://joomreem.com) for [Joomla CMS](https://www.joomla.org/). It enables you to automate workflows that interact with your Joomla website through the Joomla Web Services API.

**Developed by:** [Mohamed Abdelaziz](https://joomreem.com) (admin@joomreem.com)

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

This node supports the following Joomla resources and operations:

| Resource | Operations |
|----------|------------|
| **Article** | Create, Get, Get Many, Update, Delete |
| **Category** | Create, Get, Get Many, Update, Delete |
| **Tag** | Create, Get, Get Many, Update, Delete |
| **Media** | List Files, Upload, Create Folder, Delete |

### Article Features
- **Images**: Set intro and full article images with alt text
- **Associations**: Link multilingual articles via the associations field
- **Meta descriptions**: SEO-friendly meta data support

## Prerequisites

- **Joomla 4.x or 5.x** - This node uses Joomla's native Web Services API which was introduced in Joomla 4.
- **API Authentication Enabled** - Enable the "Web Services Joomla Token" plugin in your Joomla installation.
- **API Token** - Generate an API token from a Super User account.

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-joomreem-content` and confirm

### Manual Installation

```bash
npm install n8n-nodes-joomreem-content
```

## Joomla Setup

### 1. Enable Web Services API

1. Log in to your Joomla Administrator panel
2. Go to **System → Plugins**
3. Search for "Web Services" and enable the plugins for the content types you need:
   - **Web Services - Content** (for articles)
   - **Web Services - Tags** (for tags)
   - **Web Services - Media** (for media files)

> **Note:** This node uses Joomla's API Token authentication (Bearer token), NOT Basic Auth. You do not need to enable the "Web Services - Basic Auth" plugin.

### 2. Generate API Token

1. Go to **Users → Manage**
2. Click on your Super User account
3. Go to the **Joomla API Token** tab
4. Click **Generate** to create a new token
5. Copy the token immediately (it won't be shown again)

### 3. Configure n8n Credentials

1. In n8n, go to **Credentials**
2. Click **Add Credential**
3. Search for "Joomla API"
4. Enter:
   - **Site URL**: Your Joomla website URL (e.g., `https://example.com`)
   - **API Token**: The token you generated

## Usage Examples

### Create an Article with Image

```
Resource: Article
Operation: Create
Title: My New Article
Category: Blog (select from dropdown)
Additional Fields:
  - State: Published
  - Full Article Text: <p>Full HTML content here...</p>
  - Images: {"image_intro": "images/my-image.jpg", "image_intro_alt": "Alt text"}
```

### Link Multilingual Articles

```
Resource: Article
Operation: Update
Article ID: 123
Update Fields:
  - Associations: {"en-GB": "123", "ar-AA": "456"}
```

## Compatibility

| Joomla Version | Supported |
|----------------|-----------|
| 5.x | ✅ Yes |
| 4.x | ✅ Yes |
| 3.x | ❌ No (use com_api extension) |

## Known Limitations

### Media Delete Operation

The Media delete operation may not work reliably due to Joomla API limitations. The Joomla Media API requires adapter paths like `local-images:/folder` which contain colons that cause URL routing issues. For deleting media files/folders, use the Joomla Media Manager UI.

## Resources

- [Joomla Web Services API Documentation](https://docs.joomla.org/J4.x:Joomla_Core_APIs)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Report an Issue](https://github.com/mabdelaziz77/n8n-nodes-joomreem-content/issues)

## License

[MIT](LICENSE.md)

## Author

**Mohamed Abdelaziz**  
Website: [joomreem.com](https://joomreem.com)  
Email: admin@joomreem.com

