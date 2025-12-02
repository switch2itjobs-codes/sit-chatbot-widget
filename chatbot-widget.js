/*!
 * Chatbot Widget v1.0.0
 * CDN-Ready AI Chat Widget
 * Copyright (c) 2024
 * Licensed under MIT License
 */

(function(window, document) {
    'use strict';
    
    // Version information
    const WIDGET_VERSION = '1.0.0';
    const WIDGET_NAME = 'ChatbotWidget';
    
    // Prevent multiple initialization
    if (window[WIDGET_NAME]) {
        console.warn(`${WIDGET_NAME} v${WIDGET_VERSION} is already loaded.`);
        return;
    }
    
    // Main widget object
    window[WIDGET_NAME] = {
        version: WIDGET_VERSION,
        
        config: {
            webhookUrl: 'https://n8n.srv952957.hstgr.cloud/webhook/10590cff-0eef-416a-88b0-cb074ea7f71f/chat',
            logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNiIgZmlsbD0iIzFhMWExYSIvPgo8cGF0aCBkPSJNMTYgOGMtNC40MTggMC04IDMuNTgyLTggOHMzLjU4MiA4IDggOCA4LTMuNTgyIDgtOC0zLjU4Mi04LTgtOHptMCAxNGMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNnoiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTQiIHI9IjEuNSIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNCIgcj0iMS41IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMThjMCAxLjEwNSAxLjc5MSAyIDQgMnM0LS44OTUgNC0yIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=',
            agentName: 'AI Assistant',
            welcomeMessages: [
                '👋 Hi! I am your AI assistant, how can I help you today?',
                'Feel free to ask me anything!'
            ],
            suggestedMessages: [
                'What can you help me with?',
                'Tell me about your services',
                'How does this work?'
            ],
            theme: {
                primaryColor: '#1a1a1a',
                backgroundColor: '#ffffff',
                textColor: '#374151'
            },
            position: {
                bottom: '20px',
                right: '20px'
            },
            autoOpen: false,
            showWelcomeMessage: true,
            cacheEnabled: true,
            cacheExpiry: 300000 // 5 minutes
        },
        
        // Response cache for faster repeated queries
        responseCache: new Map(),
        
        // Performance metrics
        performanceMetrics: {
            messagesSent: 0,
            averageResponseTime: 0,
            cacheHits: 0
        },
        
        // Initialize the widget
        init: function(userConfig) {
            try {
                // Generate session ID
                this.sessionId = this.generateSessionId();
                
                // Merge user config with defaults
                this.config = this._deepMerge(this.config, userConfig || {});
                
                // Initialize message tracking
                this.lastMessageSender = null;
                
                // Validate required config
                if (!this.config.webhookUrl || this.config.webhookUrl === 'https://your-webhook-url.com/webhook') {
                    console.warn(`${WIDGET_NAME}: Please provide a valid webhookUrl in the configuration.`);
                }
                
                // Wait for DOM to be ready
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.createWidget());
                } else {
                    this.createWidget();
                }
                
                console.log(`${WIDGET_NAME} v${WIDGET_VERSION} initialized successfully.`);
            } catch (error) {
                console.error(`${WIDGET_NAME} initialization failed:`, error);
            }
        },
        
        // Generate session ID
        generateSessionId: function() {
            return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        },

        // Deep merge utility
        _deepMerge: function(target, source) {
            const result = Object.assign({}, target);
            
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        result[key] = this._deepMerge(target[key] || {}, source[key]);
                    } else {
                        result[key] = source[key];
                    }
                }
            }
            
            return result;
        },
        
        // Optimized DOM element creation
        _createElement: function(tag, options = {}) {
            const element = document.createElement(tag);
            
            if (options.id) element.id = options.id;
            if (options.className) element.className = options.className;
            if (options.innerHTML) element.innerHTML = options.innerHTML;
            if (options.textContent) element.textContent = options.textContent;
            
            return element;
        },
        
        // Efficient event listener management
        _addEventListenerOnce: function(element, event, handler) {
            if (!this._eventListeners) this._eventListeners = new WeakMap();
            
            if (!this._eventListeners.has(element)) {
                this._eventListeners.set(element, new Set());
            }
            
            const listeners = this._eventListeners.get(element);
            const eventKey = `${event}_${handler.toString()}`;
            
            if (!listeners.has(eventKey)) {
                element.addEventListener(event, handler, { passive: true });
                listeners.add(eventKey);
            }
        },

        _debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        _throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        },
        
        // Mobile device detection
        _isMobile: function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768 && 'ontouchstart' in window);
        },
        
        // Enhanced touch support for better mobile interactions
        _addTouchSupport: function(element, callback) {
            if (!element || typeof callback !== 'function') return;
            
            let touchStartTime = 0;
            let touchMoved = false;
            
            // Add visual feedback for touch
            const addTouchFeedback = () => {
                element.style.transform = 'scale(0.95)';
                element.style.opacity = '0.8';
                element.style.transition = 'transform 0.1s ease, opacity 0.1s ease';
            };
            
            const removeTouchFeedback = () => {
                element.style.transform = '';
                element.style.opacity = '';
                element.style.transition = '';
            };
            
            // Touch events for mobile
            element.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                touchMoved = false;
                addTouchFeedback();
            }, { passive: true });
            
            element.addEventListener('touchmove', () => {
                touchMoved = true;
                removeTouchFeedback();
            }, { passive: true });
            
            element.addEventListener('touchend', (e) => {
                const touchDuration = Date.now() - touchStartTime;
                removeTouchFeedback();
                
                // Only trigger if it was a quick tap (not a long press) and didn't move
                if (!touchMoved && touchDuration < 500) {
                    e.preventDefault();
                    callback(e);
                }
            });
            
            // Mouse events for desktop (with touch device detection)
            if (!this._isMobile()) {
                element.addEventListener('click', callback);
                
                element.addEventListener('mousedown', addTouchFeedback);
                element.addEventListener('mouseup', removeTouchFeedback);
                element.addEventListener('mouseleave', removeTouchFeedback);
            }
        },
        
        // Inject CSS styles once for better performance
        _injectStyles: function() {
            if (document.getElementById('chatbot-widget-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'chatbot-widget-styles';
            style.textContent = `
                .chatbot-container{position:fixed;bottom:${this.config.position.bottom};right:${this.config.position.right};z-index:9999;display:flex;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;will-change:transform;pointer-events:none}
                .chatbot-bubble{width:80px;height:80px;border-radius:50%;background-color:white;box-shadow:0 6px 12px rgba(0,0,0,.2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .3s ease;align-self:flex-end;will-change:transform;pointer-events:auto}
                .chatbot-bubble:hover{transform:scale(1.05)}
                .chatbot-bubble-icon{width:42px;height:42px}
                .chatbot-visible-messages{display:flex;flex-direction:column;align-items:flex-end;margin-bottom:12px;max-width:560px;position:fixed;bottom:100px;right:20px;z-index:9998;pointer-events:none}
                .chatbot-window{width:420px;height:600px;background-color:${this.config.theme.backgroundColor};border-radius:12px;box-shadow:0 6px 16px rgba(0,0,0,.1);margin-bottom:20px;overflow:hidden;flex-direction:column;will-change:transform,opacity;transition:opacity .2s ease,transform .2s ease;pointer-events:auto}
                .chatbot-window-hidden{display:none}
                .chatbot-window-visible{display:flex}
                .chatbot-header{background-color:${this.config.theme.primaryColor};color:white;padding:18px 20px;display:flex;align-items:center;justify-content:space-between}
                .chatbot-messages{flex:1;padding:16px;overflow-y:auto;background-color:${this.config.theme.backgroundColor};scroll-behavior:smooth}
                .chatbot-input-area{padding:12px 16px;border-top:1px solid #e5e7eb;display:flex}
                .chatbot-input{flex:1;padding:12px 16px;border:1px solid #e5e7eb;border-radius:20px;outline:none;font-size:16px;box-shadow:none}
                .chatbot-send-btn{background-color:${this.config.theme.primaryColor};color:white;border:none;border-radius:50%;width:42px;height:42px;margin-left:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:none;transition:opacity .2s ease}
                .chatbot-send-btn:hover{opacity:.9}
                .chatbot-widget-message{margin-bottom:10px;will-change:transform}
                .chatbot-widget-message.bot{display:flex;align-items:flex-start}
                .chatbot-widget-message.user{display:flex;justify-content:flex-end}
                .chatbot-widget-typing{display:flex;margin-bottom:10px;align-items:flex-start}
                .chatbot-widget-suggested{display:flex;flex-direction:column;align-items:flex-end;gap:4px;margin:12px 0;width:100%;padding:0}
                .chatbot-widget-visible-message{background-color:white;color:black;padding:12px 18px;border-radius:20px;margin-top:10px;font-size:16px;cursor:pointer;box-shadow:0 3px 6px rgba(0,0,0,.1);max-width:90%;word-wrap:break-word;white-space:normal;line-height:1.4;overflow-wrap:break-word;animation:fadeIn .3s ease-in-out;display:block;position:relative;z-index:9999;box-sizing:border-box;will-change:transform;transition:transform .2s ease;min-width:280px;pointer-events:auto}
                .chatbot-widget-visible-message:hover{transform:translateY(-2px)}
                @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
                @keyframes typingAnimation{0%{opacity:.3}50%{opacity:1}100%{opacity:.3}}
                
                /* Enhanced typing indicator with pulsing dots */
                .chatbot-typing-dots {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .chatbot-typing-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #9ca3af;
                    animation: typingPulse 1.4s infinite ease-in-out;
                }
                .chatbot-typing-dot:nth-child(1) { animation-delay: 0s; }
                .chatbot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .chatbot-typing-dot:nth-child(3) { animation-delay: 0.4s; }
                
                @keyframes typingPulse {
                    0%, 60%, 100% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                    30% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                }
                
                /* Bot response word-by-word fade-in animation */
                .chatbot-message-content {
                    opacity: 0;
                }
                
                .chatbot-message-content.animate-words {
                    opacity: 1;
                }
                
                /* Ensure message headers are always visible */
                .chatbot-widget-message.bot > div {
                    opacity: 1 !important;
                }
                
                .chatbot-widget-message.bot .chatbot-message-content:not(.animate-words) {
                    opacity: 1;
                }
                
                .chatbot-message-content .word {
                opacity: 0;
                display: inline-block;
                animation: fadeInWord 0.15s ease-out forwards;
            }
            
            @keyframes fadeInWord {
                0% {
                    opacity: 0;
                    transform: translateY(3px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
                
                /* Enhanced typing indicator container */
                .chatbot-widget-typing {
                    display: flex;
                    margin-bottom: 10px;
                    align-items: flex-start;
                    animation: slideInFromLeft 0.3s ease-out;
                }
                
                @keyframes slideInFromLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                /* Mobile-First Responsive Design */
                /* Base styles for mobile devices (320px and up) */
                @media screen and (max-width: 768px) {
                    .chatbot-container {
                        position: fixed;
                        bottom: 0;
                        right: 0;
                        left: auto;
                        top: auto;
                        width: auto;
                        height: auto;
                        pointer-events: none;
                        z-index: 9999;
                        display: block;
                    }
                    
                    .chatbot-bubble {
                        width: 60px;
                        height: 60px;
                        bottom: 20px;
                        right: 20px;
                        position: fixed;
                        z-index: 10001;
                        pointer-events: auto;
                    }
                    
                    .chatbot-bubble-icon {
                        width: 32px;
                        height: 32px;
                    }
                    
                    .chatbot-window {
                        width: 90vw;
                        height: 70vh;
                        border-radius: 12px;
                        margin: 0 auto;
                        position: fixed;
                        top: 15vh;
                        left: 5vw;
                        right: 5vw;
                        bottom: auto;
                        max-height: 70vh;
                        box-shadow: 0 8px 24px rgba(0,0,0,.15);
                        pointer-events: auto;
                    }
                    
                    .chatbot-header {
                        padding: 16px 20px;
                        min-height: 60px;
                        box-sizing: border-box;
                    }
                    
                    .chatbot-messages {
                        padding: 12px 16px;
                        height: calc(70vh - 140px);
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                        flex: 1;
                    }
                    
                    .chatbot-input-area {
                        padding: 16px;
                        background-color: ${this.config.theme.backgroundColor};
                        border-top: 1px solid #e5e7eb;
                        position: relative;
                        bottom: 0;
                        min-height: 80px;
                        box-sizing: border-box;
                        flex-shrink: 0;
                    }
                    
                    .chatbot-input {
                        font-size: clamp(14px, 4vw, 16px);
                        padding: 14px 18px;
                        border-radius: 25px;
                        min-height: 48px;
                        box-sizing: border-box;
                    }
                    
                    .chatbot-send-btn {
                        width: 48px;
                        height: 48px;
                        margin-left: 12px;
                        flex-shrink: 0;
                    }
                    
                    .chatbot-header {
                        padding: 16px 20px;
                        min-height: 60px;
                        box-sizing: border-box;
                        font-size: clamp(14px, 4vw, 16px);
                    }
                    
                    .chatbot-widget-message {
                        font-size: clamp(13px, 3.5vw, 15px);
                    }
                    
                    .chatbot-widget-message .message-content {
                        font-size: clamp(13px, 3.5vw, 15px);
                        line-height: 1.5;
                        padding: 12px 16px;
                        max-width: 85%;
                    }
                    
                    .chatbot-widget-visible-message {
                        min-width: auto;
                        max-width: 100%;
                        font-size: clamp(13px, 3.5vw, 15px);
                        padding: 14px 18px;
                        margin-top: 8px;
                        pointer-events: auto;
                    }
                    
                    .chatbot-visible-messages {
                        bottom: calc(20px + 70px);
                        right: 5vw;
                        left: 5vw;
                        max-width: none;
                        width: calc(90vw - 10vw);
                        z-index: 10000;
                        pointer-events: none;
                    }
                    
                    .chatbot-widget-visible-message {
                        min-width: auto;
                        max-width: 100%;
                        font-size: 15px;
                        padding: 14px 18px;
                        margin-top: 8px;
                        pointer-events: auto;
                    }
                    
                    .chatbot-widget-message {
                        margin-bottom: 12px;
                    }
                    
                    /* Touch-friendly message bubbles */
                    .chatbot-widget-message .message-content {
                        font-size: 15px;
                        line-height: 1.5;
                        padding: 12px 16px;
                        max-width: 85%;
                    }
                    
                    /* User details form mobile optimization */
                    .chatbot-widget-user-form {
                        margin: 12px 8px 12px auto !important;
                        padding: 16px !important;
                        gap: 10px !important;
                        width: 80% !important;
                        max-width: 280px !important;
                    }
                    
                    .chatbot-widget-user-form h3 {
                        font-size: 15px !important;
                        margin-bottom: 10px !important;
                    }
                    
                    .chatbot-widget-user-form input {
                        padding: 12px 14px !important;
                        font-size: 14px !important;
                        border-radius: 6px !important;
                    }
                    
                    .chatbot-widget-user-form button {
                        padding: 12px 18px !important;
                        font-size: 14px !important;
                        margin-top: 5px !important;
                        min-width: 110px !important;
                    }
                    
                    /* Suggested messages mobile optimization */
                    .chatbot-widget-suggested {
                        gap: 8px;
                        margin: 16px 0;
                    }
                    
                    .chatbot-suggested-message {
                        padding: 12px 16px;
                        font-size: 14px;
                        min-height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                    }
                }
                
                /* Small mobile devices (up to 480px) */
                @media screen and (max-width: 480px) {
                    .chatbot-bubble {
                        width: 56px;
                        height: 56px;
                        bottom: 16px;
                        right: 16px;
                    }
                    
                    .chatbot-bubble-icon {
                        width: 28px;
                        height: 28px;
                    }
                    
                    .chatbot-header {
                        padding: 12px 16px;
                        min-height: 56px;
                    }
                    
                    .chatbot-messages {
                        padding: 8px 12px;
                        height: calc(100vh - 132px);
                    }
                    
                    .chatbot-input-area {
                        padding: 12px;
                        min-height: 76px;
                    }
                    
                    .chatbot-input {
                        padding: 12px 16px;
                        font-size: 16px;
                        min-height: 44px;
                    }
                    
                    .chatbot-send-btn {
                        width: 44px;
                        height: 44px;
                        margin-left: 8px;
                    }
                    
                    .chatbot-visible-messages {
                        bottom: 80px;
                        right: 12px;
                        left: 12px;
                        width: calc(100% - 24px);
                        pointer-events: none;
                    }
                    
                    .chatbot-widget-visible-message {
                        font-size: 14px;
                        padding: 12px 16px;
                    }
                    
                    /* User details form for small mobile */
                    .chatbot-widget-user-form {
                        margin: 10px 6px 10px auto !important;
                        padding: 14px !important;
                        gap: 8px !important;
                        width: 85% !important;
                        max-width: 260px !important;
                    }
                    
                    .chatbot-widget-user-form h3 {
                        font-size: 14px !important;
                        margin-bottom: 8px !important;
                    }
                    
                    .chatbot-widget-user-form input {
                        padding: 10px 12px !important;
                        font-size: 14px !important;
                    }
                    
                    .chatbot-widget-user-form button {
                        padding: 10px 16px !important;
                        font-size: 14px !important;
                        min-width: 110px !important;
                    }
                }
                
                /* Landscape orientation adjustments */
                @media screen and (max-width: 768px) and (orientation: landscape) {
                    .chatbot-messages {
                        height: calc(100vh - 120px);
                    }
                    
                    .chatbot-input-area {
                        min-height: 70px;
                        padding: 12px 16px;
                    }
                    
                    .chatbot-header {
                        min-height: 50px;
                        padding: 12px 20px;
                    }
                }
                
                /* Tablet styles (769px to 1024px) */
                @media screen and (min-width: 769px) and (max-width: 1024px) {
                    .chatbot-window {
                        width: 380px;
                        height: 550px;
                        bottom: 100px;
                        right: 20px;
                        position: fixed;
                    }
                    
                    .chatbot-bubble {
                        width: 70px;
                        height: 70px;
                    }
                    
                    .chatbot-bubble-icon {
                        width: 38px;
                        height: 38px;
                    }
                    
                    .chatbot-visible-messages {
                        max-width: 400px;
                        bottom: 90px;
                        right: 20px;
                    }
                }
                
                /* Large desktop styles (1025px and up) */
                @media screen and (min-width: 1025px) {
                    .chatbot-window {
                        width: 420px;
                        height: 600px;
                    }
                    
                    .chatbot-visible-messages {
                        max-width: 560px;
                    }
                }
                
                /* High DPI displays */
                @media screen and (-webkit-min-device-pixel-ratio: 2), screen and (min-resolution: 192dpi) {
                    .chatbot-bubble {
                        box-shadow: 0 4px 8px rgba(0,0,0,.15);
                    }
                    
                    .chatbot-window {
                        box-shadow: 0 4px 12px rgba(0,0,0,.08);
                    }
                }
                
                /* Additional responsive improvements */
                /* Ensure proper viewport handling */
                @media screen and (max-width: 768px) {
                    .chatbot-container {
                        pointer-events: none;
                    }
                    
                    .chatbot-window {
                        -webkit-transform: translateZ(0);
                        transform: translateZ(0);
                        backface-visibility: hidden;
                        pointer-events: auto;
                    }
                    
                    .chatbot-bubble {
                        pointer-events: auto;
                    }
                    
                    /* Prevent zoom on input focus for iOS */
                    .chatbot-input {
                        -webkit-appearance: none;
                        -webkit-border-radius: 25px;
                        transform: translateZ(0);
                    }
                }
                
                /* Very small screens (320px and below) */
                @media screen and (max-width: 320px) {
                    .chatbot-bubble {
                        width: 50px;
                        height: 50px;
                        bottom: 12px;
                        right: 12px;
                    }
                    
                    .chatbot-bubble-icon {
                        width: 24px;
                        height: 24px;
                    }
                    
                    .chatbot-header {
                        padding: 10px 12px;
                        min-height: 50px;
                        font-size: 14px;
                    }
                    
                    .chatbot-messages {
                        padding: 6px 10px;
                        height: calc(100vh - 125px);
                    }
                    
                    .chatbot-input-area {
                        padding: 10px;
                        min-height: 70px;
                    }
                    
                    .chatbot-input {
                        padding: 10px 14px;
                        font-size: 16px;
                        min-height: 40px;
                    }
                    
                    .chatbot-send-btn {
                        width: 40px;
                        height: 40px;
                        margin-left: 6px;
                    }
                }
                
                /* Accessibility improvements */
                @media (prefers-reduced-motion: reduce) {
                    .chatbot-bubble,
                    .chatbot-window,
                    .chatbot-widget-visible-message {
                        transition: none;
                        animation: none;
                    }
                    
                    .chatbot-message-content .word {
                        animation: none;
                        opacity: 1;
                    }
                }
                
                /* Focus styles for better accessibility */
                .chatbot-input:focus {
                    outline: 2px solid ${this.config.theme.primaryColor};
                    outline-offset: 2px;
                }
                
                .chatbot-send-btn:focus,
                .chatbot-bubble:focus {
                    outline: 2px solid ${this.config.theme.primaryColor};
                    outline-offset: 2px;
                }
            `;
            
            document.head.appendChild(style);
        },

        // Create the widget UI
        createWidget: function() {
            // Create and inject CSS styles once
            this._injectStyles();
            
            // Create chat container with optimized DOM creation
            const chatContainer = this._createElement('div', {
                id: 'chatbot-widget-container',
                className: 'chatbot-container'
            });
            
            // Use document fragment for batch DOM operations
            const fragment = document.createDocumentFragment();
            
            // Create chat bubble with optimized creation
            const chatBubble = this._createElement('div', {
                id: 'chatbot-widget-bubble',
                className: 'chatbot-bubble',
                innerHTML: `<img src="${this.config.logo}" alt="Chat" class="chatbot-bubble-icon">`
            });
            
            // Use event delegation for better performance
            this._addEventListenerOnce(chatBubble, 'click', () => this.toggleChat());
            
            // Create visible welcome messages container
            const visibleMessagesContainer = this._createElement('div', {
                id: 'chatbot-widget-visible-messages',
                className: 'chatbot-visible-messages'
            });
            
            // Create chat window (initially hidden)
            const chatWindow = this._createElement('div', {
                id: 'chatbot-widget-window',
                className: 'chatbot-window chatbot-window-hidden'
            });
            
            // Chat header
            const chatHeader = this._createElement('div', {
                className: 'chatbot-header',
                innerHTML: `
                    <div style="display: flex; align-items: center;">
                        <img src="${this.config.logo}" alt="Logo" style="width: 28px; height: 28px; margin-right: 12px;">
                        <span>${this.config.agentName}</span>
                    </div>
                    <div id="chatbot-widget-close" style="cursor: pointer;">✕</div>
                `
            });
            
            // Chat messages container
            const chatMessages = this._createElement('div', {
                id: 'chatbot-widget-messages',
                className: 'chatbot-messages'
            });
            
            // Chat input area
            const chatInput = this._createElement('div', {
                className: 'chatbot-input-area',
                innerHTML: `
                    <input type="text" id="chatbot-widget-input" placeholder="Type your message..." class="chatbot-input">
                    <button id="chatbot-widget-send" class="chatbot-send-btn">➤</button>
                `
            });
            
            // Assemble the chat window
            chatWindow.appendChild(chatHeader);
            chatWindow.appendChild(chatMessages);
            chatWindow.appendChild(chatInput);
            
            // Add everything to the container
            chatContainer.appendChild(chatWindow);
            chatContainer.appendChild(visibleMessagesContainer);
            chatContainer.appendChild(chatBubble);
            document.body.appendChild(chatContainer);
            
            // Add event listeners with touch support
            const closeButton = document.getElementById('chatbot-widget-close');
            const sendButton = document.getElementById('chatbot-widget-send');
            const inputElement = document.getElementById('chatbot-widget-input');
            
            // Enhanced close button with touch support
            this._addTouchSupport(closeButton, (e) => {
                e.stopPropagation();
                this.toggleChat(false);
            });
            
            // Enhanced send button with touch support
            this._addTouchSupport(sendButton, () => this.sendMessage());
            
            // Enhanced chat bubble with touch support
            this._addTouchSupport(chatBubble, () => this.toggleChat());
            
            // Add debounced input handling for better performance
            const debouncedInputHandler = this._debounce((e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendMessage();
                }
            }, 100);
            
            inputElement.addEventListener('keypress', debouncedInputHandler);
            
            // Prevent zoom on input focus for iOS
            inputElement.addEventListener('focus', () => {
                if (this._isMobile()) {
                    document.querySelector('meta[name=viewport]')?.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                }
            });
            
            inputElement.addEventListener('blur', () => {
                if (this._isMobile()) {
                    document.querySelector('meta[name=viewport]')?.setAttribute('content', 'width=device-width, initial-scale=1.0');
                }
            });
            
            // Add throttled scroll handling for messages container
            const messagesContainer = document.getElementById('chatbot-widget-messages');
            const throttledScrollHandler = this._throttle(() => {
                // Handle scroll events if needed
            }, 100);
            
            messagesContainer.addEventListener('scroll', throttledScrollHandler, { passive: true });
            
            // Show welcome message if enabled
            if (this.config.autoOpen) {
                setTimeout(() => this.toggleChat(true), 1000);
            }
            
            if (this.config.showWelcomeMessage) {
                setTimeout(() => {
                    this.config.welcomeMessages.forEach((msg, index) => {
                        setTimeout(() => {
                            // Disable animation for first 2 welcome messages
                            const disableAnimation = index < 2;
                            this.addBotMessage(msg, disableAnimation);
                            // Also add to visible messages outside the chat
                            this.addVisibleMessage(msg);
                        }, index * 500);
                    });
                    
                    // Add user details form instead of suggested messages
                    setTimeout(() => this.addUserDetailsForm(), this.config.welcomeMessages.length * 500 + 500);
                }, this.config.autoOpen ? 1500 : 0);
            }
        },
        
        // Add a visible message outside the chat window
        addVisibleMessage: function(message) {
            const visibleMessagesContainer = document.getElementById('chatbot-widget-visible-messages');
            
            // Use optimized element creation
            const messageElement = this._createElement('div', {
                className: 'chatbot-widget-visible-message'
            });
            
            // Format message
            const formattedMessage = this._formatMessage(message);
            messageElement.innerHTML = formattedMessage;
            
            // Make message clickable to open chat with touch support
            this._addTouchSupport(messageElement, () => {
                this.toggleChat(true);
            });
            
            visibleMessagesContainer.appendChild(messageElement);
        },
        
        // Toggle chat window visibility
        toggleChat: function(forceState) {
            const chatWindow = document.getElementById('chatbot-widget-window');
            const visibleMessages = document.getElementById('chatbot-widget-visible-messages');
            const newState = forceState !== undefined ? forceState : chatWindow.style.display === 'none';
            
            chatWindow.style.display = newState ? 'flex' : 'none';
            
            // Show/hide visible messages based on chat state
            if (newState) {
                visibleMessages.style.display = 'none';
            } else {
                visibleMessages.style.display = 'flex';
            }
            
            // Scroll to bottom when opening
            if (newState) {
                const messagesContainer = document.getElementById('chatbot-widget-messages');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        },
        
        // Show typing indicator immediately
        showTypingIndicator: function() {
            const messagesContainer = document.getElementById('chatbot-widget-messages');
            
            // Remove any existing typing indicator
            this.hideTypingIndicator();
            
            // Record typing start time for coordination
            this.typingStartTime = Date.now();
            
            // Check if this is the first bot message in a sequence
            const isFirstBotMessage = this.lastMessageSender !== 'bot';
            this.lastMessageSender = 'bot';
            
            // Add enhanced typing indicator with pulsing dots
            const typingIndicator = this._createElement('div', {
                className: 'chatbot-widget-typing',
                id: 'chatbot-typing-indicator'
            });
            
            typingIndicator.innerHTML = `
                <div style="
                    background-color: #f3f4f6;
                    padding: 12px 18px;
                    border-radius: 20px;
                    max-width: 70%;
                    margin-right: 50px;
                    color: ${this.config.theme.textColor};
                    font-size: 16px;
                ">
                    ${isFirstBotMessage ? `
                        <div style="
                            display: flex;
                            align-items: center;
                            margin-bottom: 8px;
                            font-size: 14px;
                            font-weight: 500;
                            color: #6b7280;
                        ">
                            <img src="${this.config.logo}" alt="Agent" width="16" height="16" style="border-radius: 3px; margin-right: 8px; vertical-align: middle;">
                            <span>${this.config.agentName}</span>
                        </div>
                    ` : ''}
                    <div class="chatbot-typing-dots">
                        <div class="chatbot-typing-dot"></div>
                        <div class="chatbot-typing-dot"></div>
                        <div class="chatbot-typing-dot"></div>
                    </div>
                </div>
            `;
            
            messagesContainer.appendChild(typingIndicator);
            
            // Scroll to bottom
            requestAnimationFrame(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
        },
        
        // Hide typing indicator
        hideTypingIndicator: function() {
            const typingIndicator = document.getElementById('chatbot-typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        },
        
        // Add a bot message to the chat
        addBotMessage: function(message, disableAnimation = false) {
            const messagesContainer = document.getElementById('chatbot-widget-messages');
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Check if this is the first bot message in a sequence
            const isFirstBotMessage = this.lastMessageSender !== 'bot';
            this.lastMessageSender = 'bot';
            
            // Create message element
            const messageElement = this._createElement('div', {
                className: 'chatbot-widget-message bot'
            });
            messageElement.style.cssText = `
                display: flex;
                margin-bottom: 10px;
                align-items: flex-start;
            `;
            
            // Convert URLs to links and handle line breaks
            const formattedMessage = this._formatMessage(message);
            
            // Create header content for first bot message
            const headerContent = isFirstBotMessage ? `
                <div style="
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #e5e7eb;
                ">
                    <div style="
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 8px;
                        position: relative;
                        overflow: hidden;
                    ">
                        <img src="${this.config.logo}" alt="Agent" style="
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            border-radius: 50%;
                        ">
                    </div>
                    <span style="
                        font-weight: 600;
                        font-size: 14px;
                        color: #374151;
                    ">SIT Career Assistant</span>
                </div>
            ` : '';
            
            messageElement.innerHTML = `
                <div style="
                    background-color: white;
                    padding: 12px 18px;
                    border-radius: 20px;
                    max-width: 70%;
                    margin-right: 50px;
                    color: black;
                    font-size: 16px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    white-space: normal;
                    word-wrap: break-word;
                    line-height: 1.4;
                    overflow-wrap: break-word;
                ">
                    ${headerContent}
                    <div class="chatbot-message-content">${formattedMessage}</div>
                </div>
            `;
            
            messagesContainer.appendChild(messageElement);
            
            // Implement word-by-word animation (skip for first 2 welcome messages)
            const messageContent = messageElement.querySelector('.chatbot-message-content');
            if (!disableAnimation) {
                this._animateMessageWords(messageContent);
            } else {
                // For disabled animation, ensure text is visible immediately
                messageContent.classList.add('animate-words');
            }
            
            // Lazy scroll with requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
            
            // Memory management: limit message history
            this._limitMessageHistory(messagesContainer);
        },
        
        // Animate message words appearing one by one
         _animateMessageWords: function(messageElement) {
             const text = messageElement.textContent;
             const words = text.split(' ');
             
             // Clear the content and prepare for animation
             messageElement.innerHTML = '';
             messageElement.classList.add('animate-words');
             
             // Create word spans with proper spacing
             words.forEach((word, index) => {
                 const wordSpan = document.createElement('span');
                 wordSpan.className = 'word';
                 wordSpan.textContent = word;
                 wordSpan.style.animationDelay = `${index * 0.05}s`;
                 messageElement.appendChild(wordSpan);
                 
                 // Add space after each word except the last one
                 if (index < words.length - 1) {
                     const spaceSpan = document.createElement('span');
                     spaceSpan.textContent = ' ';
                     spaceSpan.style.animationDelay = `${index * 0.05}s`;
                     messageElement.appendChild(spaceSpan);
                 }
             });
         },
        
        // Add a user message to the chat
        addUserMessage: function(message) {
            const messagesContainer = document.getElementById('chatbot-widget-messages');
            
            // Track that the last message was from user
            this.lastMessageSender = 'user';
            
            // Optimize message creation with document fragment
            const fragment = document.createDocumentFragment();
            const messageElement = this._createElement('div', {
                className: 'chatbot-widget-message user'
            });
            messageElement.style.cssText = `
                display: flex;
                margin-bottom: 10px;
                justify-content: flex-end;
            `;
            
            // Format message
            const formattedMessage = this._formatMessage(message);
            
            messageElement.innerHTML = `
                <div style="
                    background-color: ${this.config.theme.primaryColor};
                    color: white;
                    padding: 12px 18px;
                    border-radius: 20px;
                    max-width: 70%;
                    margin-left: 50px;
                    font-size: 16px;
                    box-shadow: none;
                    white-space: normal;
                    word-wrap: break-word;
                    line-height: 1.4;
                    overflow-wrap: break-word;
                ">${formattedMessage}</div>
            `;
            
            fragment.appendChild(messageElement);
            messagesContainer.appendChild(fragment);
            
            // Lazy scroll with requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
            
            // Memory management: limit message history
            this._limitMessageHistory(messagesContainer);
        },
        
        // Helper function to show field validation errors
        showFieldError: function(inputElement, message) {
            inputElement.focus();
            inputElement.style.borderColor = '#ef4444';
            inputElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            
            // Create or update error message
            let errorElement = inputElement.parentNode.querySelector('.error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.style.cssText = `
                    color: #ef4444;
                    font-size: 12px;
                    margin-top: 4px;
                    animation: fadeIn 0.3s ease;
                `;
                inputElement.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = message;
            
            // Clear error on input
            const clearError = () => {
                inputElement.style.borderColor = '#d1d5db';
                inputElement.style.boxShadow = 'none';
                if (errorElement) errorElement.remove();
                inputElement.removeEventListener('input', clearError);
            };
            inputElement.addEventListener('input', clearError);
        },
        
        // Sanitize user input to prevent XSS
        sanitizeInput: function(input) {
            return input.replace(/[<>"'&]/g, function(match) {
                const escapeMap = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;',
                    '&': '&amp;'
                };
                return escapeMap[match];
            }).trim();
        },
        
        // Generate unique session ID
        generateSessionId: function() {
            return Date.now().toString() + Math.floor(Math.random() * 1000000).toString();
        },
        
        // Store user data securely in metadata
        storeUserDataSecurely: function(userData) {
            return new Promise((resolve, reject) => {
                try {
                    // Store in sessionStorage with encryption-like encoding
                    const encodedData = btoa(JSON.stringify(userData));
                    sessionStorage.setItem('chatbot_user_data', encodedData);
                    
                    // Store in widget metadata
                    if (!this.metadata) this.metadata = {};
                    this.metadata.userData = userData;
                    this.metadata.submissionTime = new Date().toISOString();
                    
                    resolve(userData);
                } catch (error) {
                    reject(new Error('Failed to store user data: ' + error.message));
                }
            });
        },
        
        // Transmit data to webhook with retry logic
        transmitToWebhook: function(userData) {
            return new Promise(async (resolve, reject) => {
                if (!this.config.webhookUrl) {
                    resolve({ status: 'no_webhook', message: 'No webhook URL configured' });
                    return;
                }
                
                const maxRetries = 3;
                let attempt = 0;
                
                const attemptTransmission = async () => {
                    attempt++;
                    try {
                        const response = await fetch(this.config.webhookUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Chatbot-Source': 'widget',
                                'X-Session-ID': userData.sessionId
                            },
                            body: JSON.stringify({
                                chatInput: `name is ${userData.name} & mobile is ${userData.mobile}`,
                                sessionId: userData.sessionId,
                                timestamp: userData.timestamp,
                                source: userData.source,
                                agentName: this.config.agentName
                            })
                        });
                        
                        if (!response.ok) {
                            throw new Error(`Webhook responded with status: ${response.status}`);
                        }
                        
                        const result = await response.json();
                        resolve(result);
                        
                    } catch (error) {
                        if (attempt < maxRetries) {
                            // Exponential backoff: wait 1s, 2s, 4s
                            setTimeout(attemptTransmission, Math.pow(2, attempt - 1) * 1000);
                        } else {
                            reject(new Error(`Webhook transmission failed after ${maxRetries} attempts: ${error.message}`));
                        }
                    }
                };
                
                attemptTransmission();
            });
        },
        
        // Show animated success confirmation
        showSuccessConfirmation: function(userName) {
            const messagesContainer = document.getElementById('chatbot-widget-messages');
            
            // Track that the last message was from user (to match user message styling)
            this.lastMessageSender = 'user';
            
            // Create success message container styled like a user message
            const successContainer = document.createElement('div');
            successContainer.className = 'chatbot-widget-message user chatbot-success-message';
            successContainer.id = 'chatbot-success-notification';
            successContainer.style.cssText = `
                display: flex;
                margin-bottom: 10px;
                justify-content: flex-end;
            `;
            
            // Add success animation keyframes to CSS if not already added
            if (!document.getElementById('success-animations')) {
                const style = document.createElement('style');
                style.id = 'success-animations';
                style.textContent = `
                    @keyframes successSlideIn {
                        0% { transform: translateY(10px); opacity: 0; }
                        100% { transform: translateY(0); opacity: 1; }
                    }
                    @keyframes fadeIn {
                        0% { opacity: 0; }
                        100% { opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Create message content with user message styling but success colors
            successContainer.innerHTML = `
                <div style="
                    background-color: #10b981;
                    color: #ffffff;
                    padding: 12px 18px;
                    border-radius: 20px;
                    max-width: 70%;
                    margin-left: 50px;
                    font-size: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    animation: successSlideIn 0.4s ease;
                    position: relative;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 4px;
                    ">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style="flex-shrink: 0;">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        <div style="font-weight: 600;">Details submitted successfully</div>
                        <button onclick="document.getElementById('chatbot-success-notification').remove()" style="
                            position: absolute;
                            top: 8px;
                            right: 8px;
                            background: none;
                            border: none;
                            color: rgba(255, 255, 255, 0.7);
                            cursor: pointer;
                            font-size: 18px;
                            line-height: 1;
                            padding: 0;
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        " onmouseover="this.style.color='rgba(255,255,255,1)'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">&times;</button>
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">Thank you, ${userName}! Your details have been saved.</div>
                </div>
            `;
            
            messagesContainer.appendChild(successContainer);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Store reference for removal on next user action
            this.successNotification = successContainer;
        },
        
        // Show submission error message
        showSubmissionError: function(errorMessage) {
            const messagesContainer = document.getElementById('chatbot-widget-messages');
            
            const errorContainer = document.createElement('div');
            errorContainer.style.cssText = `
                display: flex;
                align-items: center;
                padding: 16px 20px;
                margin: 16px 12px;
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 12px;
                color: #dc2626;
                font-size: 14px;
                animation: fadeIn 0.3s ease;
            `;
            
            errorContainer.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style="margin-right: 12px; flex-shrink: 0;">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">Submission Failed</div>
                    <div>${errorMessage || 'Please try again or contact support if the problem persists.'}</div>
                </div>
            `;
            
            messagesContainer.appendChild(errorContainer);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Auto-remove error message
            setTimeout(() => {
                errorContainer.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => errorContainer.remove(), 300);
            }, 5000);
        },
        
        // Add user details form
        addUserDetailsForm: function() {
            const messagesContainer = document.getElementById('chatbot-widget-messages');
            const formContainer = document.createElement('div');
            formContainer.className = 'chatbot-widget-user-form';
            formContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 12px;
                margin: 16px 12px 16px auto;
                padding: 18px;
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                width: 75%;
                max-width: 300px;
                box-sizing: border-box;
                margin-left: auto;
            `;
            
            // Form heading
            const heading = document.createElement('h3');
            heading.textContent = 'Fill These Details First';
            heading.style.cssText = `
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                text-align: center;
                font-family: inherit;
                width: 100%;
            `;
            
            // Name input (no label)
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.placeholder = 'Enter your full name';
            nameInput.style.cssText = `
                padding: 10px 14px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                color: #1f2937;
                background-color: #ffffff;
                transition: border-color 0.2s, box-shadow 0.2s;
                outline: none;
                width: 100%;
                box-sizing: border-box;
            `;
            
            // Mobile input (no label)
            const mobileInput = document.createElement('input');
            mobileInput.type = 'tel';
            mobileInput.placeholder = 'Enter your mobile number';
            mobileInput.pattern = '[0-9]{10}';
            mobileInput.style.cssText = `
                padding: 10px 14px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                color: #1f2937;
                background-color: #ffffff;
                transition: border-color 0.2s, box-shadow 0.2s;
                outline: none;
                width: 100%;
                box-sizing: border-box;
            `;
            
            // Input focus effects
            [nameInput, mobileInput].forEach(input => {
                input.addEventListener('focus', () => {
                    input.style.borderColor = '#3b82f6';
                    input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                });
                
                input.addEventListener('blur', () => {
                    input.style.borderColor = '#d1d5db';
                    input.style.boxShadow = 'none';
                });
            });
            
            // Mobile number validation
            mobileInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value.length > 10) {
                    e.target.value = e.target.value.slice(0, 10);
                }
            });
            
            // Submit button
            const submitButton = document.createElement('button');
            submitButton.textContent = 'Continue Chat';
            submitButton.style.cssText = `
                background-color: #1a1a1a;
                color: #ffffff;
                border: none;
                border-radius: 8px;
                padding: 10px 20px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s, transform 0.1s;
                margin-top: 6px;
                min-width: 120px;
            `;
            
            submitButton.addEventListener('mouseover', () => {
                submitButton.style.backgroundColor = '#374151';
            });
            
            submitButton.addEventListener('mouseout', () => {
                submitButton.style.backgroundColor = '#1a1a1a';
            });
            
            submitButton.addEventListener('mousedown', () => {
                submitButton.style.transform = 'scale(0.98)';
            });
            
            submitButton.addEventListener('mouseup', () => {
                submitButton.style.transform = 'scale(1)';
            });
            
            // Form submission with comprehensive workflow
            const handleSubmit = async () => {
                const name = nameInput.value.trim();
                const mobile = mobileInput.value.trim();
                
                // Enhanced validation
                if (!name || name.length < 2) {
                    this.showFieldError(nameInput, 'Please enter a valid name (minimum 2 characters)');
                    return;
                }
                
                if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
                    this.showFieldError(mobileInput, 'Please enter a valid 10-digit mobile number');
                    return;
                }
                
                // Disable submit button during processing
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
                submitButton.style.backgroundColor = '#9ca3af';
                
                try {
                    // Create user data object with timestamp and validation
                    const userData = {
                        name: this.sanitizeInput(name),
                        mobile: this.sanitizeInput(mobile),
                        timestamp: new Date().toISOString(),
                        sessionId: this.sessionId,
                        source: 'chatbot-widget'
                    };
                    
                    // Store in metadata securely
                    await this.storeUserDataSecurely(userData);
                    
                    // Transmit to webhook with retry logic
                    const webhookResponse = await this.transmitToWebhook(userData);
                    
                    // Store user details in widget instance
                    this.userDetails = userData;
                    
                    // Remove form and show success confirmation
                    formContainer.remove();
                    
                    // Show animated success message
                    this.showSuccessConfirmation(name);
                    
                    // Process webhook response after success animation
                    setTimeout(() => {
                        this.showTypingIndicator();
                        this._handleWebhookResponse(webhookResponse);
                    }, 2000);
                    
                } catch (error) {
                    console.error('Form submission error:', error);
                    this.showSubmissionError(error.message);
                    
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.textContent = 'Continue Chat';
                    submitButton.style.backgroundColor = '#1a1a1a';
                }
            };
            
            submitButton.addEventListener('click', handleSubmit);
            
            // Enter key submission
            [nameInput, mobileInput].forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        handleSubmit();
                    }
                });
            });
            
            // Assemble form (without labels)
            formContainer.appendChild(heading);
            formContainer.appendChild(nameInput);
            formContainer.appendChild(mobileInput);
            formContainer.appendChild(submitButton);
            
            messagesContainer.appendChild(formContainer);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Focus on name input
            setTimeout(() => nameInput.focus(), 100);
        },
        
        // Add suggested messages (kept for backward compatibility)
        addSuggestedMessages: function() {
            if (!this.config.suggestedMessages || this.config.suggestedMessages.length === 0) return;
            
            const messagesContainer = document.getElementById('chatbot-widget-messages');
            const suggestedContainer = document.createElement('div');
            suggestedContainer.className = 'chatbot-widget-suggested';
            suggestedContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 4px;
                margin: 12px 0;
                width: 100%;
                padding: 0;
            `;
            
            this.config.suggestedMessages.forEach(msg => {
                const button = document.createElement('button');
                button.style.cssText = `
                    background-color: #f3f4f6;
                    border: 1px solid #e5e7eb;
                    border-radius: 20px;
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    color: #333;
                    margin-bottom: 6px;
                    text-align: left;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                `;
                button.textContent = msg;
                
                button.addEventListener('mouseover', () => {
                    button.style.backgroundColor = '#e5e7eb';
                });
                
                button.addEventListener('mouseout', () => {
                    button.style.backgroundColor = '#f3f4f6';
                });
                
                // Use touch support for better mobile interactions
                this._addTouchSupport(button, () => {
                    this.handleUserInput(msg);
                    suggestedContainer.remove();
                });
                
                suggestedContainer.appendChild(button);
            });
            
            messagesContainer.appendChild(suggestedContainer);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        },
        
        // Send a message
        sendMessage: function() {
            const inputElement = document.getElementById('chatbot-widget-input');
            const message = inputElement.value.trim();
            
            if (message) {
                this.handleUserInput(message);
                inputElement.value = '';
            }
        },
        
        // Handle user input
        handleUserInput: function(message) {
            // Remove success notification on next user action if it exists
            if (this.successNotification && document.getElementById('chatbot-success-notification')) {
                this.successNotification.remove();
                this.successNotification = null;
            }
            
            // Add user message to chat
            this.addUserMessage(message);
            
            // Immediately show typing indicator
            this.showTypingIndicator();
            
            // Send to webhook
            this.sendToWebhook(message);
        },
        
        // Send message to webhook with caching and optimization
        sendToWebhook: function(message) {
            console.log('Sending to webhook:', this.config.webhookUrl);
            console.log('Payload:', { chatInput: message, sessionId: this.sessionId });
            
            // Check cache first if enabled
            if (this.config.cacheEnabled) {
                const cacheKey = this._generateCacheKey(message);
                const cachedResponse = this._getCachedResponse(cacheKey);
                
                if (cachedResponse) {
                    console.log('Using cached response for:', message);
                    this.performanceMetrics.cacheHits++;
                    this._handleWebhookResponse(cachedResponse);
                    return;
                }
            }
            
            const startTime = performance.now();
            
            // Create AbortController for request timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const payload = {
                chatInput: message,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                source: "chatbot-widget",
                agentName: this.config.agentName || "Assistant"
            };
            
            fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
                // Add performance optimizations
                keepalive: true,
                cache: 'no-cache'
            })
            .then(response => {
                clearTimeout(timeoutId);
                console.log('Webhook response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
                // Update performance metrics
                this.performanceMetrics.messagesSent++;
                this.performanceMetrics.averageResponseTime = 
                    (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.messagesSent - 1) + responseTime) / this.performanceMetrics.messagesSent;
                
                console.log('Webhook response data:', data);
                console.log('Response time:', responseTime + 'ms');
                
                // Cache the response if caching is enabled
                if (this.config.cacheEnabled) {
                    const cacheKey = this._generateCacheKey(message);
                    this._setCachedResponse(cacheKey, data);
                }
                
                this._handleWebhookResponse(data);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                console.error('Webhook error:', error);
                
                if (error.name === 'AbortError') {
                    this.addBotMessage('Request timed out. Please try again.');
                } else {
                    this.addBotMessage('Sorry, there was an error processing your request. Please try again later.');
                }
            });
        },
        
        // Format message (convert URLs to links, preserve natural text flow)
        _formatMessage: function(message) {
            // Convert URLs to clickable links
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            let formattedMessage = message.replace(urlRegex, url => `<a href="${url}" target="_blank" style="color: #2563eb; text-decoration: underline;">${url}</a>`);
            
            // Remove any existing line breaks to allow natural text wrapping
            formattedMessage = formattedMessage.replace(/\n/g, ' ');
            
            return formattedMessage;
        },
        
        // Memory management: limit message history to prevent memory leaks
        _limitMessageHistory: function(messagesContainer) {
            const maxMessages = 50; // Keep only last 50 messages
            const messages = messagesContainer.querySelectorAll('.chatbot-widget-message, .chatbot-widget-suggested');
            
            if (messages.length > maxMessages) {
                // Remove oldest messages
                const messagesToRemove = messages.length - maxMessages;
                for (let i = 0; i < messagesToRemove; i++) {
                    if (messages[i] && messages[i].parentNode) {
                        messages[i].parentNode.removeChild(messages[i]);
                    }
                }
            }
        },
        
        // Handle webhook response (extracted for reuse with caching)
        _handleWebhookResponse: function(data) {
            let botResponse = null;
            let suggestedMessages = [];
            
            // Handle n8n response format: either [{ "output": "message" }] or { "output": "message" }
            if (data && Array.isArray(data) && data.length > 0 && data[0].output) {
                console.log('Using n8n array format response:', data[0].output);
                botResponse = data[0].output;
                suggestedMessages = data[0].suggestedMessages || [];
            } else if (data && data.output) {
                console.log('Using n8n object format response:', data.output);
                botResponse = data.output;
                suggestedMessages = data.suggestedMessages || [];
            } else if (data && data.response) {
                // Fallback for standard response format
                console.log('Using standard format response:', data.response);
                botResponse = data.response;
                suggestedMessages = data.suggestedMessages || [];
            } else {
                // For demo purposes, if no valid response
                console.log('No valid response found, using demo message');
                botResponse = 'I received your message. This is a demo response since no valid webhook response was received.';
                suggestedMessages = ["Tell me more", "How can you help?", "What's next?"];
            }
            
            // Calculate minimum typing duration for natural feel
            const minTypingDuration = Math.max(400, Math.min(botResponse ? botResponse.length * 15 : 400, 1200));
            const typingStartTime = this.typingStartTime || Date.now();
            const elapsedTime = Date.now() - typingStartTime;
            const remainingDelay = Math.max(0, minTypingDuration - elapsedTime);
            
            // Add bot response with appropriate delay
            setTimeout(() => {
                if (botResponse) {
                    this.addBotMessage(botResponse);
                }
                
                // Add suggested messages if provided
                if (suggestedMessages && suggestedMessages.length > 0) {
                    setTimeout(() => {
                        this.config.suggestedMessages = suggestedMessages;
                        this.addSuggestedMessages();
                    }, 1000);
                }
            }, remainingDelay);
        },
        
        // Generate cache key for messages
        _generateCacheKey: function(message) {
            return btoa(message.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, '');
        },
        
        // Get cached response
        _getCachedResponse: function(cacheKey) {
            const cached = this.responseCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < this.config.cacheExpiry) {
                return cached.data;
            }
            // Remove expired cache entry
            if (cached) {
                this.responseCache.delete(cacheKey);
            }
            return null;
        },
        
        // Set cached response
        _setCachedResponse: function(cacheKey, data) {
            // Limit cache size to prevent memory issues
            if (this.responseCache.size >= 100) {
                const firstKey = this.responseCache.keys().next().value;
                this.responseCache.delete(firstKey);
            }
            
            this.responseCache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
        },
        
        // Get performance metrics
        getPerformanceMetrics: function() {
            return {
                ...this.performanceMetrics,
                cacheSize: this.responseCache.size,
                cacheHitRate: this.performanceMetrics.messagesSent > 0 ? 
                    (this.performanceMetrics.cacheHits / this.performanceMetrics.messagesSent * 100).toFixed(2) + '%' : '0%'
            };
        },
        
        // Clear cache
        clearCache: function() {
            this.responseCache.clear();
            console.log('Response cache cleared');
        },
        
        // Lazy loading for message rendering
        _renderMessageLazy: function(messageData, container) {
            return new Promise((resolve) => {
                requestAnimationFrame(() => {
                    const messageElement = this._createElement('div', {
                        className: messageData.className,
                        innerHTML: messageData.content
                    });
                    
                    container.appendChild(messageElement);
                    resolve(messageElement);
                });
            });
        }
    };
    
})(window, document);