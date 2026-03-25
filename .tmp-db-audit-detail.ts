import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const unlinkedFamilies = await prisma.familyProfile.findMany({
    where: { studentLinks: { none: { isActive: true } } },
    select: {
      id: true,
      relationship: true,
      emergencyPhone: true,
      user: { select: { email: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const possibleF421 = unlinkedFamilies.filter((f) =>
    (f.user.email || '').toLowerCase().includes('f421')
  );

  console.log(JSON.stringify({
    unlinkedFamiliesCount: unlinkedFamilies.length,
    unlinkedFamilies,
    possibleF421,
  }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
