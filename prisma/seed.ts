import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // 1. School Settings
  // ============================================
  const settings = await prisma.schoolSettings.upsert({
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
        'A': { min: 80, max: 89 },
        'B': { min: 70, max: 79 },
        'C': { min: 60, max: 69 },
        'D': { min: 50, max: 59 },
        'F': { min: 0, max: 49 },
      },
    },
  });
  console.log('✅ School settings created');

  // ============================================
  // 2. Admin User
  // ============================================
  const adminPassword = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD ?? 'AdminPass123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@examcore.school' },
    update: {},
    create: {
      email: 'admin@examcore.school',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ============================================
  // 3. Teacher Users
  // ============================================
  const teacherPassword = await bcrypt.hash('Teacher123!', 12);
  const teacher1 = await prisma.user.upsert({
    where: { email: 'ahmed.khan@examcore.school' },
    update: {},
    create: {
      email: 'ahmed.khan@examcore.school',
      passwordHash: teacherPassword,
      firstName: 'Ahmed',
      lastName: 'Khan',
      role: 'TEACHER',
      isActive: true,
    },
  });
  const teacher2 = await prisma.user.upsert({
    where: { email: 'fatima.ali@examcore.school' },
    update: {},
    create: {
      email: 'fatima.ali@examcore.school',
      passwordHash: teacherPassword,
      firstName: 'Fatima',
      lastName: 'Ali',
      role: 'TEACHER',
      isActive: true,
    },
  });
  console.log('✅ Teacher users created');

  // ============================================
  // 4. Departments
  // ============================================
  const scienceDept = await prisma.department.upsert({
    where: { name: 'Science' },
    update: {},
    create: { name: 'Science', description: 'Natural Sciences Department' },
  });
  const mathsDept = await prisma.department.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: { name: 'Mathematics', description: 'Mathematics Department' },
  });
  const engDept = await prisma.department.upsert({
    where: { name: 'English' },
    update: {},
    create: { name: 'English', description: 'English Language Department' },
  });
  console.log('✅ Departments created');

  // ============================================
  // 5. Subjects
  // ============================================
  const physics = await prisma.subject.upsert({
    where: { code: 'PHY-101' },
    update: {},
    create: { name: 'Physics', code: 'PHY-101', departmentId: scienceDept.id },
  });
  const chemistry = await prisma.subject.upsert({
    where: { code: 'CHM-101' },
    update: {},
    create: { name: 'Chemistry', code: 'CHM-101', departmentId: scienceDept.id },
  });
  const maths = await prisma.subject.upsert({
    where: { code: 'MTH-101' },
    update: {},
    create: { name: 'Mathematics', code: 'MTH-101', departmentId: mathsDept.id },
  });
  const english = await prisma.subject.upsert({
    where: { code: 'ENG-101' },
    update: {},
    create: { name: 'English', code: 'ENG-101', departmentId: engDept.id },
  });
  console.log('✅ Subjects created');

  // ============================================
  // 6. Teacher Profiles
  // ============================================
  await prisma.teacherProfile.upsert({
    where: { userId: teacher1.id },
    update: {},
    create: {
      userId: teacher1.id,
      employeeId: 'TCH-001',
      qualification: 'MSc Physics',
      specialization: 'Mechanics & Thermodynamics',
    },
  });
  await prisma.teacherProfile.upsert({
    where: { userId: teacher2.id },
    update: {},
    create: {
      userId: teacher2.id,
      employeeId: 'TCH-002',
      qualification: 'MA English Literature',
      specialization: 'Grammar & Composition',
    },
  });
  console.log('✅ Teacher profiles created');

  // ============================================
  // 7. Classes & Sections
  // ============================================
  const class9 = await prisma.class.create({
    data: { name: 'Class 9', grade: 9 },
  });
  const class10 = await prisma.class.create({
    data: { name: 'Class 10', grade: 10 },
  });
  const sec9A = await prisma.section.create({
    data: { name: 'A', classId: class9.id },
  });
  const sec9B = await prisma.section.create({
    data: { name: 'B', classId: class9.id },
  });
  const sec10A = await prisma.section.create({
    data: { name: 'A', classId: class10.id },
  });
  console.log('✅ Classes & sections created');

  // ============================================
  // 8. Student Users
  // ============================================
  const studentPassword = await bcrypt.hash('Student123!', 12);
  const students = [];
  const studentData = [
    { email: 'ali.raza@student.examcore.school', firstName: 'Ali', lastName: 'Raza', roll: '9A-001', reg: 'REG-2025-001', classId: class9.id, sectionId: sec9A.id },
    { email: 'sara.ahmed@student.examcore.school', firstName: 'Sara', lastName: 'Ahmed', roll: '9A-002', reg: 'REG-2025-002', classId: class9.id, sectionId: sec9A.id },
    { email: 'usman.malik@student.examcore.school', firstName: 'Usman', lastName: 'Malik', roll: '9B-001', reg: 'REG-2025-003', classId: class9.id, sectionId: sec9B.id },
    { email: 'hira.sheikh@student.examcore.school', firstName: 'Hira', lastName: 'Sheikh', roll: '10A-001', reg: 'REG-2025-004', classId: class10.id, sectionId: sec10A.id },
  ];

  for (const s of studentData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: studentPassword,
        firstName: s.firstName,
        lastName: s.lastName,
        role: 'STUDENT',
        isActive: true,
      },
    });
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        rollNumber: s.roll,
        registrationNo: s.reg,
        classId: s.classId,
        sectionId: s.sectionId,
      },
    });
    students.push(user);
  }
  console.log('✅ Student users created');

  // ============================================
  // 9. Questions (Physics MCQs)
  // ============================================
  const q1 = await prisma.question.create({
    data: {
      subjectId: physics.id,
      createdById: teacher1.id,
      type: 'MCQ',
      title: 'What is the SI unit of force?',
      difficulty: 'EASY',
      marks: 1,
      mcqOptions: {
        createMany: {
          data: [
            { label: 'A', text: 'Joule', sortOrder: 0 },
            { label: 'B', text: 'Newton', isCorrect: true, sortOrder: 1 },
            { label: 'C', text: 'Watt', sortOrder: 2 },
            { label: 'D', text: 'Pascal', sortOrder: 3 },
          ],
        },
      },
    },
  });
  const q2 = await prisma.question.create({
    data: {
      subjectId: physics.id,
      createdById: teacher1.id,
      type: 'MCQ',
      title: 'Acceleration due to gravity on Earth is approximately:',
      difficulty: 'EASY',
      marks: 1,
      mcqOptions: {
        createMany: {
          data: [
            { label: 'A', text: '9.8 m/s²', isCorrect: true, sortOrder: 0 },
            { label: 'B', text: '10.5 m/s²', sortOrder: 1 },
            { label: 'C', text: '8.2 m/s²', sortOrder: 2 },
            { label: 'D', text: '11.0 m/s²', sortOrder: 3 },
          ],
        },
      },
    },
  });
  const q3 = await prisma.question.create({
    data: {
      subjectId: physics.id,
      createdById: teacher1.id,
      type: 'SHORT_ANSWER',
      title: 'Define Newton\'s First Law of Motion.',
      difficulty: 'MEDIUM',
      marks: 3,
      modelAnswer: 'An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.',
    },
  });
  const q4 = await prisma.question.create({
    data: {
      subjectId: physics.id,
      createdById: teacher1.id,
      type: 'LONG_ANSWER',
      title: 'Explain the difference between speed and velocity with examples.',
      difficulty: 'HARD',
      marks: 5,
      modelAnswer: 'Speed is a scalar quantity that refers to how fast an object is moving. Velocity is a vector quantity that refers to the rate at which an object changes its position, including direction.',
    },
  });
  console.log('✅ Questions created');

  // ============================================
  // 10. Sample Exam
  // ============================================
  const exam = await prisma.exam.create({
    data: {
      title: 'Physics Chapter 1 Quiz',
      subjectId: physics.id,
      createdById: teacher1.id,
      type: 'QUIZ',
      status: 'PUBLISHED',
      totalMarks: 10,
      passingMarks: 5,
      duration: 30,
      maxAttempts: 1,
      instructions: 'Answer all questions. MCQs carry 1 mark each.',
      examQuestions: {
        createMany: {
          data: [
            { questionId: q1.id, sortOrder: 0, marks: 1 },
            { questionId: q2.id, sortOrder: 1, marks: 1 },
            { questionId: q3.id, sortOrder: 2, marks: 3 },
            { questionId: q4.id, sortOrder: 3, marks: 5 },
          ],
        },
      },
      examClassAssignments: {
        create: { classId: class9.id },
      },
    },
  });
  console.log('✅ Sample exam created:', exam.title);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Admin:   admin@examcore.school / AdminPass123!');
  console.log('  Teacher: ahmed.khan@examcore.school / Teacher123!');
  console.log('  Teacher: fatima.ali@examcore.school / Teacher123!');
  console.log('  Student: ali.raza@student.examcore.school / Student123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
