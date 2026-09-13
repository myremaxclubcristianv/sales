import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function Card({
  children,
  className = '',
  onClick,
  hover = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 ${
        hover ? 'hover:border-slate-300 hover:shadow-sm transition-all duration-150 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
