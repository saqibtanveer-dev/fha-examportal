import { prisma } from '@/lib/prisma';

export async function getSchoolSettings() {
  let settings = await prisma.schoolSettings.findFirst();
  if (!settings) {
    settings = await prisma.schoolSettings.create({
      data: {
        schoolName: 'ExamCore School',
        academicYear: new Date().getFullYear().toString(),
        gradingScale: {
          'A+': { min: 90, max: 100 },
          'A': { min: 80, max: 89 },
          'B': { min: 70, max: 79 },
          'C': { min: 60, max: 69 },
          'D': { min: 50, max: 59 },
          'F': { min: 0, max: 49 },
        },
      },
    });
  }
  return settings;
}
