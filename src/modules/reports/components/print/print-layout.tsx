'use client';

import type { ReactNode } from 'react';
import type { SchoolInfo } from '../../types/report-types';
import Image from 'next/image';

type Props = {
  school: SchoolInfo;
  title: string;
  children: ReactNode;
  orientation?: 'portrait' | 'landscape';
  showSignatures?: boolean;
};

export function PrintLayout({ school, title, children, showSignatures = true }: Props) {
  return (
    /* Screen: slate background + paper card. Print: all decorations stripped. */
    <div className="bg-slate-100 print:bg-transparent rounded-2xl print:rounded-none p-3 sm:p-8 print:p-0">
      <div className="bg-white shadow-2xl print:shadow-none rounded-2xl print:rounded-none ring-1 ring-slate-200/70 print:ring-0 overflow-hidden print:overflow-visible">
        <div className="print-page bg-white text-black font-sans text-[10pt] sm:text-[11pt] p-5 sm:p-10 print:p-0">

          {/* School Header */}
          <div className="print-header border-b-2 border-slate-200 print:border-black pb-4 print:pb-2 mb-5 print:mb-3">
            <div className="flex items-center gap-3 sm:gap-5">
              {school.logo && (
                <Image
                  src={school.logo}
                  alt="School logo"
                  width={72}
                  height={72}
                  className="h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem] object-contain rounded-xl print:rounded-none shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl print:text-xl font-bold uppercase tracking-wide text-slate-900 print:text-black">
                  {school.name}
                </h1>
                {school.address && (
                  <p className="text-xs sm:text-sm text-slate-500 print:text-gray-700 mt-0.5">{school.address}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] sm:text-xs text-slate-400 print:text-gray-600 mt-1">
                  {school.phone && <span>Tel: {school.phone}</span>}
                  {school.email && <span>{school.email}</span>}
                  {school.website && <span>{school.website}</span>}
                </div>
                {school.reportHeaderText && (
                  <p className="text-xs italic text-slate-500 print:text-gray-700 mt-1">{school.reportHeaderText}</p>
                )}
              </div>
            </div>
            <div className="mt-4 print:mt-2 text-center">
              <span className="inline-block bg-slate-900 print:bg-transparent text-white print:text-black print:border print:border-black text-xs sm:text-sm font-bold uppercase tracking-widest px-6 py-1.5 print:px-4 print:py-0.5 rounded-full print:rounded-none">
                {title}
              </span>
            </div>
          </div>

          {/* Content */}
          {children}

          {/* Signatures */}
          {showSignatures && (
            <div className="print-signatures mt-10 print:mt-6 flex flex-wrap justify-between items-end gap-6 print:gap-4">
              <div className="text-center flex-1 min-w-[100px]">
                <div className="border-t border-slate-300 print:border-black pt-1 w-32 mx-auto" />
                <p className="text-xs mt-1 text-slate-500 print:text-black">Class Teacher</p>
              </div>
              <div className="text-center flex-1 min-w-[100px]">
                <div className="border-t border-slate-300 print:border-black pt-1 w-32 mx-auto" />
                <p className="text-xs mt-1 text-slate-500 print:text-black">{school.examControllerName ?? 'Exam Controller'}</p>
              </div>
              <div className="text-center flex-1 min-w-[100px]">
                {school.signatureImageUrl && (
                  <Image
                    src={school.signatureImageUrl}
                    alt="Principal signature"
                    width={100}
                    height={40}
                    className="h-10 object-contain mx-auto mb-1"
                  />
                )}
                <div className="border-t border-slate-300 print:border-black pt-1 w-32 mx-auto" />
                <p className="text-xs mt-1 text-slate-500 print:text-black">{school.principalName ?? 'Principal'}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          {school.reportFooterText && (
            <p className="mt-4 text-center text-[10px] sm:text-xs text-slate-400 print:text-gray-500 border-t border-slate-100 print:border-gray-300 pt-2">
              {school.reportFooterText}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
