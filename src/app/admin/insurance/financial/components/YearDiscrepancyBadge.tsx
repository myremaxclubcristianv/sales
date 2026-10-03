'use client'

import React from 'react'
import { FileSpreadsheet, ShieldAlert } from 'lucide-react'

export function YearDiscrepancyBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 text-amber-900 dark:text-amber-200 shadow-2xs ${className}`}>
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm">
              Notă Audit: Discrepanță An Înregistrare vs. Titlu Sursă
            </h4>
            <span className="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-800 text-[10px] font-bold tracking-wide uppercase">
              Verificare Administrativă
            </span>
          </div>
          <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
            Titlul sursei Excel originale este specificat ca <strong className="font-semibold">„CIF ASIGURĂRI 2025”</strong>, însă datele cronologice ale tranzacțiilor din document sunt datate în anul <strong className="font-semibold">2026</strong> (ex: 08/04/2026 – 02/10/2026). Conform principiului <em>Zero Guessing / Zero Mutation</em>, datele calendaristice au fost importate exact așa cum apar în sursă, fără modificări distructive.
          </p>
          <div className="flex items-center gap-4 pt-1 text-[11px] text-amber-700 dark:text-amber-400 font-mono">
            <span className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Source Year Label: 2025
            </span>
            <span>•</span>
            <span>Record Transaction Year: 2026</span>
          </div>
        </div>
      </div>
    </div>
  )
}
