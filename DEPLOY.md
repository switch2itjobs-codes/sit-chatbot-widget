# Vercel Deployment Guide

## Quick Deploy (Easiest Method)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: Visit [https://vercel.com](https://vercel.com) and sign in (or create an account)

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Connect your GitHub account if not already connected
   - Select the repository: `switch2itjobs-codes/sit-chatbot-widget`

3. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: `./` (default)
   - Build Command: Leave empty (no build needed)
   - Output Directory: Leave empty (serving static files)

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)

5. **Get Your URL**:
   - Once deployed, you'll get a URL like: `https://sit-chatbot-widget-xxxxx.vercel.app`
   - Your widget will be available at: `https://sit-chatbot-widget-xxxxx.vercel.app/chatbot-widget.js`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd "/Users/rahul/SIT - AI Chatbot/sit-chatbot-widget"
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Press Enter for default or type a custom name)
   - Directory? (Press Enter for `./`)
   - Override settings? **No**

5. **Production Deploy** (optional):
   ```bash
   vercel --prod
   ```

## Using the Deployed Widget

Once deployed, use this embed code on your website:

```html
<!-- Chatbot Widget Integration -->
<script src="https://YOUR-VERCEL-URL.vercel.app/chatbot-widget.js"></script>
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

Replace `YOUR-VERCEL-URL` with your actual Vercel deployment URL.

## Testing

Visit your Vercel deployment URL to see the demo page:
- `https://YOUR-VERCEL-URL.vercel.app/` - Demo page with test buttons
- `https://YOUR-VERCEL-URL.vercel.app/chatbot-widget.js` - Widget file

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

- **CORS Issues**: The `vercel.json` file already includes CORS headers
- **Cache Issues**: Add `?v=timestamp` to the script URL to bust cache
- **404 Errors**: Make sure the file paths are correct in your embed code

