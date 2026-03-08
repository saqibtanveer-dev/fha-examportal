import { describe, it, expect } from 'vitest';
import { queryKeys, sessionKeys } from '@/lib/query-keys';

// ============================================
// Query Key Structure & Hierarchy Tests
// ============================================

describe('queryKeys', () => {
  describe('hierarchy pattern', () => {
    it('all keys start with their module root', () => {
      expect(queryKeys.exams.all).toEqual(['exams']);
      expect(queryKeys.questions.all).toEqual(['questions']);
      expect(queryKeys.grading.all).toEqual(['grading']);
      expect(queryKeys.results.all).toEqual(['results']);
      expect(queryKeys.subjects.all).toEqual(['subjects']);
      expect(queryKeys.classes.all).toEqual(['classes']);
      expect(queryKeys.users.all).toEqual(['users']);
      expect(queryKeys.notifications.all).toEqual(['notifications']);
      expect(queryKeys.departments.all).toEqual(['departments']);
      expect(queryKeys.principal.all).toEqual(['principal']);
      expect(queryKeys.sessions.all).toEqual(['sessions']);
      expect(queryKeys.student.all).toEqual(['student']);
      expect(queryKeys.campaigns.all).toEqual(['campaigns']);
      expect(queryKeys.applicants.all).toEqual(['applicants']);
      expect(queryKeys.meritList.all).toEqual(['merit-list']);
      expect(queryKeys.timetable.all).toEqual(['timetable']);
      expect(queryKeys.datesheet.all).toEqual(['datesheet']);
      expect(queryKeys.attendance.all).toEqual(['attendance']);
      expect(queryKeys.diary.all).toEqual(['diary']);
      expect(queryKeys.family.all).toEqual(['family']);
    });

    it('list keys extend the module root', () => {
      expect(queryKeys.exams.lists()).toEqual(['exams', 'list']);
      expect(queryKeys.questions.lists()).toEqual(['questions', 'list']);
      expect(queryKeys.results.lists()).toEqual(['results', 'list']);
      expect(queryKeys.campaigns.lists()).toEqual(['campaigns', 'list']);
      expect(queryKeys.applicants.lists()).toEqual(['applicants', 'list']);
      expect(queryKeys.datesheet.lists()).toEqual(['datesheet', 'list']);
    });

    it('detail keys extend the module root', () => {
      expect(queryKeys.exams.details()).toEqual(['exams', 'detail']);
      expect(queryKeys.questions.details()).toEqual(['questions', 'detail']);
      expect(queryKeys.campaigns.details()).toEqual(['campaigns', 'detail']);
      expect(queryKeys.applicants.details()).toEqual(['applicants', 'detail']);
      expect(queryKeys.datesheet.details()).toEqual(['datesheet', 'detail']);
    });
  });

  describe('parameterized keys', () => {
    it('detail keys include the id', () => {
      expect(queryKeys.exams.detail('exam-1')).toEqual(['exams', 'detail', 'exam-1']);
      expect(queryKeys.questions.detail('q-1')).toEqual(['questions', 'detail', 'q-1']);
      expect(queryKeys.users.detail('u-1')).toEqual(['users', 'detail', 'u-1']);
      expect(queryKeys.departments.detail('d-1')).toEqual(['departments', 'detail', 'd-1']);
      expect(queryKeys.campaigns.detail('c-1')).toEqual(['campaigns', 'detail', 'c-1']);
      expect(queryKeys.applicants.detail('a-1')).toEqual(['applicants', 'detail', 'a-1']);
      expect(queryKeys.datesheet.detail('ds-1')).toEqual(['datesheet', 'detail', 'ds-1']);
    });

    it('list keys include filters', () => {
      const filters = { page: 1, search: 'test' };
      expect(queryKeys.exams.list(filters)).toEqual(['exams', 'list', filters]);
      expect(queryKeys.questions.list(filters)).toEqual(['questions', 'list', filters]);
      expect(queryKeys.results.list(filters)).toEqual(['results', 'list', filters]);
      expect(queryKeys.users.list(filters)).toEqual(['users', 'list', filters]);
      expect(queryKeys.campaigns.list(filters)).toEqual(['campaigns', 'list', filters]);
    });

    it('different filters produce different keys', () => {
      const key1 = queryKeys.exams.list({ page: 1 });
      const key2 = queryKeys.exams.list({ page: 2 });
      expect(key1).not.toEqual(key2);
    });

    it('same filters produce equal keys', () => {
      const key1 = queryKeys.exams.list({ page: 1 });
      const key2 = queryKeys.exams.list({ page: 1 });
      expect(key1).toEqual(key2);
    });
  });

  describe('prefix-based invalidation compatibility', () => {
    it('exams.all is a prefix of exams.lists()', () => {
      const all = queryKeys.exams.all;
      const lists = queryKeys.exams.lists();
      expect(lists.slice(0, all.length)).toEqual(all);
    });

    it('exams.lists() is a prefix of exams.list(filters)', () => {
      const lists = queryKeys.exams.lists();
      const list = queryKeys.exams.list({ page: 1 });
      expect(list.slice(0, lists.length)).toEqual(lists);
    });

    it('exams.details() is a prefix of exams.detail(id)', () => {
      const details = queryKeys.exams.details();
      const detail = queryKeys.exams.detail('exam-1');
      expect(detail.slice(0, details.length)).toEqual(details);
    });

    it('attendance.daily() is a prefix of attendance.dailyByClassDate()', () => {
      const daily = queryKeys.attendance.daily();
      const specific = queryKeys.attendance.dailyByClassDate('c1', 's1', '2024-01-01');
      expect(specific.slice(0, daily.length)).toEqual(daily);
    });

    it('attendance.subject() is a prefix of attendance.subjectBySlot()', () => {
      const subject = queryKeys.attendance.subject();
      const specific = queryKeys.attendance.subjectBySlot('c1', 's1', 'sub1', 'ps1', '2024-01-01');
      expect(specific.slice(0, subject.length)).toEqual(subject);
    });

    it('attendance.stats() is a prefix of classTrend and schoolOverview', () => {
      const stats = queryKeys.attendance.stats();
      const trend = queryKeys.attendance.classTrend('c1', 's1');
      const overview = queryKeys.attendance.schoolOverview('2024-01-01');
      expect(trend.slice(0, stats.length)).toEqual(stats);
      expect(overview.slice(0, stats.length)).toEqual(stats);
    });
  });

  describe('uniqueness', () => {
    it('all module roots are unique', () => {
      const roots = [
        queryKeys.exams.all[0],
        queryKeys.writtenExams.all[0],
        queryKeys.questions.all[0],
        queryKeys.grading.all[0],
        queryKeys.results.all[0],
        queryKeys.subjects.all[0],
        queryKeys.classes.all[0],
        queryKeys.academicSessions.all[0],
        queryKeys.users.all[0],
        queryKeys.notifications.all[0],
        queryKeys.settings.all[0],
        queryKeys.departments.all[0],
        queryKeys.principal.all[0],
        queryKeys.sessions.all[0],
        queryKeys.student.all[0],
        queryKeys.campaigns.all[0],
        queryKeys.applicants.all[0],
        queryKeys.meritList.all[0],
        queryKeys.scholarshipReport.all[0],
        queryKeys.timetable.all[0],
        queryKeys.datesheet.all[0],
        queryKeys.attendance.all[0],
        queryKeys.diary.all[0],
        queryKeys.family.all[0],
      ];
      const unique = new Set(roots);
      expect(unique.size).toBe(roots.length);
    });
  });

  describe('module-specific keys', () => {
    it('principal.dashboard has nested structure', () => {
      expect(queryKeys.principal.dashboard.all).toEqual(['principal', 'dashboard']);
      expect(queryKeys.principal.dashboard.stats()).toEqual(['principal', 'dashboard', 'stats']);
      expect(queryKeys.principal.dashboard.activity()).toEqual(['principal', 'dashboard', 'activity']);
      expect(queryKeys.principal.dashboard.trends()).toEqual(['principal', 'dashboard', 'trends']);
    });

    it('timetable keys include class and teacher variants', () => {
      expect(queryKeys.timetable.periodSlots()).toEqual(['timetable', 'period-slots']);
      expect(queryKeys.timetable.byClass('c1', 's1')).toEqual(['timetable', 'class', 'c1', 's1']);
      expect(queryKeys.timetable.byTeacher('t1')).toEqual(['timetable', 'teacher', 't1']);
    });

    it('diary keys include teacher, student, and principal variants', () => {
      expect(queryKeys.diary.teacherEntries('tp1')).toEqual(['diary', 'teacher', 'tp1']);
      expect(queryKeys.diary.teacherCalendar('tp1', 2024, 6)).toEqual(['diary', 'teacher-calendar', 'tp1', 2024, 6]);
      expect(queryKeys.diary.studentEntries('c1', 's1')).toEqual(['diary', 'student', 'c1', 's1']);
      expect(queryKeys.diary.studentToday('c1', 's1')).toEqual(['diary', 'student-today', 'c1', 's1']);
      expect(queryKeys.diary.coverage('2024-01-01', '2024-01-31')).toEqual(['diary', 'coverage', '2024-01-01', '2024-01-31']);
      expect(queryKeys.diary.stats('2024-01-01', '2024-01-31')).toEqual(['diary', 'stats', '2024-01-01', '2024-01-31']);
    });

    it('family keys include child-scoped variants', () => {
      expect(queryKeys.family.children('u1')).toEqual(['family', 'children', 'u1']);
      expect(queryKeys.family.dashboard('child1')).toEqual(['family', 'dashboard', 'child1']);
      expect(queryKeys.family.childAttendance('child1')).toEqual(['family', 'attendance', 'child1']);
      expect(queryKeys.family.childResults('child1')).toEqual(['family', 'results', 'child1']);
      expect(queryKeys.family.childResultDetail('child1', 'r1')).toEqual(['family', 'results', 'child1', 'r1']);
    });

    it('written exams key includes exam-specific mark entry', () => {
      expect(queryKeys.writtenExams.markEntry('we1')).toEqual(['written-exams', 'mark-entry', 'we1']);
    });

    it('grading keys include session-level access', () => {
      expect(queryKeys.grading.sessions()).toEqual(['grading', 'sessions']);
      expect(queryKeys.grading.session('gs1')).toEqual(['grading', 'session', 'gs1']);
    });

    it('meritList and scholarshipReport are campaign-scoped', () => {
      expect(queryKeys.meritList.byCampaign('c1')).toEqual(['merit-list', 'c1']);
      expect(queryKeys.scholarshipReport.byCampaign('c1')).toEqual(['scholarship-report', 'c1']);
    });

    it('datesheet keys include entries, stats, class, and teacher duties', () => {
      expect(queryKeys.datesheet.entries('ds1')).toEqual(['datesheet', 'entries', 'ds1']);
      expect(queryKeys.datesheet.stats('ds1')).toEqual(['datesheet', 'stats', 'ds1']);
      expect(queryKeys.datesheet.byClass('c1', 's1')).toEqual(['datesheet', 'class', 'c1', 's1']);
      expect(queryKeys.datesheet.teacherDuties('tp1')).toEqual(['datesheet', 'teacher-duties', 'tp1']);
    });
  });

  describe('aliases', () => {
    it('sessionKeys is an alias for queryKeys.sessions', () => {
      expect(sessionKeys).toBe(queryKeys.sessions);
    });
  });

  describe('immutability', () => {
    it('all keys are readonly tuples', () => {
      const key = queryKeys.exams.detail('e1');
      // Verify it's an array (readonly tuple at type-level, array at runtime)
      expect(Array.isArray(key)).toBe(true);
      expect(key.length).toBe(3);
    });

    it('keys are fresh instances on each call', () => {
      const key1 = queryKeys.exams.lists();
      const key2 = queryKeys.exams.lists();
      expect(key1).toEqual(key2);
      expect(key1).not.toBe(key2); // different reference
    });
  });
});
