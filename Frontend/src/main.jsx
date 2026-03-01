import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#fafafa',
    colorBackground: '#0a0a0a',
    colorInputBackground: '#18181b',
    colorInputText: '#fafafa',
    colorText: '#fafafa',
    colorTextSecondary: '#a1a1aa',
    colorTextSecondaryAlpha: 'rgba(161, 161, 170, 0.5)',
    colorNeutral: '#d4d4d8',
    colorDanger: '#EF4444',
    colorSuccess: '#10B981',
    borderRadius: '0.75rem',
    borderRadiusSm: '0.5rem',
    borderRadiusMd: '0.75rem',
    borderRadiusLg: '1rem',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: '14px',
    fontSizeSm: '13px',
    fontSizeMd: '14px',
    fontSizeLg: '16px',
    spacing: '12px',
    spacingSm: '8px',
    spacingMd: '12px',
    spacingLg: '16px',
    spacingXl: '24px',
  },
  elements: {
    // Root
    rootBox: 'w-full',
    
    // Card
    card: 'w-full !shadow-none !bg-transparent !p-0 !border-0',
    cardBox: 'w-full !shadow-none !bg-transparent !p-0 !border-0',
    
    // Header - hide since we have our own
    header: '!hidden',
    headerTitle: '!hidden',
    headerSubtitle: '!hidden',
    headerBack: '!hidden',
    
    // Form
    form: 'w-full flex flex-col gap-3',
    formContainer: 'w-full flex flex-col gap-3',
    formField: 'w-full',
    formFieldContainer: 'w-full',
    formFieldLabel: '!text-zinc-400 text-sm font-medium mb-1.5 block',
    formFieldLabelRow: 'flex items-center gap-2',
    formFieldLabelHint: '!text-zinc-600 text-xs',
    formFieldInput: '!bg-zinc-900 !border-zinc-800 focus:!border-zinc-600 !rounded-xl w-full py-3 px-3.5 !text-zinc-50',
    formFieldInputField: '!bg-zinc-900 !border-zinc-800 focus:!border-zinc-600 !rounded-xl w-full py-3 px-3.5 !text-zinc-50',
    formFieldInputShowPasswordButton: '!text-zinc-500 hover:!text-zinc-400',
    formFieldInputWrapper: 'w-full',
    formFieldError: '!text-red-500 text-xs mt-1',
    formFieldErrorText: '!text-red-500 text-xs mt-1',
    formFieldAction: '!text-zinc-500 hover:!text-zinc-300 text-xs',
    formFieldRow: 'grid grid-cols-2 gap-3 w-full',
    
    // Buttons
    formButtons: 'flex flex-col gap-3 mt-1 w-full',
    formButtonsRow: 'flex flex-col gap-3 mt-1 w-full',
    formButtonPrimary: '!bg-zinc-50 !text-zinc-950 hover:!bg-zinc-200 !w-full py-3 !rounded-xl font-medium transition-all duration-200 active:scale-[0.98]',
    formButtonSecondary: '!bg-zinc-900 !border !border-zinc-800 hover:!bg-zinc-800 !w-full py-3 !rounded-xl font-medium transition-colors !text-zinc-300',
    
    // Social buttons
    socialButtons: 'flex flex-col gap-3 w-full',
    socialButtonsBlock: 'flex flex-col gap-3 w-full',
    socialButtonsContainer: 'flex flex-col gap-3 w-full',
    socialButtonsBlockButton: '!bg-zinc-900 !border !border-zinc-800 hover:!bg-zinc-800 !w-full py-3 !rounded-xl font-medium transition-colors',
    socialButtonsBlockButtonText: '!text-zinc-300 !font-medium text-sm',
    socialButtonsBlockButtonIcon: '!text-zinc-400',
    socialButtonsBlockButtonArrow: '!text-zinc-500',
    socialButtonsProviderIcon: '!text-zinc-400',
    
    // Divider
    divider: 'flex items-center gap-4 my-4 w-full',
    dividerBlock: 'flex items-center gap-4 my-4 w-full',
    dividerLine: '!bg-zinc-800 flex-1 h-px',
    dividerText: '!text-zinc-500 text-sm',
    dividerWord: '!text-zinc-500 text-sm',
    
    // Footer
    footer: 'mt-6 text-center flex items-center justify-center gap-1 flex-wrap',
    footerAction: 'mt-6 text-center flex items-center justify-center gap-1 flex-wrap',
    footerActionText: '!text-zinc-500 text-sm',
    footerActionLink: '!text-zinc-200 hover:!text-zinc-50 text-sm font-medium underline underline-offset-2',
    footerActionLinkText: '!text-zinc-200 hover:!text-zinc-50 text-sm font-medium underline underline-offset-2',
    
    // Alerts
    alert: '!bg-red-500/10 !border !border-red-500/30 !rounded-xl !text-red-500 p-3 text-sm',
    alertText: '!text-red-500',
    
    // Errors
    formFieldWarning: '!text-amber-500 text-xs',
    formFieldWarningText: '!text-amber-500 text-xs',
    
    // Branding/Powered by - hide
    userButton: '!hidden',
    userPreview: '!hidden',
    branding: '!hidden',
    
    // OIDC
    oidcBlock: 'flex flex-col gap-3 w-full',
    oidcBlockButton: '!bg-zinc-900 !border !border-zinc-800 hover:!bg-zinc-800 !w-full py-3 !rounded-xl font-medium transition-colors !text-zinc-300',
    
    // Alternative methods
    alternativeMethods: 'flex flex-col gap-3 w-full mt-4',
    alternativeMethodsBlock: 'flex flex-col gap-3 w-full mt-4',
    
    // Badge
    badge: '!hidden',
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'))

if (PUBLISHABLE_KEY) {
  root.render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={clerkAppearance}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  )
} else {
  // No Clerk key — render without auth (for local preview / development)
  console.warn('[Nivesh-Setu] VITE_CLERK_PUBLISHABLE_KEY not set. Auth features will be unavailable. Create a .env file to enable Clerk.')
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

