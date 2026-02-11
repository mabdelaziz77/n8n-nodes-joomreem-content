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
| **Custom Field** | Create, Get, Get Many, Update, Delete |
| **Tag** | Create, Get, Get Many, Update, Delete |
| **Media** | List Files, Upload, Create Folder, Delete |

### Article Features
- **Images**: Set intro and full article images with alt text
- **Associations**: Link multilingual articles via the associations field
- **Custom Fields**: Set custom field values when creating/updating articles
- **Meta descriptions**: SEO-friendly meta data support

### Category Features
- **Custom Fields**: Set custom field values for categories

### Custom Field Features
Create and manage custom field definitions with type-specific options:

| Field Type | Options |
|------------|---------|
| **Text** | Max Length |
| **Textarea** | Rows, Columns, Max Length |
| **Editor** | Show Buttons, Width, Height |
| **Integer** | First Value, Last Value, Step |
| **List** | Options, Multiple, Header/Placeholder |
| **Radio** | Options |
| **Checkboxes** | Options |
| **Calendar** | Date Format, Show Time |
| **URL** | Allowed Schemes, Relative URLs, Show URL |
| **Media** | Directory, Preview |
| **SQL** | Query, Header, Multiple |
| **Color** | - |
| **Email** | - |
| **User** | - |

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

### Create a Custom Field

```
Resource: Custom Field
Operation: Create
Context: Article
Title: Rating
Type: Integer
First Value: 1
Last Value: 5
Step: 1
```

### Create a List Field with Options

```
Resource: Custom Field
Operation: Create
Context: Article
Title: Status
Type: List
Field Options: {"options": {"options0": {"name": "Draft", "value": "draft"}, "options1": {"name": "Review", "value": "review"}}}
Header: "Select a status..."
Multiple: false
```

## Compatibility

| Joomla Version | Supported |
|----------------|-----------|
| 5.x | ✅ Yes |
| 4.x | ✅ Yes |
| 3.x | ❌ No (use com_api extension) |

## Known Limitations

### Delete Behavior

Joomla requires items to be **trashed before permanently deleting**. The Delete operation will only work on items that are already in the Trashed state. To delete an item:
1. First use Update to set `state = -2` (Trashed)
2. Then use Delete to permanently remove it

### Media Delete Operation

The Media delete operation may not work reliably due to Joomla API limitations. The Joomla Media API requires adapter paths like `local-images:/folder` which contain colons that cause URL routing issues. For deleting media files/folders, use the Joomla Media Manager UI.

## 🎬 Video Tutorials

Check out these tutorials to see the node in action:

- **[Bulk Edit Authors](https://youtu.be/W77OyrWgYFM)** – Automate bulk author updates across Joomla articles using n8n
- **[Joomla Trash Cleaner](https://youtu.be/c8PKW7ldC4U)** – Automatically clean up trashed articles and categories in Joomla

## Resources

- [Joomla Web Services API Documentation](https://docs.joomla.org/J4.x:Joomla_Core_APIs)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Report an Issue](https://github.com/mabdelaziz77/n8n-nodes-joomreem-content/issues)

## 🤝 Commercial Support & Services

Need help automating your Joomla workflow?

While this node is open-source and free to use, setting up a robust, self-hosted automation pipeline can be complex. I offer professional consulting services to help you build:

* **Custom AI Content Factories:** Turn your YouTube channel or RSS feeds into a fully automated, multilingual blog.
* **Complex Integrations:** Connect Joomla to CRMs, Payments (Stripe/PayPal), or Marketing tools via n8n.
* **Self-Hosted Setup:** Secure installation of n8n on your own VPS (DigitalOcean/Hetzner) to save on monthly SaaS fees.

**[Hire me on Upwork](https://www.upwork.com/freelancers/~0159bcc4ee43c02f66?mp_source=share)** to discuss your project.

---

## ❤️ Support the Project

If this node saved you time or money, consider supporting its development. Your sponsorship helps maintain the code, add new features (like Custom Fields support), and keep it free for the community.

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-GitHub-pink?style=for-the-badge&logo=github)](https://github.com/sponsors/mabdelaziz77)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://paypal.me/mabdelaziz77)

## License

[MIT](LICENSE.md)

## Author

**Mohamed Abdelaziz**  
Website: [joomreem.com](https://joomreem.com)  
Email: admin@joomreem.com

