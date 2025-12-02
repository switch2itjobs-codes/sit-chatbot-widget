# SIT Chatbot Widget

A lightweight, customizable chatbot widget for websites. This package provides an easy way to add a chat interface to your website with minimal setup.

## Features

- **Simple Integration**: Add the widget to your website with just a few lines of code
- **Customizable**: Change the appearance and behavior to match your brand
- **Responsive**: Works on desktop and mobile devices
- **Webhook Integration**: Connect to your own backend or AI service
- **Mobile Optimized**: Fixed mobile interaction issues - no blocking of page interactions

## Quick Start

### Option 1: Use Vercel CDN (Recommended)

```html
<!-- Chatbot Widget Integration -->
<script src="https://your-vercel-url.vercel.app/chatbot-widget.js"></script>
<script>
    ChatbotWidget.init({
        webhookUrl: 'https://n8n.srv952957.hstgr.cloud/webhook/10590cff-0eef-416a-88b0-cb074ea7f71f/chat',
        logo: 'http://switch2itjobs.com/wp-content/uploads/2024/05/Untitled-design-48.png',
        agentName: 'SIT Career Assistant',
        welcomeMessages: [
            '👋 Hi! I\'m your SIT Career Assistant, here to guide you into IT jobs!',
            'Want to know how SIT can help you land your dream IT job? 🌟'
        ],
        autoOpen: false,
        showWelcomeMessage: true
    });
</script>
```

### Option 2: Local File

1. Include the script in your HTML file:

```html
<script src="chatbot-widget.js"></script>
```

2. Initialize the widget with your configuration:

```html
<script>
    ChatbotWidget.init({
        webhookUrl: 'https://your-api-endpoint.com/webhook',
        agentName: 'Support Assistant',
        welcomeMessages: [
            'Hello! How can I help you today?'
        ]
    });
</script>
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `webhookUrl` | String | **Required**. The URL to send user messages to |
| `logo` | String | Custom logo (data URL or image URL) |
| `agentName` | String | Name displayed in the chat header |
| `welcomeMessages` | Array | Messages shown when chat is first opened |
| `suggestedMessages` | Array | Clickable message suggestions |
| `theme` | Object | Custom colors for the widget |
| `position` | Object | Custom position for the chat bubble |
| `autoOpen` | Boolean | Whether to automatically open the chat |
| `showWelcomeMessage` | Boolean | Whether to show welcome messages |

## Deployment to Vercel

1. Install Vercel CLI (if not already installed):
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Follow the prompts to create a new project

4. Your widget will be available at: `https://your-project.vercel.app/chatbot-widget.js`

## Example

See the included `example.html` and `index.html` files for complete implementation examples.

## Webhook Integration

The widget sends messages to your webhook URL as POST requests with the following JSON structure:

```json
{
    "chatInput": "User's message text",
    "sessionId": "unique-session-id",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "source": "chatbot-widget"
}
```

Your webhook should respond with JSON in this format:

```json
{
    "output": "Bot's response message",
    "suggestedMessages": ["Optional", "Suggested", "Replies"]
}
```

## License

MIT
