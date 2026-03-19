'use client';

import { PrintLayout } from './print-layout';
import type { DmcData, GroupScore } from '../../types/report-types';
import { GROUP_SCORE_STATUS_LABELS } from '../../engine/report-constants';

type Props = { dmc: DmcData };

export function DmcPrintTemplate({ dmc }: Props) {
  const { school, resultTerm, className, sectionName, academicSession, student, subjects, summary, attendance, classTeacherRemarks, principalRemarks, dateOfIssue } = dmc;

  return (
    <PrintLayout school={school} title="Detailed Marks Certificate" showSignatures>
      {/* Meta Info Row */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:text-sm mb-5 print:mb-4">
        {[
          { label: 'Academic Session', value: academicSession },
          { label: 'Class / Section',  value: `${className} — ${sectionName}` },
          { label: 'Exam',             value: resultTerm.name },
          { label: 'Date of Issue',    value: dateOfIssue },
        ].map(({ label, value }) => (
          <div key={label} className="flex gap-2">
            <span className="font-semibold w-36 shrink-0 text-slate-600 print:text-black">{label}:</span>
            <span className="text-slate-800 print:text-black">{value}</span>
          </div>
        ))}
      </div>

      {/* Student Info Box */}
      <div className="dmc-student-info bg-slate-50 print:bg-transparent border border-slate-200 print:border-black rounded-xl print:rounded-none p-3 sm:p-4 print:p-2 mb-5 print:mb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs sm:text-sm">
        <div className="flex gap-2">
          <span className="font-semibold w-32 shrink-0 text-slate-500 print:text-black">Student Name:</span>
          <span className="font-bold text-slate-900 print:text-black">{student.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-semibold w-32 shrink-0 text-slate-500 print:text-black">Roll No:</span>
          <span className="text-slate-800 print:text-black">{student.rollNumber}</span>
        </div>
        {student.fatherName && (
          <div className="flex gap-2">
            <span className="font-semibold w-32 shrink-0 text-slate-500 print:text-black">Father's Name:</span>
            <span className="text-slate-800 print:text-black">{student.fatherName}</span>
          </div>
        )}
        <div className="flex gap-2">
          <span className="font-semibold w-32 shrink-0 text-slate-500 print:text-black">Reg. No:</span>
          <span className="text-slate-800 print:text-black">{student.registrationNo}</span>
        </div>
        {student.dateOfBirth && (
          <div className="flex gap-2">
            <span className="font-semibold w-32 shrink-0 text-slate-500 print:text-black">Date of Birth:</span>
            <span className="text-slate-800 print:text-black">{student.dateOfBirth}</span>
          </div>
        )}
        {student.gender && (
          <div className="flex gap-2">
            <span className="font-semibold w-32 shrink-0 text-slate-500 print:text-black">Gender:</span>
            <span className="text-slate-800 print:text-black capitalize">{student.gender.toLowerCase()}</span>
          </div>
        )}
      </div>

      {/* Marks Table */}
      <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 print:mx-0 print:px-0 mb-1">
      <table className="w-full border-collapse text-xs sm:text-sm print-table mb-4">
        <thead>
          <tr className="bg-slate-800 print:bg-gray-100 text-white print:text-black">
            <th className="border border-slate-700 print:border-black px-2 py-2 print:py-1.5 text-left w-6">#</th>
            <th className="border border-slate-700 print:border-black px-2 py-2 print:py-1.5 text-left">Subject</th>
            {resultTerm.examGroups.map((g) => (
              <th key={g.id} className="border border-slate-700 print:border-black px-2 py-2 print:py-1.5 text-center whitespace-nowrap">
                {g.name}
                <span className="block text-[10px] font-normal opacity-70 print:opacity-100">({g.weight}%)</span>
              </th>
            ))}
            <th className="border border-slate-700 print:border-black px-2 py-2 print:py-1.5 text-center">Total</th>
            <th className="border border-slate-700 print:border-black px-2 py-2 print:py-1.5 text-center">%</th>
            <th className="border border-slate-700 print:border-black px-2 py-2 print:py-1.5 text-center">Grade</th>
            <th className="border border-slate-700 print:border-black px-2 py-2 print:py-1.5 text-center">Result</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subj, i) => (
            <tr key={subj.subjectCode} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60 print:bg-gray-50'}>
              <td className="border border-slate-200 print:border-black px-2 py-1.5 print:py-1 text-center text-slate-500 print:text-black">{i + 1}</td>
              <td className="border border-slate-200 print:border-black px-2 py-1.5 print:py-1 text-slate-800 print:text-black">
                {subj.subjectName}
                <span className="ml-1 text-[10px] text-slate-400 print:text-gray-500">({subj.subjectCode})</span>
              </td>
              {resultTerm.examGroups.map((g) => {
                const score = subj.groupScores.find((gs) => gs.groupId === g.id);
                return (
                  <td key={g.id} className="border border-slate-200 print:border-black px-2 py-1.5 print:py-1 text-center text-slate-700 print:text-black">
                    {score ? renderGroupScore(score) : '—'}
                  </td>
                );
              })}
              <td className="border border-slate-200 print:border-black px-2 py-1.5 print:py-1 text-center font-semibold text-slate-800 print:text-black">
                {subj.consolidatedMarks.toFixed(1)}/{subj.maxConsolidatedMarks.toFixed(1)}
              </td>
              <td className="border border-slate-200 print:border-black px-2 py-1.5 print:py-1 text-center text-slate-700 print:text-black">
                {subj.percentage.toFixed(1)}%
              </td>
              <td className="border border-slate-200 print:border-black px-2 py-1.5 print:py-1 text-center font-bold text-slate-800 print:text-black">
                {subj.grade ?? '—'}
              </td>
              <td className={`border border-slate-200 print:border-black px-2 py-1.5 print:py-1 text-center font-bold ${subj.isPassed ? 'text-emerald-600 print:text-green-700' : 'text-red-600'}`}>
                {subj.isPassed ? 'P' : 'F'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 print:bg-gray-100 font-bold">
            <td colSpan={2} className="border border-slate-300 print:border-black px-2 py-2 print:py-1.5 text-right text-slate-700 print:text-black">Grand Total</td>
            {resultTerm.examGroups.map((g) => (
              <td key={g.id} className="border border-slate-300 print:border-black px-2 py-2 print:py-1.5" />
            ))}
            <td className="border border-slate-300 print:border-black px-2 py-2 print:py-1.5 text-center text-slate-800 print:text-black">
              {summary.grandTotalObtained.toFixed(1)}/{summary.grandTotalMax.toFixed(1)}
            </td>
            <td className="border border-slate-300 print:border-black px-2 py-2 print:py-1.5 text-center text-slate-800 print:text-black">
              {summary.overallPercentage.toFixed(1)}%
            </td>
            <td className="border border-slate-300 print:border-black px-2 py-2 print:py-1.5 text-center text-slate-800 print:text-black">
              {summary.overallGrade ?? '—'}
            </td>
            <td className={`border border-slate-300 print:border-black px-2 py-2 print:py-1.5 text-center font-bold ${summary.isOverallPassed ? 'text-emerald-600 print:text-green-700' : 'text-red-600 print:text-red-700'}`}>
              {summary.isOverallPassed ? 'PASS' : 'FAIL'}
            </td>
          </tr>
        </tfoot>
      </table>
      </div>

      {/* Summary Stats */}
      <div className="dmc-summary-section mb-4">
        {/* Screen: pill chips row */}
        <div className="print:hidden flex flex-wrap gap-2 mb-3">
          {[
            { label: 'Subjects Passed', value: `${summary.passedSubjects} / ${summary.totalSubjects}`, accent: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
            { label: 'Overall %',       value: `${summary.overallPercentage.toFixed(1)}%`,             accent: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
            ...(summary.rankInSection ? [{ label: 'Rank in Section', value: `${summary.rankInSection} / ${summary.totalStudentsInSection}`, accent: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' }] : []),
            ...(summary.rankInClass   ? [{ label: 'Rank in Class',   value: `${summary.rankInClass} / ${summary.totalStudentsInClass}`,     accent: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' }] : []),
            ...(attendance            ? [{ label: 'Attendance',       value: `${attendance.presentDays}/${attendance.totalDays} (${attendance.percentage.toFixed(1)}%)`, accent: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' }] : []),
          ].map(({ label, value, accent }) => (
            <div key={label} className={`rounded-lg px-3 py-2 text-xs font-medium ${accent}`}>
              <p className="opacity-70 text-[10px] uppercase tracking-wide">{label}</p>
              <p className="font-bold text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        {/* Print: classic two-column layout */}
        <div className="hidden print:grid grid-cols-2 gap-x-8 gap-y-1 text-xs sm:text-sm">
          <div className="flex gap-2">
            <span className="font-semibold w-32 shrink-0">Subjects Passed:</span>
            <span>{summary.passedSubjects} / {summary.totalSubjects}</span>
          </div>
          {summary.rankInSection && (
            <div className="flex gap-2">
              <span className="font-semibold w-32 shrink-0">Rank in Section:</span>
              <span>{summary.rankInSection} / {summary.totalStudentsInSection}</span>
            </div>
          )}
          {summary.rankInClass && (
            <div className="flex gap-2">
              <span className="font-semibold w-32 shrink-0">Rank in Class:</span>
              <span>{summary.rankInClass} / {summary.totalStudentsInClass}</span>
            </div>
          )}
          {attendance && (
            <div className="flex gap-2">
              <span className="font-semibold w-32 shrink-0">Attendance:</span>
              <span>{attendance.presentDays}/{attendance.totalDays} days ({attendance.percentage.toFixed(1)}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Remarks */}
      {(classTeacherRemarks || principalRemarks) && (
        <div className="dmc-summary-section grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-4 border-t border-slate-100 print:border-gray-300 pt-3">
          {classTeacherRemarks && (
            <div>
              <span className="font-semibold block mb-1 text-slate-600 print:text-black">Class Teacher Remarks:</span>
              <p className="text-slate-700 print:text-gray-800 italic">{classTeacherRemarks}</p>
            </div>
          )}
          {principalRemarks && (
            <div>
              <span className="font-semibold block mb-1 text-slate-600 print:text-black">Principal Remarks:</span>
              <p className="text-slate-700 print:text-gray-800 italic">{principalRemarks}</p>
            </div>
          )}
        </div>
      )}
    </PrintLayout>
  );
}

function renderGroupScore(score: GroupScore): string {
  if (score.status !== 'COMPUTED') {
    return GROUP_SCORE_STATUS_LABELS[score.status] ?? score.status;
  }
  if (score.obtained === null || score.total === null) return '—';
  return `${score.obtained.toFixed(1)}/${score.total}`;
}
