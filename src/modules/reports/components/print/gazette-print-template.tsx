'use client';

import type { GazetteData } from '../../types/report-types';
import Image from 'next/image';

type Props = { gazette: GazetteData };

export function GazettePrintTemplate({ gazette }: Props) {
  const { school, resultTerm, className, sectionName, academicSession, subjects, students, summary } = gazette;

  return (
    <div className="page-landscape print-page bg-white text-black text-[9pt] font-sans overflow-x-auto">
      {/* School Header */}
      <div className="print-header text-center border-b-2 border-black pb-2 mb-3">
        <div className="flex items-center justify-center gap-3">
          {school.logo && (
            <Image src={school.logo} alt="logo" width={48} height={48} className="h-12 w-12 object-contain" />
          )}
          <div>
            <h1 className="text-lg font-bold uppercase">{school.name}</h1>
            {school.address && <p className="text-xs">{school.address}</p>}
            {school.reportHeaderText && <p className="text-xs italic">{school.reportHeaderText}</p>}
          </div>
        </div>
        <h2 className="mt-2 text-sm font-bold uppercase border border-black inline-block px-4 py-0.5">
          CLASS TABULATION SHEET — {resultTerm.name}
        </h2>
        <div className="flex justify-center gap-6 text-xs mt-1">
          <span>Class: <strong>{className}</strong></span>
          {sectionName && <span>Section: <strong>{sectionName}</strong></span>}
          <span>Session: <strong>{academicSession}</strong></span>
          <span>Total Students: <strong>{summary.totalStudents}</strong></span>
          <span>Pass Rate: <strong>{summary.passRate.toFixed(1)}%</strong></span>
        </div>
      </div>

      {/* Main Table */}
      <table className="gazette-table w-full border-collapse text-center">
        <thead>
          {/* Exam Groups header row */}
          <tr className="bg-gray-200">
            <th className="border border-black px-1 py-1 text-left" rowSpan={2}>#</th>
            <th className="border border-black px-1 py-1 text-left" rowSpan={2}>Student Name</th>
            <th className="border border-black px-1 py-1" rowSpan={2}>Roll</th>
            {subjects.map((subj) => (
              <th
                key={subj.id}
                className="border border-black px-1 py-1"
                colSpan={resultTerm.examGroups.length + 2}
              >
                {subj.name}
                <span className="block text-[7pt] font-normal">({subj.code})</span>
              </th>
            ))}
            <th className="border border-black px-1 py-1" rowSpan={2}>Grand<br/>Total</th>
            <th className="border border-black px-1 py-1" rowSpan={2}>%</th>
            <th className="border border-black px-1 py-1" rowSpan={2}>Grade</th>
            <th className="border border-black px-1 py-1" rowSpan={2}>Rank<br/>Sec</th>
            <th className="border border-black px-1 py-1" rowSpan={2}>Rank<br/>Class</th>
            <th className="border border-black px-1 py-1" rowSpan={2}>Result</th>
          </tr>
          <tr className="bg-gray-100">
            {subjects.map((subj) => (
              <>
                {resultTerm.examGroups.map((g) => (
                  <th key={`${subj.id}-${g.id}`} className="border border-black px-0.5 py-0.5 text-[7pt] whitespace-nowrap">
                    {g.name}<br/><span className="font-normal">({g.weight}%)</span>
                  </th>
                ))}
                <th key={`${subj.id}-total`} className="border border-black px-0.5 py-0.5 text-[7pt]">Total</th>
                <th key={`${subj.id}-grade`} className="border border-black px-0.5 py-0.5 text-[7pt]">Grd</th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => (
            <tr key={student.studentId} className={!student.isOverallPassed ? 'bg-red-50' : idx % 2 === 0 ? '' : 'bg-gray-50'}>
              <td className="border border-black px-1 py-0.5 text-left">{idx + 1}</td>
              <td className="border border-black px-1 py-0.5 text-left whitespace-nowrap">
                {student.studentName}
              </td>
              <td className="border border-black px-1 py-0.5">{student.rollNumber}</td>
              {subjects.map((subj) => {
                const sr = student.subjectMarks[subj.id];
                return (
                  <>
                    {resultTerm.examGroups.map((g) => {
                      const gs = sr?.groupScores.find((s) => s.groupId === g.id);
                      return (
                        <td key={`${student.studentId}-${subj.id}-${g.id}`} className="border border-black px-0.5 py-0.5 text-[8pt]">
                          {gs?.status === 'COMPUTED'
                            ? gs.obtained?.toFixed(1) ?? '—'
                            : gs?.status === 'ABSENT' ? 'ABS'
                            : gs?.status === 'NO_EXAM' ? '—'
                            : gs?.status === 'PENDING' ? 'P/A'
                            : '—'}
                        </td>
                      );
                    })}
                    <td key={`${student.studentId}-${subj.id}-total`} className="border border-black px-0.5 py-0.5 text-[8pt] font-medium">
                      {sr ? `${sr.obtained?.toFixed(1) ?? 0}/${sr.total}` : '—'}
                    </td>
                    <td key={`${student.studentId}-${subj.id}-grade`} className={`border border-black px-0.5 py-0.5 text-[8pt] font-semibold ${sr && !sr.isPassed ? 'text-red-700' : ''}`}>
                      {sr?.grade ?? '—'}
                    </td>
                  </>
                );
              })}
              <td className="border border-black px-1 py-0.5 font-bold">
                {student.grandTotalObtained.toFixed(1)}/{student.grandTotalMax.toFixed(1)}
              </td>
              <td className="border border-black px-1 py-0.5 font-bold">
                {student.overallPercentage.toFixed(1)}%
              </td>
              <td className="border border-black px-1 py-0.5 font-bold">
                {student.overallGrade ?? '—'}
              </td>
              <td className="border border-black px-1 py-0.5">{student.rankInSection ?? '—'}</td>
              <td className="border border-black px-1 py-0.5">{student.rankInClass ?? '—'}</td>
              <td className={`border border-black px-1 py-0.5 font-bold ${student.isOverallPassed ? 'text-green-700' : 'text-red-700'}`}>
                {student.isOverallPassed ? 'P' : 'F'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-200 font-bold text-[8pt]">
            <td colSpan={3} className="border border-black px-1 py-1 text-right">Class Summary</td>
            {subjects.map((subj) => (
              <>
                {resultTerm.examGroups.map((g) => (
                  <td key={`sum-${subj.id}-${g.id}`} className="border border-black px-0.5 py-0.5" />
                ))}
                <td key={`sum-${subj.id}-total`} className="border border-black px-0.5 py-0.5" />
                <td key={`sum-${subj.id}-grade`} className="border border-black px-0.5 py-0.5" />
              </>
            ))}
            <td className="border border-black px-1 py-1" />
            <td className="border border-black px-1 py-1">{summary.avgPercentage.toFixed(1)}%</td>
            <td className="border border-black px-1 py-1" />
            <td colSpan={3} className="border border-black px-1 py-1">
              Pass: {summary.passedStudents}/{summary.totalStudents} ({summary.passRate.toFixed(1)}%)
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="mt-4 flex justify-between text-xs print-signatures">
        <div className="text-center">
          <div className="border-t border-black pt-1 w-28 mx-auto" />
          <p>Class Teacher</p>
        </div>
        <div className="text-center">
          <div className="border-t border-black pt-1 w-28 mx-auto" />
          <p>{school.examControllerName ?? 'Exam Controller'}</p>
        </div>
        <div className="text-center">
          <div className="border-t border-black pt-1 w-28 mx-auto" />
          <p>{school.principalName ?? 'Principal'}</p>
        </div>
      </div>

      {school.reportFooterText && (
        <p className="mt-3 text-center text-[8pt] text-gray-500 border-t pt-1">{school.reportFooterText}</p>
      )}
    </div>
  );
}
