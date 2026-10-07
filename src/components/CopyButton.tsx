'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  textToCopy: string
  label?: string
  ariaLabel: string
  className?: string
}

export function CopyButton({
  textToCopy,
  label,
  ariaLabel,
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!textToCopy) return

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement('textarea')
        textArea.value = textToCopy
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }

      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err)
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={ariaLabel}
        title={copied ? 'Copiat!' : ariaLabel}
        className={`inline-flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
          copied ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : ''
        } ${className}`}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75 duration-100" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {label && <span className="ml-1 text-xs">{label}</span>}
      </button>

      {copied && (
        <span
          role="status"
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-slate-900 dark:bg-slate-800 rounded shadow-md pointer-events-none whitespace-nowrap z-30 animate-in fade-in zoom-in-95 duration-150"
        >
          Copiat
        </span>
      )}
    </div>
  )
}
