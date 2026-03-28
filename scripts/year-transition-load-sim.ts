import { prisma } from '../src/lib/prisma';

type Args = {
  sessionId?: string;
  chunkSize: number;
  maxSampleClasses: number;
  json: boolean;
};

type ClassLoadRow = {
  classId: string;
  className: string;
  grade: number;
  activeStudents: number;
  hasNextClass: boolean;
  nextClassId: string | null;
  nextClassSections: number;
};

function parsePositiveInt(input: string | undefined, fallback: number): number {
  if (!input) return fallback;
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    if (index === -1) return undefined;
    return argv[index + 1];
  };

  if (argv.includes('--help') || argv.includes('-h')) {
    console.log([
      'Usage: tsx scripts/year-transition-load-sim.ts [options]',
      '',
      'Options:',
      '  --session-id <uuid>        Academic session to inspect (default: current session)',
      '  --chunk-size <number>      Transition chunk size (default: 250)',
      '  --max-sample-classes <n>   Max class mappings to print (default: 30)',
      '  --json                     Print JSON report only',
    ].join('\n'));
    process.exit(0);
  }

  return {
    sessionId: get('--session-id'),
    chunkSize: parsePositiveInt(get('--chunk-size'), 250),
    maxSampleClasses: parsePositiveInt(get('--max-sample-classes'), 30),
    json: argv.includes('--json'),
  };
}

async function resolveSessionId(sessionId?: string): Promise<string> {
  if (sessionId) return sessionId;

  const current = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  if (!current) {
    throw new Error('No current academic session found. Pass --session-id explicitly.');
  }

  return current.id;
}

async function buildClassLoadRows(): Promise<ClassLoadRow[]> {
  const classes = await prisma.class.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      grade: true,
      sections: {
        where: { isActive: true },
        select: { id: true },
      },
      _count: {
        select: {
          students: {
            where: { status: 'ACTIVE' },
          },
        },
      },
    },
    orderBy: { grade: 'asc' },
  });

  const classByGrade = new Map<number, { id: string; sections: number }>();
  for (const row of classes) {
    classByGrade.set(row.grade, { id: row.id, sections: row.sections.length });
  }

  return classes.map((row) => {
    const next = classByGrade.get(row.grade + 1);
    return {
      classId: row.id,
      className: row.name,
      grade: row.grade,
      activeStudents: row._count.students,
      hasNextClass: Boolean(next),
      nextClassId: next?.id ?? null,
      nextClassSections: next?.sections ?? 0,
    };
  });
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const academicSessionId = await resolveSessionId(args.sessionId);

  const [classRows, existingPromotionCount] = await Promise.all([
    buildClassLoadRows(),
    prisma.studentPromotion.count({ where: { academicSessionId } }),
  ]);

  const totalStudents = classRows.reduce((acc, row) => acc + row.activeStudents, 0);
  const classesWithStudents = classRows.filter((row) => row.activeStudents > 0);
  const classesWithoutNext = classesWithStudents.filter((row) => !row.hasNextClass);
  const classesWithMissingTargetSections = classesWithStudents.filter(
    (row) => row.hasNextClass && row.nextClassSections === 0,
  );

  const estimatedChunkCount = Math.ceil(totalStudents / args.chunkSize);
  const estimatedWriteOps = {
    promotionCreateMany: estimatedChunkCount,
    studentProfileUpdateMany: estimatedChunkCount,
    notificationCreateMany: estimatedChunkCount,
    userUpdateMany: estimatedChunkCount,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    academicSessionId,
    existingPromotionCount,
    chunkSize: args.chunkSize,
    totals: {
      totalActiveStudents: totalStudents,
      classesWithActiveStudents: classesWithStudents.length,
      estimatedChunkCount,
    },
    riskFlags: {
      classesWithoutNextClass: classesWithoutNext.length,
      classesWithMissingTargetSections: classesWithMissingTargetSections.length,
      sessionAlreadyHasTransitions: existingPromotionCount > 0,
    },
    estimatedWriteOps,
    sampleClassMatrix: classRows.slice(0, args.maxSampleClasses),
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('Year Transition Load Simulation');
  console.log('================================');
  console.log(`Session: ${academicSessionId}`);
  console.log(`Existing transitions in session: ${existingPromotionCount}`);
  console.log(`Total active students: ${totalStudents}`);
  console.log(`Classes with active students: ${classesWithStudents.length}`);
  console.log(`Chunk size: ${args.chunkSize}`);
  console.log(`Estimated chunks: ${estimatedChunkCount}`);
  console.log('');

  if (classesWithoutNext.length > 0) {
    console.log(`Risk: ${classesWithoutNext.length} class(es) have no next grade class (typically final classes).`);
  }

  if (classesWithMissingTargetSections.length > 0) {
    console.log(`Risk: ${classesWithMissingTargetSections.length} class(es) map to next class with zero active sections.`);
  }

  if (existingPromotionCount > 0) {
    console.log('Notice: Session already contains transition rows. Partial execution mode will skip already processed students.');
  }

  console.log('');
  console.log('Estimated write operation groups per run:');
  console.log(JSON.stringify(estimatedWriteOps, null, 2));
  console.log('');
  console.log('Class matrix sample:');
  for (const row of report.sampleClassMatrix) {
    console.log(
      `- ${row.className} (grade ${row.grade}): ${row.activeStudents} active, ` +
      `next=${row.nextClassId ?? 'none'}, nextSections=${row.nextClassSections}`,
    );
  }
}

main()
  .catch((error) => {
    console.error('Year transition load simulation failed');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
