import { PrismaClient, DayOfWeek } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ============================================
  // 1. School Settings
  // ============================================
  await prisma.schoolSettings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      schoolName: 'Faith Horizon Academy',
      academicYear: '2025',
      email: 'admin@faithhorizon.school',
      phone: '+92-300-1234567',
      address: 'Islamabad, Pakistan',
      timezone: 'Asia/Karachi',
      gradingScale: {
        'A+': { min: 90, max: 100 },
        A: { min: 80, max: 89 },
        B: { min: 70, max: 79 },
        C: { min: 60, max: 69 },
        D: { min: 50, max: 59 },
        F: { min: 0, max: 49 },
      },
    },
  });
  console.log('✅ School settings');

  // ============================================
  // 2. Academic Sessions
  // ============================================
  const session2024 = await prisma.academicSession.upsert({
    where: { name: '2024-2025' },
    update: {},
    create: {
      name: '2024-2025',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      isCurrent: false,
    },
  });
  const session2025 = await prisma.academicSession.upsert({
    where: { name: '2025-2026' },
    update: {},
    create: {
      name: '2025-2026',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      isCurrent: true,
    },
  });
  console.log('✅ Academic sessions');

  // ============================================
  // 3. Admin User
  // ============================================
  const pw = (p: string) => bcrypt.hashSync(p, 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@faithhorizon.school' },
    update: {},
    create: {
      email: 'admin@faithhorizon.school',
      passwordHash: pw(process.env.ADMIN_INITIAL_PASSWORD ?? 'AdminPass123!'),
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user');

  // ============================================
  // 3b. Principal User
  // ============================================
  const principal = await prisma.user.upsert({
    where: { email: 'principal@faithhorizon.school' },
    update: {},
    create: {
      email: 'principal@faithhorizon.school',
      passwordHash: pw('Principal123!'),
      firstName: 'Head',
      lastName: 'Principal',
      role: 'PRINCIPAL',
      isActive: true,
    },
  });
  console.log('✅ Principal user');

  // ============================================
  // 4. Departments
  // ============================================
  const [scienceDept, mathsDept, engDept, socialDept] = await Promise.all([
    prisma.department.upsert({ where: { name: 'Science' }, update: {}, create: { name: 'Science', description: 'Natural Sciences' } }),
    prisma.department.upsert({ where: { name: 'Mathematics' }, update: {}, create: { name: 'Mathematics', description: 'Mathematics Department' } }),
    prisma.department.upsert({ where: { name: 'English' }, update: {}, create: { name: 'English', description: 'English Language & Literature' } }),
    prisma.department.upsert({ where: { name: 'Social Studies' }, update: {}, create: { name: 'Social Studies', description: 'History, Geography, Civics' } }),
  ]);
  console.log('✅ 4 departments');

  // ============================================
  // 5. Subjects
  // ============================================
  const [physics, chemistry, biology, maths, english, urdu, history, computer] = await Promise.all([
    prisma.subject.upsert({ where: { code: 'PHY-101' }, update: {}, create: { name: 'Physics', code: 'PHY-101', departmentId: scienceDept.id } }),
    prisma.subject.upsert({ where: { code: 'CHM-101' }, update: {}, create: { name: 'Chemistry', code: 'CHM-101', departmentId: scienceDept.id } }),
    prisma.subject.upsert({ where: { code: 'BIO-101' }, update: {}, create: { name: 'Biology', code: 'BIO-101', departmentId: scienceDept.id } }),
    prisma.subject.upsert({ where: { code: 'MTH-101' }, update: {}, create: { name: 'Mathematics', code: 'MTH-101', departmentId: mathsDept.id } }),
    prisma.subject.upsert({ where: { code: 'ENG-101' }, update: {}, create: { name: 'English', code: 'ENG-101', departmentId: engDept.id } }),
    prisma.subject.upsert({ where: { code: 'URD-101' }, update: {}, create: { name: 'Urdu', code: 'URD-101', departmentId: engDept.id } }),
    prisma.subject.upsert({ where: { code: 'HIS-101' }, update: {}, create: { name: 'History', code: 'HIS-101', departmentId: socialDept.id } }),
    prisma.subject.upsert({ where: { code: 'CSC-101' }, update: {}, create: { name: 'Computer Science', code: 'CSC-101', departmentId: mathsDept.id } }),
  ]);
  console.log('✅ 8 subjects');

  // ============================================
  // 6. Classes & Sections
  // ============================================
  async function upsertClass(name: string, grade: number) {
    const existing = await prisma.class.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.class.create({ data: { name, grade } });
  }

  const [class9, class10, class11, class12] = await Promise.all([
    upsertClass('Class 9', 9),
    upsertClass('Class 10', 10),
    upsertClass('Class 11', 11),
    upsertClass('Class 12', 12),
  ]);

  // Sections: upsert by unique(classId, name)
  const sectionData = [
    { classId: class9.id, name: 'A' }, { classId: class9.id, name: 'B' },
    { classId: class10.id, name: 'A' }, { classId: class10.id, name: 'B' },
    { classId: class11.id, name: 'A' },
    { classId: class12.id, name: 'A' },
  ];
  const sections: Record<string, { id: string }> = {};
  for (const s of sectionData) {
    const sec = await prisma.section.upsert({
      where: { classId_name: { classId: s.classId, name: s.name } },
      update: {},
      create: { classId: s.classId, name: s.name },
    });
    const cls = [class9, class10, class11, class12].find((c) => c.id === s.classId);
    if (cls) sections[`${cls.grade}-${s.name}`] = sec;
  }
  console.log('✅ 4 classes, 6 sections');

  // Helper to safely get section id
  function secId(key: string): string {
    const s = sections[key];
    if (!s) throw new Error(`Section ${key} not found`);
    return s.id;
  }

  // ============================================
  // 7. Subject-Class Links
  // ============================================
  const subjectClassLinks = [
    { subjectId: physics.id, classId: class9.id }, { subjectId: physics.id, classId: class10.id },
    { subjectId: chemistry.id, classId: class9.id }, { subjectId: chemistry.id, classId: class10.id },
    { subjectId: biology.id, classId: class9.id }, { subjectId: biology.id, classId: class10.id },
    { subjectId: maths.id, classId: class9.id }, { subjectId: maths.id, classId: class10.id },
    { subjectId: maths.id, classId: class11.id }, { subjectId: maths.id, classId: class12.id },
    { subjectId: english.id, classId: class9.id }, { subjectId: english.id, classId: class10.id },
    { subjectId: english.id, classId: class11.id }, { subjectId: english.id, classId: class12.id },
    { subjectId: urdu.id, classId: class9.id }, { subjectId: urdu.id, classId: class10.id },
    { subjectId: history.id, classId: class9.id }, { subjectId: history.id, classId: class10.id },
    { subjectId: computer.id, classId: class11.id }, { subjectId: computer.id, classId: class12.id },
    { subjectId: physics.id, classId: class11.id }, { subjectId: physics.id, classId: class12.id },
    { subjectId: chemistry.id, classId: class11.id }, { subjectId: chemistry.id, classId: class12.id },
  ];
  for (const l of subjectClassLinks) {
    await prisma.subjectClassLink.upsert({
      where: { subjectId_classId: { subjectId: l.subjectId, classId: l.classId } },
      update: {},
      create: { subjectId: l.subjectId, classId: l.classId, isActive: true },
    });
  }
  console.log('✅ 24 subject-class links');

  // ============================================
  // 8. Teachers (4) + Profiles + Assignments
  // ============================================
  const teacherPw = pw('Teacher123!');
  const teacherDefs = [
    { email: 'ahmed.khan@faithhorizon.school', first: 'Ahmed', last: 'Khan', empId: 'TCH-001', qual: 'MSc Physics', spec: 'Mechanics & Thermodynamics', subjects: [{ subjectId: physics.id, classId: class9.id, sectionId: secId('9-A') }, { subjectId: physics.id, classId: class10.id, sectionId: secId('10-A') }, { subjectId: maths.id, classId: class9.id, sectionId: secId('9-A') }] },
    { email: 'fatima.ali@faithhorizon.school', first: 'Fatima', last: 'Ali', empId: 'TCH-002', qual: 'MA English Literature', spec: 'Grammar & Composition', subjects: [{ subjectId: english.id, classId: class9.id, sectionId: secId('9-A') }, { subjectId: english.id, classId: class10.id, sectionId: secId('10-A') }, { subjectId: urdu.id, classId: class9.id, sectionId: secId('9-A') }] },
    { email: 'bilal.ahmed@faithhorizon.school', first: 'Bilal', last: 'Ahmed', empId: 'TCH-003', qual: 'MSc Chemistry', spec: 'Organic Chemistry', subjects: [{ subjectId: chemistry.id, classId: class9.id, sectionId: secId('9-A') }, { subjectId: chemistry.id, classId: class10.id, sectionId: secId('10-A') }, { subjectId: biology.id, classId: class9.id, sectionId: secId('9-A') }] },
    { email: 'ayesha.nawaz@faithhorizon.school', first: 'Ayesha', last: 'Nawaz', empId: 'TCH-004', qual: 'MSc Mathematics', spec: 'Calculus & Algebra', subjects: [{ subjectId: maths.id, classId: class10.id, sectionId: secId('10-A') }, { subjectId: maths.id, classId: class11.id, sectionId: secId('11-A') }, { subjectId: computer.id, classId: class11.id, sectionId: secId('11-A') }] },
  ];

  const teachers: { user: typeof admin; profile: { id: string } }[] = [];
  for (const t of teacherDefs) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { email: t.email, passwordHash: teacherPw, firstName: t.first, lastName: t.last, role: 'TEACHER', isActive: true },
    });
    const profile = await prisma.teacherProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, employeeId: t.empId, qualification: t.qual, specialization: t.spec },
    });
    // TeacherSubject assignments
    for (const sub of t.subjects) {
      await prisma.teacherSubject.upsert({
        where: { teacherId_subjectId_classId_sectionId: { teacherId: profile.id, subjectId: sub.subjectId, classId: sub.classId, sectionId: sub.sectionId } },
        update: {},
        create: { teacherId: profile.id, subjectId: sub.subjectId, classId: sub.classId, sectionId: sub.sectionId },
      });
    }
    teachers.push({ user, profile });
  }
  console.log('✅ 4 teachers with subject assignments');

  // ============================================
  // 9. Students (12)
  // ============================================
  const studentPw = pw('Student123!');
  const studentDefs = [
    { email: 'ali.raza@student.examcore.school', first: 'Ali', last: 'Raza', roll: '9A-001', reg: 'REG-2025-001', classId: class9.id, sectionId: secId('9-A') },
    { email: 'sara.ahmed@student.examcore.school', first: 'Sara', last: 'Ahmed', roll: '9A-002', reg: 'REG-2025-002', classId: class9.id, sectionId: secId('9-A') },
    { email: 'usman.malik@student.examcore.school', first: 'Usman', last: 'Malik', roll: '9B-001', reg: 'REG-2025-003', classId: class9.id, sectionId: secId('9-B') },
    { email: 'hira.sheikh@student.examcore.school', first: 'Hira', last: 'Sheikh', roll: '9B-002', reg: 'REG-2025-004', classId: class9.id, sectionId: secId('9-B') },
    { email: 'hamza.iqbal@student.examcore.school', first: 'Hamza', last: 'Iqbal', roll: '10A-001', reg: 'REG-2025-005', classId: class10.id, sectionId: secId('10-A') },
    { email: 'nadia.khan@student.examcore.school', first: 'Nadia', last: 'Khan', roll: '10A-002', reg: 'REG-2025-006', classId: class10.id, sectionId: secId('10-A') },
    { email: 'talha.hassan@student.examcore.school', first: 'Talha', last: 'Hassan', roll: '10A-003', reg: 'REG-2025-007', classId: class10.id, sectionId: secId('10-A') },
    { email: 'zainab.fatima@student.examcore.school', first: 'Zainab', last: 'Fatima', roll: '10B-001', reg: 'REG-2025-008', classId: class10.id, sectionId: secId('10-B') },
    { email: 'farhan.siddiqui@student.examcore.school', first: 'Farhan', last: 'Siddiqui', roll: '10B-002', reg: 'REG-2025-009', classId: class10.id, sectionId: secId('10-B') },
    { email: 'maryam.akram@student.examcore.school', first: 'Maryam', last: 'Akram', roll: '11A-001', reg: 'REG-2025-010', classId: class11.id, sectionId: secId('11-A') },
    { email: 'omer.shahzad@student.examcore.school', first: 'Omer', last: 'Shahzad', roll: '11A-002', reg: 'REG-2025-011', classId: class11.id, sectionId: secId('11-A') },
    { email: 'areeba.tariq@student.examcore.school', first: 'Areeba', last: 'Tariq', roll: '12A-001', reg: 'REG-2025-012', classId: class12.id, sectionId: secId('12-A') },
  ];

  const students: { user: typeof admin; profile: { id: string; classId: string; sectionId: string } }[] = [];
  for (const s of studentDefs) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { email: s.email, passwordHash: studentPw, firstName: s.first, lastName: s.last, role: 'STUDENT', isActive: true },
    });
    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, rollNumber: s.roll, registrationNo: s.reg, classId: s.classId, sectionId: s.sectionId },
    });
    students.push({ user, profile: { id: profile.id, classId: s.classId, sectionId: s.sectionId } });
  }
  console.log('✅ 12 students');

  // ============================================
  // 10. Tags
  // ============================================
  const tagDefs: { name: string; category: 'TOPIC' | 'DIFFICULTY' | 'BLOOM_LEVEL' | 'CUSTOM' }[] = [
    { name: 'Chapter 1', category: 'TOPIC' }, { name: 'Chapter 2', category: 'TOPIC' },
    { name: 'Chapter 3', category: 'TOPIC' }, { name: 'Important', category: 'CUSTOM' },
    { name: 'Board Exam', category: 'CUSTOM' }, { name: 'Practice', category: 'CUSTOM' },
  ];
  const tags: Record<string, { id: string }> = {};
  for (const t of tagDefs) {
    const tag = await prisma.tag.upsert({
      where: { name: t.name },
      update: {},
      create: { name: t.name, category: t.category },
    });
    tags[t.name] = tag;
  }
  console.log('✅ 6 tags');

  // ============================================
  // 11. Questions (40+ across subjects)
  // ============================================
  // Clear old questions for idempotency
  const existingQCount = await prisma.question.count();
  if (existingQCount > 10) {
    console.log('  ⏭️ Questions already seeded, skipping');
  } else {
    // Physics questions (Class 9)
    const physicsQs = [
      { title: 'What is the SI unit of force?', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class9.id, options: [{ label: 'A', text: 'Joule' }, { label: 'B', text: 'Newton', isCorrect: true }, { label: 'C', text: 'Watt' }, { label: 'D', text: 'Pascal' }] },
      { title: 'Acceleration due to gravity on Earth is approximately:', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class9.id, options: [{ label: 'A', text: '9.8 m/s²', isCorrect: true }, { label: 'B', text: '10.5 m/s²' }, { label: 'C', text: '8.2 m/s²' }, { label: 'D', text: '11.0 m/s²' }] },
      { title: 'Which law states F = ma?', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class9.id, options: [{ label: 'A', text: "Newton's First Law" }, { label: 'B', text: "Newton's Second Law", isCorrect: true }, { label: 'C', text: "Newton's Third Law" }, { label: 'D', text: 'Law of Gravitation' }] },
      { title: 'What is the unit of work?', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class9.id, options: [{ label: 'A', text: 'Joule', isCorrect: true }, { label: 'B', text: 'Newton' }, { label: 'C', text: 'Watt' }, { label: 'D', text: 'Ampere' }] },
      { title: 'Define Newton\'s First Law of Motion.', type: 'SHORT_ANSWER' as const, difficulty: 'MEDIUM' as const, marks: 3, classId: class9.id, modelAnswer: 'An object at rest stays at rest and an object in motion stays in motion unless acted upon by an unbalanced force.' },
      { title: 'Explain the difference between speed and velocity with examples.', type: 'LONG_ANSWER' as const, difficulty: 'HARD' as const, marks: 5, classId: class9.id, modelAnswer: 'Speed is a scalar quantity referring to how fast something moves. Velocity is a vector quantity that includes speed and direction.' },
      { title: 'What is momentum? Write its formula.', type: 'SHORT_ANSWER' as const, difficulty: 'MEDIUM' as const, marks: 3, classId: class9.id, modelAnswer: 'Momentum is the product of mass and velocity. p = mv' },
      { title: 'State the law of conservation of energy.', type: 'SHORT_ANSWER' as const, difficulty: 'MEDIUM' as const, marks: 3, classId: class10.id, modelAnswer: 'Energy cannot be created or destroyed, only transformed from one form to another.' },
    ];

    // Chemistry questions
    const chemistryQs = [
      { title: 'What is the chemical formula of water?', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class9.id, options: [{ label: 'A', text: 'H2O', isCorrect: true }, { label: 'B', text: 'CO2' }, { label: 'C', text: 'NaCl' }, { label: 'D', text: 'O2' }] },
      { title: 'Which gas is released during photosynthesis?', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class9.id, options: [{ label: 'A', text: 'Carbon Dioxide' }, { label: 'B', text: 'Oxygen', isCorrect: true }, { label: 'C', text: 'Nitrogen' }, { label: 'D', text: 'Hydrogen' }] },
      { title: 'Define pH scale and its range.', type: 'SHORT_ANSWER' as const, difficulty: 'MEDIUM' as const, marks: 3, classId: class9.id, modelAnswer: 'pH scale measures acidity or basicity of a solution, ranging from 0 (most acidic) to 14 (most basic). 7 is neutral.' },
      { title: 'What is an atom? Describe its structure.', type: 'LONG_ANSWER' as const, difficulty: 'HARD' as const, marks: 5, classId: class9.id, modelAnswer: 'An atom is the smallest unit of matter that retains the properties of an element. It consists of a nucleus (protons + neutrons) surrounded by electron shells.' },
      { title: 'Atomic number of Carbon is:', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class10.id, options: [{ label: 'A', text: '4' }, { label: 'B', text: '6', isCorrect: true }, { label: 'C', text: '8' }, { label: 'D', text: '12' }] },
    ];

    // Maths questions
    const mathsQs = [
      { title: 'What is the value of π (pi) to 2 decimal places?', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class9.id, options: [{ label: 'A', text: '3.14', isCorrect: true }, { label: 'B', text: '3.16' }, { label: 'C', text: '2.14' }, { label: 'D', text: '3.41' }] },
      { title: 'Solve: 2x + 5 = 15', type: 'SHORT_ANSWER' as const, difficulty: 'EASY' as const, marks: 2, classId: class9.id, modelAnswer: 'x = 5' },
      { title: 'What is the Pythagorean theorem?', type: 'SHORT_ANSWER' as const, difficulty: 'MEDIUM' as const, marks: 3, classId: class9.id, modelAnswer: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides. a² + b² = c²' },
      { title: 'Find the area of a circle with radius 7 cm.', type: 'SHORT_ANSWER' as const, difficulty: 'MEDIUM' as const, marks: 3, classId: class10.id, modelAnswer: 'A = πr² = π × 7² = 49π ≈ 153.94 cm²' },
      { title: 'Prove that √2 is irrational.', type: 'LONG_ANSWER' as const, difficulty: 'HARD' as const, marks: 5, classId: class10.id, modelAnswer: 'Proof by contradiction: Assume √2 = p/q in lowest terms. Then 2q² = p², so p is even. Let p = 2k. Then 2q² = 4k², so q² = 2k², meaning q is also even. Contradiction since both cannot be even in lowest terms.' },
      { title: 'Differentiate f(x) = 3x² + 2x - 5', type: 'SHORT_ANSWER' as const, difficulty: 'MEDIUM' as const, marks: 3, classId: class11.id, modelAnswer: "f'(x) = 6x + 2" },
    ];

    // English questions
    const englishQs = [
      { title: 'Which of these is a pronoun?', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class9.id, options: [{ label: 'A', text: 'Run' }, { label: 'B', text: 'He', isCorrect: true }, { label: 'C', text: 'Beautiful' }, { label: 'D', text: 'Quickly' }] },
      { title: 'Define a simile and give an example.', type: 'SHORT_ANSWER' as const, difficulty: 'EASY' as const, marks: 2, classId: class9.id, modelAnswer: 'A simile is a figure of speech comparing two things using "like" or "as". Example: "She is as brave as a lion."' },
      { title: 'Write a short essay on "The importance of education".', type: 'LONG_ANSWER' as const, difficulty: 'HARD' as const, marks: 10, classId: class10.id, modelAnswer: 'Education is the foundation of personal and societal growth...' },
      { title: 'Identify the tense: "She had been waiting for hours."', type: 'MCQ' as const, difficulty: 'MEDIUM' as const, marks: 1, classId: class10.id, options: [{ label: 'A', text: 'Present Perfect' }, { label: 'B', text: 'Past Perfect Continuous', isCorrect: true }, { label: 'C', text: 'Future Perfect' }, { label: 'D', text: 'Past Simple' }] },
    ];

    // Computer Science questions
    const csQs = [
      { title: 'What does CPU stand for?', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class11.id, options: [{ label: 'A', text: 'Central Processing Unit', isCorrect: true }, { label: 'B', text: 'Central Program Unit' }, { label: 'C', text: 'Computer Processing Unit' }, { label: 'D', text: 'Central Protocol Unit' }] },
      { title: 'What is an algorithm?', type: 'SHORT_ANSWER' as const, difficulty: 'MEDIUM' as const, marks: 3, classId: class11.id, modelAnswer: 'An algorithm is a step-by-step procedure or set of rules for solving a problem or accomplishing a task.' },
      { title: 'Explain the difference between RAM and ROM.', type: 'LONG_ANSWER' as const, difficulty: 'MEDIUM' as const, marks: 5, classId: class11.id, modelAnswer: 'RAM is volatile memory used for temporary data storage during execution. ROM is non-volatile and stores permanent data like firmware.' },
    ];

    // History questions
    const historyQs = [
      { title: 'When was Pakistan founded?', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class9.id, options: [{ label: 'A', text: '1945' }, { label: 'B', text: '1947', isCorrect: true }, { label: 'C', text: '1950' }, { label: 'D', text: '1946' }] },
      { title: 'Who was the first Governor-General of Pakistan?', type: 'MCQ' as const, difficulty: 'EASY' as const, marks: 1, classId: class9.id, options: [{ label: 'A', text: 'Liaquat Ali Khan' }, { label: 'B', text: 'Quaid-e-Azam Muhammad Ali Jinnah', isCorrect: true }, { label: 'C', text: 'Allama Iqbal' }, { label: 'D', text: 'Khawaja Nazimuddin' }] },
      { title: 'Explain the significance of the Lahore Resolution 1940.', type: 'LONG_ANSWER' as const, difficulty: 'HARD' as const, marks: 5, classId: class10.id, modelAnswer: 'The Lahore Resolution demanded independent Muslim states in the northwestern and eastern zones of India where Muslims were in majority.' },
    ];

    type QDef = {
      title: string; type: 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER'; difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      marks: number; classId: string; options?: { label: string; text: string; isCorrect?: boolean }[];
      modelAnswer?: string;
    };

    async function createQuestions(subjectId: string, createdById: string, qs: QDef[]) {
      const created = [];
      for (const q of qs) {
        const question = await prisma.question.create({
          data: {
            subjectId,
            classId: q.classId,
            createdById,
            type: q.type,
            title: q.title,
            difficulty: q.difficulty,
            marks: q.marks,
            modelAnswer: q.modelAnswer,
            ...(q.type === 'MCQ' && q.options
              ? {
                  mcqOptions: {
                    createMany: {
                      data: q.options.map((o, i) => ({
                        label: o.label,
                        text: o.text,
                        isCorrect: o.isCorrect ?? false,
                        sortOrder: i,
                      })),
                    },
                  },
                }
              : {}),
          },
        });
        created.push(question);
      }
      return created;
    }

    const t1 = teachers[0]!.user; // Ahmed - Physics, Maths
    const t2 = teachers[1]!.user; // Fatima - English, Urdu
    const t3 = teachers[2]!.user; // Bilal - Chemistry, Biology
    const t4 = teachers[3]!.user; // Ayesha - Maths, CS

    const [phyQuestions, chemQuestions, mathQuestions, engQuestions, csQuestions, histQuestions] = await Promise.all([
      createQuestions(physics.id, t1.id, physicsQs),
      createQuestions(chemistry.id, t3.id, chemistryQs),
      createQuestions(maths.id, t1.id, mathsQs.slice(0, 3)),
      createQuestions(english.id, t2.id, englishQs),
      createQuestions(computer.id, t4.id, csQs),
      createQuestions(history.id, t2.id, historyQs),
    ]);
    // Ayesha creates maths questions for class 10-11
    const mathQsAyesha = await createQuestions(maths.id, t4.id, mathsQs.slice(3));

    const allPhyQs = phyQuestions;
    const allMathQs = [...mathQuestions, ...mathQsAyesha];

    // Tag some questions
    const chap1Tag = tags['Chapter 1']!;
    const chap2Tag = tags['Chapter 2']!;
    const importantTag = tags['Important']!;
    if (allPhyQs.length >= 6) {
      await Promise.all([
        prisma.questionTag.create({ data: { questionId: allPhyQs[0]!.id, tagId: chap1Tag.id } }).catch(() => {}),
        prisma.questionTag.create({ data: { questionId: allPhyQs[1]!.id, tagId: chap1Tag.id } }).catch(() => {}),
        prisma.questionTag.create({ data: { questionId: allPhyQs[4]!.id, tagId: chap2Tag.id } }).catch(() => {}),
        prisma.questionTag.create({ data: { questionId: allPhyQs[5]!.id, tagId: importantTag.id } }).catch(() => {}),
      ]);
    }

    console.log(`✅ ${allPhyQs.length + chemQuestions.length + allMathQs.length + engQuestions.length + csQuestions.length + histQuestions.length} questions with tags`);

    // ============================================
    // 12. Exams
    // ============================================
    // Physics Quiz (Class 9, Published)
    const exam1 = await prisma.exam.create({
      data: {
        title: 'Physics Chapter 1 Quiz',
        subjectId: physics.id,
        createdById: t1.id,
        academicSessionId: session2025.id,
        type: 'QUIZ',
        status: 'PUBLISHED',
        totalMarks: 10,
        passingMarks: 5,
        duration: 30,
        maxAttempts: 1,
        instructions: 'Answer all questions. MCQs carry 1 mark each.',
        examQuestions: {
          createMany: {
            data: allPhyQs.slice(0, 4).map((q, i) => ({
              questionId: q.id,
              sortOrder: i,
              marks: Number(q.marks),
            })),
          },
        },
        examClassAssignments: { create: { classId: class9.id, sectionId: secId('9-A') } },
      },
    });

    // Maths Midterm (Class 9, Draft)
    const exam2 = await prisma.exam.create({
      data: {
        title: 'Mathematics Midterm',
        subjectId: maths.id,
        createdById: t1.id,
        academicSessionId: session2025.id,
        type: 'MIDTERM',
        status: 'DRAFT',
        totalMarks: 20,
        passingMarks: 8,
        duration: 60,
        maxAttempts: 1,
        instructions: 'Answer all questions.',
        examQuestions: {
          createMany: {
            data: allMathQs.slice(0, 3).map((q, i) => ({
              questionId: q.id,
              sortOrder: i,
              marks: Number(q.marks),
            })),
          },
        },
        examClassAssignments: { create: { classId: class9.id, sectionId: secId('9-A') } },
      },
    });

    // Chemistry Quiz (Class 9, Completed)
    const exam3 = await prisma.exam.create({
      data: {
        title: 'Chemistry Elements Quiz',
        subjectId: chemistry.id,
        createdById: t3.id,
        academicSessionId: session2025.id,
        type: 'QUIZ',
        status: 'COMPLETED',
        totalMarks: 10,
        passingMarks: 5,
        duration: 20,
        maxAttempts: 1,
        examQuestions: {
          createMany: {
            data: chemQuestions.slice(0, 3).map((q, i) => ({
              questionId: q.id,
              sortOrder: i,
              marks: Number(q.marks),
            })),
          },
        },
        examClassAssignments: { create: { classId: class9.id, sectionId: secId('9-A') } },
      },
    });

    // English Practice (Class 10, Published)
    await prisma.exam.create({
      data: {
        title: 'English Grammar Practice',
        subjectId: english.id,
        createdById: t2.id,
        academicSessionId: session2025.id,
        type: 'PRACTICE',
        status: 'PUBLISHED',
        totalMarks: 14,
        passingMarks: 7,
        duration: 45,
        maxAttempts: 3,
        examQuestions: {
          createMany: {
            data: engQuestions.map((q, i) => ({
              questionId: q.id,
              sortOrder: i,
              marks: Number(q.marks),
            })),
          },
        },
        examClassAssignments: { create: { classId: class10.id, sectionId: secId('10-A') } },
      },
    });

    // CS Quiz (Class 11, Published)
    await prisma.exam.create({
      data: {
        title: 'CS Fundamentals Quiz',
        subjectId: computer.id,
        createdById: t4.id,
        academicSessionId: session2025.id,
        type: 'QUIZ',
        status: 'PUBLISHED',
        totalMarks: 9,
        passingMarks: 5,
        duration: 30,
        maxAttempts: 1,
        examQuestions: {
          createMany: {
            data: csQuestions.map((q, i) => ({
              questionId: q.id,
              sortOrder: i,
              marks: Number(q.marks),
            })),
          },
        },
        examClassAssignments: { create: { classId: class11.id, sectionId: secId('11-A') } },
      },
    });

    // Previous session exam
    await prisma.exam.create({
      data: {
        title: 'History Final 2024',
        subjectId: history.id,
        createdById: t2.id,
        academicSessionId: session2024.id,
        type: 'FINAL',
        status: 'COMPLETED',
        totalMarks: 7,
        passingMarks: 3,
        duration: 60,
        maxAttempts: 1,
        examQuestions: {
          createMany: {
            data: histQuestions.map((q, i) => ({
              questionId: q.id,
              sortOrder: i,
              marks: Number(q.marks),
            })),
          },
        },
        examClassAssignments: { create: { classId: class9.id, sectionId: secId('9-A') } },
      },
    });

    console.log('✅ 6 exams across sessions');

    // ============================================
    // 13. Exam Sessions & Student Answers (for completed exam)
    // ============================================
    // Students in class 9 take the completed Chemistry quiz
    const class9Students = students.filter((_, i) => i < 4); // first 4 are class 9
    const examQs = await prisma.examQuestion.findMany({
      where: { examId: exam3.id },
      orderBy: { sortOrder: 'asc' },
      include: { question: { include: { mcqOptions: true } } },
    });

    for (let si = 0; si < class9Students.length; si++) {
      const student = class9Students[si]!.user;
      const examSession = await prisma.examSession.create({
        data: {
          examId: exam3.id,
          studentId: student.id,
          status: 'SUBMITTED',
          startedAt: new Date('2025-06-10T09:00:00Z'),
          submittedAt: new Date('2025-06-10T09:18:00Z'),
        },
      });

      let totalObtained = 0;
      for (const eq of examQs) {
        const q = eq.question;
        let answerText = '';
        let selectedOptionId: string | null = null;
        let isCorrect = false;

        if (q.type === 'MCQ' && q.mcqOptions.length > 0) {
          // Simulate: first 2 students get correct, others pick random
          const correctOpt = q.mcqOptions.find((o) => o.isCorrect);
          if (si < 2 && correctOpt) {
            selectedOptionId = correctOpt.id;
            isCorrect = true;
          } else {
            const wrongOpt = q.mcqOptions.find((o) => !o.isCorrect) ?? q.mcqOptions[0]!;
            selectedOptionId = wrongOpt!.id;
          }
          answerText = selectedOptionId ? q.mcqOptions.find((o) => o.id === selectedOptionId)?.text ?? '' : '';
        } else {
          answerText = si < 2 ? (q.modelAnswer ?? 'Good answer') : 'Partial answer';
          isCorrect = si < 2;
        }

        const obtainedMarks = isCorrect ? Number(eq.marks) : (si === 2 ? Number(eq.marks) * 0.5 : 0);
        totalObtained += obtainedMarks;

        const studentAnswer = await prisma.studentAnswer.create({
          data: {
            sessionId: examSession.id,
            examQuestionId: eq.id,
            answerText,
            selectedOptionId,
            answeredAt: new Date('2025-06-10T09:15:00Z'),
          },
        });

        // Grade each answer
        await prisma.answerGrade.create({
          data: {
            studentAnswerId: studentAnswer.id,
            graderId: t3.id,
            gradedBy: q.type === 'MCQ' ? 'SYSTEM' : 'TEACHER',
            marksAwarded: obtainedMarks,
            maxMarks: Number(eq.marks),
            feedback: isCorrect ? 'Correct!' : 'Review the concept.',
          },
        });
      }

      // Create ExamResult
      await prisma.examResult.create({
        data: {
          sessionId: examSession.id,
          examId: exam3.id,
          studentId: student.id,
          totalMarks: 10,
          obtainedMarks: totalObtained,
          percentage: (totalObtained / 10) * 100,
          grade: totalObtained >= 9 ? 'A+' : totalObtained >= 8 ? 'A' : totalObtained >= 7 ? 'B' : totalObtained >= 5 ? 'C' : 'F',
          isPassed: totalObtained >= 5,
          publishedAt: new Date('2025-06-11'),
        },
      });
    }
    console.log('✅ Exam sessions, answers, grades & results for Chemistry quiz');

    // ============================================
    // 14. Notifications
    // ============================================
    const notificationDefs: { userId: string; title: string; message: string; type: 'EXAM_ASSIGNED' | 'EXAM_REMINDER' | 'RESULT_PUBLISHED' | 'GRADE_REVIEWED' | 'SYSTEM'; isRead?: boolean }[] = [
      { userId: students[0]!.user.id, title: 'Exam Published', message: 'Physics Chapter 1 Quiz is now available.', type: 'EXAM_ASSIGNED' },
      { userId: students[0]!.user.id, title: 'Result Published', message: 'Your Chemistry Elements Quiz result is available.', type: 'RESULT_PUBLISHED', isRead: true },
      { userId: t1.id, title: 'New Question Approved', message: '8 physics questions have been added to the bank.', type: 'SYSTEM' },
      { userId: admin.id, title: 'System Update', message: 'Database migration completed successfully.', type: 'SYSTEM' },
      { userId: principal.id, title: 'Weekly Performance Report', message: 'The weekly school performance report is ready for review.', type: 'SYSTEM' },
      { userId: principal.id, title: 'New Teacher Onboarded', message: 'Teacher Ayesha Nawaz has been added to the system.', type: 'SYSTEM' },
      { userId: principal.id, title: 'Exam Results Published', message: 'Chemistry Elements Quiz results have been published for Class 9.', type: 'RESULT_PUBLISHED', isRead: true },
    ];
    for (const n of notificationDefs) {
      await prisma.notification.create({
        data: {
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead ?? false,
        },
      });
    }
    console.log('✅ 7 notifications');

    // ============================================
    // 15. Audit Logs
    // ============================================
    const auditDefs = [
      { userId: admin.id, action: 'CREATE', entityType: 'SchoolSettings', entityId: 'default-settings', metadata: { note: 'Initial settings created' } },
      { userId: t1.id, action: 'CREATE', entityType: 'Exam', entityId: exam1.id, metadata: { title: 'Physics Chapter 1 Quiz' } },
      { userId: t3.id, action: 'UPDATE', entityType: 'Exam', entityId: exam3.id, metadata: { status: 'COMPLETED' } },
    ];
    for (const a of auditDefs) {
      await prisma.auditLog.create({
        data: {
          userId: a.userId,
          action: a.action,
          entityType: a.entityType,
          entityId: a.entityId,
          metadata: a.metadata as any,
        },
      });
    }
    console.log('✅ 3 audit logs');
  }

  // ============================================
  // 16. Period Slots (School Bell Schedule)
  // ============================================
  const existingSlots = await prisma.periodSlot.count();
  if (existingSlots === 0) {
    const periodSlotDefs = [
      { name: 'Period 1', shortName: 'P1', startTime: '08:00', endTime: '08:40', sortOrder: 1, isBreak: false },
      { name: 'Period 2', shortName: 'P2', startTime: '08:45', endTime: '09:25', sortOrder: 2, isBreak: false },
      { name: 'Period 3', shortName: 'P3', startTime: '09:30', endTime: '10:10', sortOrder: 3, isBreak: false },
      { name: 'Break', shortName: 'BRK', startTime: '10:10', endTime: '10:30', sortOrder: 4, isBreak: true },
      { name: 'Period 4', shortName: 'P4', startTime: '10:30', endTime: '11:10', sortOrder: 5, isBreak: false },
      { name: 'Period 5', shortName: 'P5', startTime: '11:15', endTime: '11:55', sortOrder: 6, isBreak: false },
      { name: 'Period 6', shortName: 'P6', startTime: '12:00', endTime: '12:40', sortOrder: 7, isBreak: false },
      { name: 'Lunch', shortName: 'LCH', startTime: '12:40', endTime: '13:20', sortOrder: 8, isBreak: true },
      { name: 'Period 7', shortName: 'P7', startTime: '13:20', endTime: '14:00', sortOrder: 9, isBreak: false },
    ];

    const periodSlots: Record<string, { id: string }> = {};
    for (const ps of periodSlotDefs) {
      const slot = await prisma.periodSlot.create({ data: ps });
      periodSlots[ps.shortName] = slot;
    }
    console.log('✅ 9 period slots (7 teaching + 2 breaks)');

    // Helper to get slot id
    function slotId(key: string): string {
      const s = periodSlots[key];
      if (!s) throw new Error(`Period slot ${key} not found`);
      return s.id;
    }

    // ============================================
    // 17. Class Teachers (assign to sections)
    // ============================================
    // Ahmed Khan → 9-A, Fatima Ali → 9-B, Bilal Ahmed → 10-A, Ayesha Nawaz → 10-B
    const classTeacherMap: { sectionKey: string; teacherIdx: number }[] = [
      { sectionKey: '9-A', teacherIdx: 0 },   // Ahmed
      { sectionKey: '9-B', teacherIdx: 1 },   // Fatima
      { sectionKey: '10-A', teacherIdx: 2 },  // Bilal
      { sectionKey: '10-B', teacherIdx: 3 },  // Ayesha
    ];
    for (const ct of classTeacherMap) {
      const sId = secId(ct.sectionKey);
      const teacherUserId = teachers[ct.teacherIdx]!.user.id;
      await prisma.section.update({
        where: { id: sId },
        data: { classTeacherId: teacherUserId },
      });
    }
    console.log('✅ 4 class teacher assignments');

    // ============================================
    // 18. Timetable Entries (Class 9A & 10A full week)
    // ============================================
    type DayName = DayOfWeek;
    const workDays: DayName[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    // Class 9-A timetable (Ahmed=Physics/Maths, Fatima=English/Urdu, Bilal=Chemistry/Biology)
    // Each day: 7 teaching periods, subjects rotate
    const timetable9A: { day: DayName; slot: string; subjectId: string; teacherIdx: number; room?: string }[] = [
      // Monday
      { day: 'MONDAY', slot: 'P1', subjectId: physics.id,    teacherIdx: 0, room: 'Lab-1' },
      { day: 'MONDAY', slot: 'P2', subjectId: maths.id,       teacherIdx: 0 },
      { day: 'MONDAY', slot: 'P3', subjectId: english.id,     teacherIdx: 1 },
      { day: 'MONDAY', slot: 'P4', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'MONDAY', slot: 'P5', subjectId: urdu.id,        teacherIdx: 1 },
      { day: 'MONDAY', slot: 'P6', subjectId: biology.id,     teacherIdx: 2, room: 'Lab-3' },
      { day: 'MONDAY', slot: 'P7', subjectId: history.id,     teacherIdx: 1 },
      // Tuesday
      { day: 'TUESDAY', slot: 'P1', subjectId: maths.id,       teacherIdx: 0 },
      { day: 'TUESDAY', slot: 'P2', subjectId: english.id,     teacherIdx: 1 },
      { day: 'TUESDAY', slot: 'P3', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
      { day: 'TUESDAY', slot: 'P4', subjectId: urdu.id,        teacherIdx: 1 },
      { day: 'TUESDAY', slot: 'P5', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'TUESDAY', slot: 'P6', subjectId: history.id,     teacherIdx: 1 },
      { day: 'TUESDAY', slot: 'P7', subjectId: biology.id,     teacherIdx: 2 },
      // Wednesday
      { day: 'WEDNESDAY', slot: 'P1', subjectId: english.id,     teacherIdx: 1 },
      { day: 'WEDNESDAY', slot: 'P2', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
      { day: 'WEDNESDAY', slot: 'P3', subjectId: maths.id,       teacherIdx: 0 },
      { day: 'WEDNESDAY', slot: 'P4', subjectId: biology.id,     teacherIdx: 2 },
      { day: 'WEDNESDAY', slot: 'P5', subjectId: urdu.id,        teacherIdx: 1 },
      { day: 'WEDNESDAY', slot: 'P6', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'WEDNESDAY', slot: 'P7', subjectId: maths.id,       teacherIdx: 0 },
      // Thursday
      { day: 'THURSDAY', slot: 'P1', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'THURSDAY', slot: 'P2', subjectId: maths.id,       teacherIdx: 0 },
      { day: 'THURSDAY', slot: 'P3', subjectId: english.id,     teacherIdx: 1 },
      { day: 'THURSDAY', slot: 'P4', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
      { day: 'THURSDAY', slot: 'P5', subjectId: history.id,     teacherIdx: 1 },
      { day: 'THURSDAY', slot: 'P6', subjectId: urdu.id,        teacherIdx: 1 },
      { day: 'THURSDAY', slot: 'P7', subjectId: biology.id,     teacherIdx: 2 },
      // Friday
      { day: 'FRIDAY', slot: 'P1', subjectId: maths.id,       teacherIdx: 0 },
      { day: 'FRIDAY', slot: 'P2', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
      { day: 'FRIDAY', slot: 'P3', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'FRIDAY', slot: 'P4', subjectId: english.id,     teacherIdx: 1 },
      { day: 'FRIDAY', slot: 'P5', subjectId: biology.id,     teacherIdx: 2 },
      { day: 'FRIDAY', slot: 'P6', subjectId: urdu.id,        teacherIdx: 1 },
      { day: 'FRIDAY', slot: 'P7', subjectId: history.id,     teacherIdx: 1 },
      // Saturday (half day – only P1-P4)
      { day: 'SATURDAY', slot: 'P1', subjectId: maths.id,       teacherIdx: 0 },
      { day: 'SATURDAY', slot: 'P2', subjectId: english.id,     teacherIdx: 1 },
      { day: 'SATURDAY', slot: 'P3', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
      { day: 'SATURDAY', slot: 'P4', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
    ];

    // Class 10-A timetable (Bilal=Chemistry, Ayesha=Maths/CS, Ahmed=Physics, Fatima=English)
    const timetable10A: typeof timetable9A = [
      // Monday
      { day: 'MONDAY', slot: 'P1', subjectId: maths.id,       teacherIdx: 3 },
      { day: 'MONDAY', slot: 'P2', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
      { day: 'MONDAY', slot: 'P3', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'MONDAY', slot: 'P4', subjectId: english.id,     teacherIdx: 1 },
      { day: 'MONDAY', slot: 'P5', subjectId: maths.id,       teacherIdx: 3 },
      { day: 'MONDAY', slot: 'P6', subjectId: urdu.id,        teacherIdx: 1 },
      { day: 'MONDAY', slot: 'P7', subjectId: history.id,     teacherIdx: 1 },
      // Tuesday
      { day: 'TUESDAY', slot: 'P1', subjectId: english.id,     teacherIdx: 1 },
      { day: 'TUESDAY', slot: 'P2', subjectId: maths.id,       teacherIdx: 3 },
      { day: 'TUESDAY', slot: 'P3', subjectId: biology.id,     teacherIdx: 2 },
      { day: 'TUESDAY', slot: 'P4', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
      { day: 'TUESDAY', slot: 'P5', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'TUESDAY', slot: 'P6', subjectId: urdu.id,        teacherIdx: 1 },
      { day: 'TUESDAY', slot: 'P7', subjectId: history.id,     teacherIdx: 1 },
      // Wednesday
      { day: 'WEDNESDAY', slot: 'P1', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
      { day: 'WEDNESDAY', slot: 'P2', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'WEDNESDAY', slot: 'P3', subjectId: maths.id,       teacherIdx: 3 },
      { day: 'WEDNESDAY', slot: 'P4', subjectId: english.id,     teacherIdx: 1 },
      { day: 'WEDNESDAY', slot: 'P5', subjectId: biology.id,     teacherIdx: 2 },
      { day: 'WEDNESDAY', slot: 'P6', subjectId: maths.id,       teacherIdx: 3 },
      { day: 'WEDNESDAY', slot: 'P7', subjectId: urdu.id,        teacherIdx: 1 },
      // Thursday
      { day: 'THURSDAY', slot: 'P1', subjectId: maths.id,       teacherIdx: 3 },
      { day: 'THURSDAY', slot: 'P2', subjectId: english.id,     teacherIdx: 1 },
      { day: 'THURSDAY', slot: 'P3', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
      { day: 'THURSDAY', slot: 'P4', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'THURSDAY', slot: 'P5', subjectId: urdu.id,        teacherIdx: 1 },
      { day: 'THURSDAY', slot: 'P6', subjectId: biology.id,     teacherIdx: 2 },
      { day: 'THURSDAY', slot: 'P7', subjectId: maths.id,       teacherIdx: 3 },
      // Friday
      { day: 'FRIDAY', slot: 'P1', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'FRIDAY', slot: 'P2', subjectId: maths.id,       teacherIdx: 3 },
      { day: 'FRIDAY', slot: 'P3', subjectId: english.id,     teacherIdx: 1 },
      { day: 'FRIDAY', slot: 'P4', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
      { day: 'FRIDAY', slot: 'P5', subjectId: history.id,     teacherIdx: 1 },
      { day: 'FRIDAY', slot: 'P6', subjectId: biology.id,     teacherIdx: 2 },
      { day: 'FRIDAY', slot: 'P7', subjectId: maths.id,       teacherIdx: 3 },
      // Saturday (half day)
      { day: 'SATURDAY', slot: 'P1', subjectId: english.id,     teacherIdx: 1 },
      { day: 'SATURDAY', slot: 'P2', subjectId: maths.id,       teacherIdx: 3 },
      { day: 'SATURDAY', slot: 'P3', subjectId: chemistry.id,   teacherIdx: 2, room: 'Lab-2' },
      { day: 'SATURDAY', slot: 'P4', subjectId: physics.id,     teacherIdx: 0, room: 'Lab-1' },
    ];

    // Create all timetable entries
    let entryCount = 0;

    async function seedTimetable(
      entries: typeof timetable9A,
      classId: string,
      sectionKey: string,
    ) {
      const sId = secId(sectionKey);
      const records = entries.map((e) => ({
        classId,
        sectionId: sId,
        subjectId: e.subjectId,
        teacherProfileId: teachers[e.teacherIdx]!.profile.id,
        periodSlotId: slotId(e.slot),
        dayOfWeek: e.day,
        academicSessionId: session2025.id,
        room: e.room ?? null,
      }));
      const result = await prisma.timetableEntry.createMany({ data: records, skipDuplicates: true });
      entryCount += result.count;
    }

    await seedTimetable(timetable9A, class9.id, '9-A');
    await seedTimetable(timetable10A, class10.id, '10-A');
    console.log(`✅ ${entryCount} timetable entries (Class 9-A: ${timetable9A.length}, Class 10-A: ${timetable10A.length})`);

    // ============================================
    // 19. Daily Attendance (past 30 school days)
    // ============================================
    type AttStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

    // Generate past school dates (skip Sundays)
    function getSchoolDates(count: number): string[] {
      const dates: string[] = [];
      const d = new Date('2026-03-03'); // today
      d.setDate(d.getDate() - 1); // start from yesterday
      while (dates.length < count) {
        if (d.getDay() !== 0) { // skip Sunday
          dates.push(d.toISOString().split('T')[0]!);
        }
        d.setDate(d.getDate() - 1);
      }
      return dates.reverse(); // oldest first
    }

    // Seeded random (deterministic based on string hash)
    function hashSeed(str: string): number {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h + str.charCodeAt(i)) | 0;
      }
      return Math.abs(h);
    }

    function getAttendanceStatus(studentName: string, date: string, index: number): AttStatus {
      const seed = hashSeed(`${studentName}-${date}-${index}`);
      const roll = seed % 100;
      // Realistic distribution: ~82% present, ~8% absent, ~6% late, ~4% excused
      if (roll < 82) return 'PRESENT';
      if (roll < 90) return 'ABSENT';
      if (roll < 96) return 'LATE';
      return 'EXCUSED';
    }

    const schoolDates = getSchoolDates(30);
    const class9AStudents = students.filter((s) => s.profile.sectionId === secId('9-A'));
    const class10AStudents = students.filter((s) => s.profile.sectionId === secId('10-A'));

    let dailyAttCount = 0;

    async function seedDailyAttendance(
      studentGroup: typeof students,
      classId: string,
      sectionId: string,
      markedByUserId: string,
    ) {
      // Batch create all records in a single transaction for performance
      const records: {
        studentProfileId: string; classId: string; sectionId: string;
        date: Date; status: AttStatus; remarks: string | null;
        markedById: string; academicSessionId: string;
      }[] = [];

      for (const dateStr of schoolDates) {
        const dateObj = new Date(dateStr + 'T00:00:00.000Z');
        for (let si = 0; si < studentGroup.length; si++) {
          const s = studentGroup[si]!;
          const status = getAttendanceStatus(
            `${s.user.firstName}${s.user.lastName}`, dateStr, si,
          );
          const remarks = status === 'EXCUSED' ? 'Medical leave' :
                          status === 'LATE' ? 'Came 10 min late' : null;
          records.push({
            studentProfileId: s.profile.id, classId, sectionId,
            date: dateObj, status, remarks,
            markedById: markedByUserId, academicSessionId: session2025.id,
          });
        }
      }

      await prisma.dailyAttendance.createMany({ data: records, skipDuplicates: true });
      dailyAttCount += records.length;
    }

    // Ahmed marks 9-A, Bilal marks 10-A (they are class teachers)
    await seedDailyAttendance(class9AStudents, class9.id, secId('9-A'), teachers[0]!.user.id);
    await seedDailyAttendance(class10AStudents, class10.id, secId('10-A'), teachers[2]!.user.id);
    console.log(`✅ ${dailyAttCount} daily attendance records (30 days × ${class9AStudents.length + class10AStudents.length} students)`);

    // ============================================
    // 20. Subject Attendance (last 10 school days, select periods)
    // ============================================
    const recentDates = schoolDates.slice(-10); // last 10 days
    let subjectAttCount = 0;

    // Map day names to DayOfWeek enum values
    function getDayOfWeek(dateStr: string): DayName | null {
      const d = new Date(dateStr);
      const dayMap: Record<number, DayName> = { 1: 'MONDAY' as DayName, 2: 'TUESDAY' as DayName, 3: 'WEDNESDAY' as DayName, 4: 'THURSDAY' as DayName, 5: 'FRIDAY' as DayName, 6: 'SATURDAY' as DayName };
      return dayMap[d.getDay()] ?? null;
    }

    // Seed subject attendance for a class – picks first 3 periods each day
    async function seedSubjectAttendance(
      studentGroup: typeof students,
      classId: string,
      sectionKey: string,
      timetableDef: typeof timetable9A,
    ) {
      const sId = secId(sectionKey);

      // Pre-fetch all timetable entries for this class in a single query
      const allTtEntries = await prisma.timetableEntry.findMany({
        where: { classId, sectionId: sId, academicSessionId: session2025.id },
        select: { id: true, periodSlotId: true, dayOfWeek: true },
      });
      const ttEntryMap = new Map(
        allTtEntries.map((e) => [`${e.dayOfWeek}-${e.periodSlotId}`, e.id]),
      );

      const records: {
        studentProfileId: string; classId: string; sectionId: string;
        subjectId: string; timetableEntryId: string | null; periodSlotId: string;
        date: Date; status: AttStatus; remarks: string | null;
        markedById: string; academicSessionId: string;
      }[] = [];

      for (const dateStr of recentDates) {
        const dayOfWeek = getDayOfWeek(dateStr);
        if (!dayOfWeek) continue;
        const dateObj = new Date(dateStr + 'T00:00:00.000Z');

        const dayEntries = timetableDef
          .filter((e) => e.day === dayOfWeek)
          .slice(0, 3);

        for (const entry of dayEntries) {
          const periodSlotId = slotId(entry.slot);
          const ttEntryId = ttEntryMap.get(`${dayOfWeek}-${periodSlotId}`) ?? null;

          for (let si = 0; si < studentGroup.length; si++) {
            const s = studentGroup[si]!;
            const status = getAttendanceStatus(
              `${s.user.firstName}${s.user.lastName}-subj`, dateStr, si + entry.teacherIdx,
            );
            const remarks = status === 'ABSENT' ? 'Skipped class' : null;
            records.push({
              studentProfileId: s.profile.id, classId, sectionId: sId,
              subjectId: entry.subjectId, timetableEntryId: ttEntryId,
              periodSlotId, date: dateObj, status, remarks,
              markedById: teachers[entry.teacherIdx]!.user.id,
              academicSessionId: session2025.id,
            });
          }
        }
      }

      await prisma.subjectAttendance.createMany({ data: records, skipDuplicates: true });
      subjectAttCount += records.length;
    }

    await seedSubjectAttendance(class9AStudents, class9.id, '9-A', timetable9A);
    await seedSubjectAttendance(class10AStudents, class10.id, '10-A', timetable10A);
    console.log(`✅ ${subjectAttCount} subject attendance records (10 days × 3 periods × students)`);

    // ============================================
    // 21. Attendance-related Audit Logs
    // ============================================
    await prisma.auditLog.create({
      data: {
        userId: teachers[0]!.user.id,
        action: 'MARK_DAILY_ATTENDANCE',
        entityType: 'DAILY_ATTENDANCE',
        entityId: `${class9.id}-${secId('9-A')}`,
        metadata: { date: schoolDates[schoolDates.length - 1], classId: class9.id, recordCount: class9AStudents.length } as any,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: teachers[2]!.user.id,
        action: 'MARK_DAILY_ATTENDANCE',
        entityType: 'DAILY_ATTENDANCE',
        entityId: `${class10.id}-${secId('10-A')}`,
        metadata: { date: schoolDates[schoolDates.length - 1], classId: class10.id, recordCount: class10AStudents.length } as any,
      },
    });
    console.log('✅ 2 attendance audit logs');

    // ============================================
    // 22. Attendance Notifications
    // ============================================
    const absenceNotifications: { userId: string; title: string; message: string; type: 'SYSTEM' }[] = [];
    // Find students who were absent yesterday
    const yesterdayDate = schoolDates[schoolDates.length - 1]!;
    for (const s of [...class9AStudents, ...class10AStudents]) {
      const status = getAttendanceStatus(
        `${s.user.firstName}${s.user.lastName}`, yesterdayDate, 0,
      );
      if (status === 'ABSENT') {
        absenceNotifications.push({
          userId: s.user.id,
          title: 'Absence Recorded',
          message: `You were marked absent on ${yesterdayDate}. If this is incorrect, please contact your class teacher.`,
          type: 'SYSTEM',
        });
      }
    }
    for (const n of absenceNotifications) {
      await prisma.notification.create({ data: { ...n, isRead: false } });
    }
    console.log(`✅ ${absenceNotifications.length} absence notifications`);
  } else {
    console.log('  ⏭️ Period slots already exist, skipping timetable & attendance seed');
  }

  console.log('\n🎉 Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Admin:     admin@faithhorizon.school / AdminPass123!');
  console.log('  Principal: principal@faithhorizon.school / Principal123!');
  console.log('  Teacher: ahmed.khan@faithhorizon.school / Teacher123!');
  console.log('  Teacher: fatima.ali@faithhorizon.school / Teacher123!');
  console.log('  Teacher: bilal.ahmed@faithhorizon.school / Teacher123!');
  console.log('  Teacher: ayesha.nawaz@faithhorizon.school / Teacher123!');
  console.log('  Student: ali.raza@student.faithhorizon.school / Student123!');
  console.log('  (+ 11 more students)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
