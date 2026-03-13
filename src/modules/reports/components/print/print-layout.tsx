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
    <div className="print-page bg-white text-black font-sans text-[10pt] sm:text-[11pt] p-0">
      {/* School Header */}
      <div className="print-header text-center border-b-2 border-black pb-2 sm:pb-3 mb-3 sm:mb-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {school.logo && (
            <Image
              src={school.logo}
              alt="School logo"
              width={64}
              height={64}
              className="h-10 w-10 sm:h-16 sm:w-16 object-contain"
            />
          )}
          <div>
            <h1 className="text-base sm:text-xl font-bold uppercase tracking-wide">{school.name}</h1>
            {school.address && (
              <p className="text-xs sm:text-sm text-gray-700">{school.address}</p>
            )}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-600 mt-0.5">
              {school.phone && <span>Tel: {school.phone}</span>}
              {school.email && <span>Email: {school.email}</span>}
              {school.website && <span>{school.website}</span>}
            </div>
            {school.reportHeaderText && (
              <p className="text-xs sm:text-sm italic mt-1">{school.reportHeaderText}</p>
            )}
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest border border-black inline-block px-3 sm:px-6 py-0.5 sm:py-1">
            {title}
          </h2>
        </div>
      </div>

      {/* Content */}
      {children}

      {/* Signatures */}
      {showSignatures && (
        <div className="mt-6 sm:mt-8 flex flex-wrap justify-between items-end gap-4 sm:gap-4 print-signatures">
          <div className="text-center">
            <div className="border-t border-black pt-1 w-36 mx-auto" />
            <p className="text-xs mt-1">Class Teacher</p>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1 w-36 mx-auto" />
            <p className="text-xs mt-1">{school.examControllerName ?? 'Exam Controller'}</p>
          </div>
          <div className="text-center">
            {school.signatureImageUrl && (
              <Image
                src={school.signatureImageUrl}
                alt="Principal signature"
                width={100}
                height={40}
                className="h-10 object-contain mx-auto mb-1"
              />
            )}
            <div className="border-t border-black pt-1 w-36 mx-auto" />
            <p className="text-xs mt-1">{school.principalName ?? 'Principal'}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      {school.reportFooterText && (
        <p className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-gray-500 border-t pt-2">
          {school.reportFooterText}
        </p>
      )}
    </div>
  );
}
