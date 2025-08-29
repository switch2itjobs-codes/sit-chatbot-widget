<<<<<<< HEAD
# Simple Chatbot Widget

A lightweight, customizable chatbot widget for websites. This package provides an easy way to add a chat interface to your website with minimal setup.

## Features

- **Simple Integration**: Add the widget to your website with just a few lines of code
- **Customizable**: Change the appearance and behavior to match your brand
- **Responsive**: Works on desktop and mobile devices
- **Webhook Integration**: Connect to your own backend or AI service
- **Suggested Messages**: Guide users with clickable message suggestions

## Quick Start

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

## Example

See the included `example.html` file for a complete implementation example.

## Webhook Integration

The widget sends messages to your webhook URL as POST requests with the following JSON structure:

```json
{
    "message": "User's message text",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "widgetVersion": "1.0.0"
}
```

Your webhook should respond with JSON in this format:

```json
{
    "response": "Bot's response message",
    "suggestedMessages": ["Optional", "Suggested", "Replies"]
}
```

## License

MIT
=======
# sit-chatbot-widget
>>>>>>> 51e6c89c843cdce0c463fc7691d06b4be15ae046
