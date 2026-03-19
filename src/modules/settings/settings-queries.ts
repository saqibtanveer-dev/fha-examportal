import { prisma } from '@/lib/prisma';
import { APP_NAME } from '@/lib/constants';

export async function getSchoolSettings() {
  let settings = await prisma.schoolSettings.findFirst();
  if (!settings) {
    settings = await prisma.schoolSettings.create({
      data: {
        schoolName: APP_NAME,
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
  } else if (settings.schoolName.toLowerCase().includes('examcore')) {
    settings = await prisma.schoolSettings.update({
      where: { id: settings.id },
      data: { schoolName: APP_NAME },
    });
  }
  return settings;
}
