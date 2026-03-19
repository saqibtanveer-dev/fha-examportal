'use client';

import React from 'react';
import type { GazetteData } from '../../types/report-types';
import Image from 'next/image';

type Props = { gazette: GazetteData };

export function GazettePrintTemplate({ gazette }: Props) {
  const { school, resultTerm, className, sectionName, academicSession, subjects, students, summary } = gazette;

  return (
    /* Screen: paper card wrapper. Print: all decoration stripped via print: variants + print CSS. */
    <div className="gazette-screen-wrapper bg-slate-100 print:bg-transparent rounded-2xl print:rounded-none p-3 sm:p-6 print:p-0">
      <div className="gazette-screen-card bg-white shadow-2xl print:shadow-none rounded-2xl print:rounded-none ring-1 ring-slate-200/70 print:ring-0 overflow-hidden print:overflow-visible">
        <div className="page-landscape print-page bg-white text-black font-sans text-[9pt] p-4 sm:p-6 print:p-0">

          {/* School Header */}
          <div className="print-header border-b-2 border-slate-200 print:border-black pb-3 print:pb-2 mb-4 print:mb-3">
            <div className="flex items-center gap-3 sm:gap-4">
              {school.logo && (
                <Image src={school.logo} alt="logo" width={48} height={48}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg print:rounded-none shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 print:text-black">{school.name}</h1>
                {school.address && <p className="text-[10px] sm:text-xs text-slate-500 print:text-gray-700">{school.address}</p>}
                {school.reportHeaderText && <p className="text-[10px] italic text-slate-400 print:text-gray-600">{school.reportHeaderText}</p>}
              </div>
            </div>
            <div className="mt-3 print:mt-2 text-center">
              <span className="inline-block bg-slate-900 print:bg-transparent text-white print:text-black print:border print:border-black text-[10px] sm:text-xs font-bold uppercase tracking-widest px-5 py-1 rounded-full print:rounded-none print:px-3 print:py-0.5">
                Class Tabulation Sheet — {resultTerm.name}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-slate-500 print:text-black mt-2 print:mt-1">
              <span>Class: <strong className="text-slate-800 print:text-black">{className}</strong></span>
              {sectionName && <span>Section: <strong className="text-slate-800 print:text-black">{sectionName}</strong></span>}
              <span>Session: <strong className="text-slate-800 print:text-black">{academicSession}</strong></span>
              <span>Total Students: <strong className="text-slate-800 print:text-black">{summary.totalStudents}</strong></span>
              <span>Pass Rate: <strong className="text-slate-800 print:text-black">{summary.passRate.toFixed(1)}%</strong></span>
            </div>
          </div>

          {/* Main Table */}
          <div className="overflow-x-auto print:overflow-visible">
          <table className="gazette-table w-full border-collapse text-center">
            <thead>
              <tr className="bg-slate-800 print:bg-gray-200 text-white print:text-black">
                <th className="border border-slate-700 print:border-black px-1 py-1.5 print:py-1 text-left" rowSpan={2}>#</th>
                <th className="border border-slate-700 print:border-black px-1 py-1.5 print:py-1 text-left" rowSpan={2}>Student Name</th>
                <th className="border border-slate-700 print:border-black px-1 py-1.5 print:py-1" rowSpan={2}>Roll</th>
                {subjects.map((subj) => (
                  <th key={subj.id} className="border border-slate-700 print:border-black px-1 py-1.5 print:py-1"
                    colSpan={resultTerm.examGroups.length + 2}>
                    {subj.name}
                    <span className="block text-[7pt] font-normal opacity-80 print:opacity-100">({subj.code})</span>
                  </th>
                ))}
                <th className="border border-slate-700 print:border-black px-1 py-1.5 print:py-1" rowSpan={2}>Grand<br/>Total</th>
                <th className="border border-slate-700 print:border-black px-1 py-1.5 print:py-1" rowSpan={2}>%</th>
                <th className="border border-slate-700 print:border-black px-1 py-1.5 print:py-1" rowSpan={2}>Grade</th>
                <th className="border border-slate-700 print:border-black px-1 py-1.5 print:py-1" rowSpan={2}>Rank<br/>Sec</th>
                <th className="border border-slate-700 print:border-black px-1 py-1.5 print:py-1" rowSpan={2}>Rank<br/>Class</th>
                <th className="border border-slate-700 print:border-black px-1 py-1.5 print:py-1" rowSpan={2}>Result</th>
              </tr>
              <tr className="bg-slate-700 print:bg-gray-100 text-white print:text-black">
                {subjects.map((subj) => (
                  <React.Fragment key={`sub-${subj.id}`}>
                    {resultTerm.examGroups.map((g) => (
                      <th key={`${subj.id}-${g.id}`} className="border border-slate-600 print:border-black px-0.5 py-1 print:py-0.5 text-[7pt] whitespace-nowrap">
                        {g.name}<br/><span className="font-normal opacity-80 print:opacity-100">({g.weight}%)</span>
                      </th>
                    ))}
                    <th className="border border-slate-600 print:border-black px-0.5 py-1 print:py-0.5 text-[7pt]">Total</th>
                    <th className="border border-slate-600 print:border-black px-0.5 py-1 print:py-0.5 text-[7pt]">Grd</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.studentId}
                  className={!student.isOverallPassed ? 'bg-red-50/70 print:bg-red-50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 print:bg-gray-50'}>
                  <td className="border border-slate-200 print:border-black px-1 py-1 print:py-0.5 text-left text-slate-600 print:text-black">{idx + 1}</td>
                  <td className="border border-slate-200 print:border-black px-1 py-1 print:py-0.5 text-left whitespace-nowrap text-slate-800 print:text-black font-medium">
                    {student.studentName}
                  </td>
                  <td className="border border-slate-200 print:border-black px-1 py-1 print:py-0.5 text-slate-700 print:text-black">{student.rollNumber}</td>
                  {subjects.map((subj) => {
                    const sr = student.subjectMarks[subj.id];
                    return (
                      <React.Fragment key={`${student.studentId}-${subj.id}`}>
                        {resultTerm.examGroups.map((g) => {
                          const gs = sr?.groupScores.find((s) => s.groupId === g.id);
                          return (
                            <td key={`${student.studentId}-${subj.id}-${g.id}`} className="border border-slate-200 print:border-black px-0.5 py-1 print:py-0.5 text-[8pt] text-slate-700 print:text-black">
                              {gs?.status === 'COMPUTED'
                                ? gs.obtained?.toFixed(1) ?? '—'
                                : gs?.status === 'ABSENT' ? 'ABS'
                                : gs?.status === 'NO_EXAM' ? '—'
                                : gs?.status === 'PENDING' ? 'P/A'
                                : '—'}
                            </td>
                          );
                        })}
                        <td className="border border-slate-200 print:border-black px-0.5 py-1 print:py-0.5 text-[8pt] font-medium text-slate-800 print:text-black">
                          {sr ? `${sr.obtained?.toFixed(1) ?? 0}/${sr.total}` : '—'}
                        </td>
                        <td className={`border border-slate-200 print:border-black px-0.5 py-1 print:py-0.5 text-[8pt] font-semibold ${sr && !sr.isPassed ? 'text-red-600 print:text-red-700' : 'text-slate-800 print:text-black'}`}>
                          {sr?.grade ?? '—'}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td className="border border-slate-200 print:border-black px-1 py-1 print:py-0.5 font-bold text-slate-800 print:text-black">
                    {student.grandTotalObtained.toFixed(1)}/{student.grandTotalMax.toFixed(1)}
                  </td>
                  <td className="border border-slate-200 print:border-black px-1 py-1 print:py-0.5 font-bold text-slate-800 print:text-black">
                    {student.overallPercentage.toFixed(1)}%
                  </td>
                  <td className="border border-slate-200 print:border-black px-1 py-1 print:py-0.5 font-bold text-slate-800 print:text-black">
                    {student.overallGrade ?? '—'}
                  </td>
                  <td className="border border-slate-200 print:border-black px-1 py-1 print:py-0.5 text-slate-600 print:text-black">{student.rankInSection ?? '—'}</td>
                  <td className="border border-slate-200 print:border-black px-1 py-1 print:py-0.5 text-slate-600 print:text-black">{student.rankInClass ?? '—'}</td>
                  <td className={`border border-slate-200 print:border-black px-1 py-1 print:py-0.5 font-bold ${student.isOverallPassed ? 'text-emerald-600 print:text-green-700' : 'text-red-600 print:text-red-700'}`}>
                    {student.isOverallPassed ? 'P' : 'F'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 print:bg-gray-200 font-bold text-[8pt]">
                <td colSpan={3} className="border border-slate-300 print:border-black px-1 py-1.5 print:py-1 text-right text-slate-700 print:text-black">Class Summary</td>
                {subjects.map((subj) => (
                  <React.Fragment key={`sum-${subj.id}`}>
                    {resultTerm.examGroups.map((g) => (
                      <td key={`sum-${subj.id}-${g.id}`} className="border border-slate-300 print:border-black px-0.5 py-1 print:py-0.5" />
                    ))}
                    <td className="border border-slate-300 print:border-black px-0.5 py-1 print:py-0.5" />
                    <td className="border border-slate-300 print:border-black px-0.5 py-1 print:py-0.5" />
                  </React.Fragment>
                ))}
                <td className="border border-slate-300 print:border-black px-1 py-1.5 print:py-1" />
                <td className="border border-slate-300 print:border-black px-1 py-1.5 print:py-1 text-slate-800 print:text-black">{summary.avgPercentage.toFixed(1)}%</td>
                <td className="border border-slate-300 print:border-black px-1 py-1.5 print:py-1" />
                <td colSpan={3} className="border border-slate-300 print:border-black px-1 py-1.5 print:py-1 text-slate-700 print:text-black">
                  Pass: {summary.passedStudents}/{summary.totalStudents} ({summary.passRate.toFixed(1)}%)
                </td>
              </tr>
            </tfoot>
          </table>
          </div>

          {/* Signatures */}
          <div className="mt-5 print:mt-4 flex justify-between text-xs text-slate-500 print:text-black print-signatures">
            <div className="text-center">
              <div className="border-t border-slate-300 print:border-black pt-1 w-28 mx-auto" />
              <p className="mt-1">Class Teacher</p>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-300 print:border-black pt-1 w-28 mx-auto" />
              <p className="mt-1">{school.examControllerName ?? 'Exam Controller'}</p>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-300 print:border-black pt-1 w-28 mx-auto" />
              <p className="mt-1">{school.principalName ?? 'Principal'}</p>
            </div>
          </div>

          {school.reportFooterText && (
            <p className="mt-3 text-center text-[8pt] text-slate-400 print:text-gray-500 border-t border-slate-100 print:border-gray-300 pt-1">{school.reportFooterText}</p>
          )}

        </div>
      </div>
    </div>
  );
}
