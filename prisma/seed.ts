import { PrismaClient } from '@prisma/client';
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
      schoolName: 'ExamCore Academy',
      academicYear: '2025',
      email: 'admin@examcore.school',
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
    where: { email: 'admin@examcore.school' },
    update: {},
    create: {
      email: 'admin@examcore.school',
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
    where: { email: 'principal@examcore.school' },
    update: {},
    create: {
      email: 'principal@examcore.school',
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
    { email: 'ahmed.khan@examcore.school', first: 'Ahmed', last: 'Khan', empId: 'TCH-001', qual: 'MSc Physics', spec: 'Mechanics & Thermodynamics', subjects: [{ subjectId: physics.id, classId: class9.id }, { subjectId: physics.id, classId: class10.id }, { subjectId: maths.id, classId: class9.id }] },
    { email: 'fatima.ali@examcore.school', first: 'Fatima', last: 'Ali', empId: 'TCH-002', qual: 'MA English Literature', spec: 'Grammar & Composition', subjects: [{ subjectId: english.id, classId: class9.id }, { subjectId: english.id, classId: class10.id }, { subjectId: urdu.id, classId: class9.id }] },
    { email: 'bilal.ahmed@examcore.school', first: 'Bilal', last: 'Ahmed', empId: 'TCH-003', qual: 'MSc Chemistry', spec: 'Organic Chemistry', subjects: [{ subjectId: chemistry.id, classId: class9.id }, { subjectId: chemistry.id, classId: class10.id }, { subjectId: biology.id, classId: class9.id }] },
    { email: 'ayesha.nawaz@examcore.school', first: 'Ayesha', last: 'Nawaz', empId: 'TCH-004', qual: 'MSc Mathematics', spec: 'Calculus & Algebra', subjects: [{ subjectId: maths.id, classId: class10.id }, { subjectId: maths.id, classId: class11.id }, { subjectId: computer.id, classId: class11.id }] },
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
        where: { teacherId_subjectId: { teacherId: profile.id, subjectId: sub.subjectId } },
        update: {},
        create: { teacherId: profile.id, subjectId: sub.subjectId, classId: sub.classId },
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

  const students: typeof admin[] = [];
  for (const s of studentDefs) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { email: s.email, passwordHash: studentPw, firstName: s.first, lastName: s.last, role: 'STUDENT', isActive: true },
    });
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, rollNumber: s.roll, registrationNo: s.reg, classId: s.classId, sectionId: s.sectionId },
    });
    students.push(user);
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
        examClassAssignments: { create: { classId: class9.id } },
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
        examClassAssignments: { create: { classId: class9.id } },
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
        examClassAssignments: { create: { classId: class9.id } },
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
        examClassAssignments: { create: { classId: class10.id } },
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
        examClassAssignments: { create: { classId: class11.id } },
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
        examClassAssignments: { create: { classId: class9.id } },
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
      const student = class9Students[si]!;
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
      { userId: students[0]!.id, title: 'Exam Published', message: 'Physics Chapter 1 Quiz is now available.', type: 'EXAM_ASSIGNED' },
      { userId: students[0]!.id, title: 'Result Published', message: 'Your Chemistry Elements Quiz result is available.', type: 'RESULT_PUBLISHED', isRead: true },
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

  console.log('\n🎉 Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Admin:     admin@examcore.school / AdminPass123!');
  console.log('  Principal: principal@examcore.school / Principal123!');
  console.log('  Teacher: ahmed.khan@examcore.school / Teacher123!');
  console.log('  Teacher: fatima.ali@examcore.school / Teacher123!');
  console.log('  Teacher: bilal.ahmed@examcore.school / Teacher123!');
  console.log('  Teacher: ayesha.nawaz@examcore.school / Teacher123!');
  console.log('  Student: ali.raza@student.examcore.school / Student123!');
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
