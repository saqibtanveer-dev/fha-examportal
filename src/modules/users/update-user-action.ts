'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { updateUserSchema, type UpdateUserInput } from '@/validations/user-schemas';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { safeAction } from '@/lib/safe-action';

import { logger } from '@/lib/logger';

type NormalizedUpdateInput = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  isActive?: boolean;
  classId?: string;
  sectionId?: string;
  rollNumber?: string | null;
  registrationNo?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  dateOfBirth?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  employeeId?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  relationship?: string | null;
  occupation?: string | null;
  address?: string | null;
  emergencyPhone?: string | null;
};

function normalizeOptionalString(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeUpdateInput(input: UpdateUserInput): NormalizedUpdateInput {
  return {
    email: input.email?.trim().toLowerCase(),
    firstName: input.firstName?.trim(),
    lastName: input.lastName?.trim(),
    phone: normalizeOptionalString(input.phone),
    isActive: input.isActive,
    classId: input.classId,
    sectionId: input.sectionId,
    rollNumber: normalizeOptionalString(input.rollNumber),
    registrationNo: normalizeOptionalString(input.registrationNo),
    guardianName: normalizeOptionalString(input.guardianName),
    guardianPhone: normalizeOptionalString(input.guardianPhone),
    dateOfBirth: normalizeOptionalString(input.dateOfBirth),
    gender: input.gender ?? undefined,
    employeeId: normalizeOptionalString(input.employeeId),
    qualification: normalizeOptionalString(input.qualification),
    specialization: normalizeOptionalString(input.specialization),
    relationship: normalizeOptionalString(input.relationship),
    occupation: normalizeOptionalString(input.occupation),
    address: normalizeOptionalString(input.address),
    emergencyPhone: normalizeOptionalString(input.emergencyPhone),
  };
}

function hasAtLeastOneField(input: NormalizedUpdateInput): boolean {
  return Object.values(input).some((value) => value !== undefined);
}

export const updateUserAction = safeAction(async function updateUserAction(
  id: string,
  input: UpdateUserInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? 'Please check the entered information.');
  }

  const normalized = normalizeUpdateInput(parsed.data);
  if (!hasAtLeastOneField(normalized)) {
    return actionError('No changes were provided. Please update at least one field.');
  }

  const user = await prisma.user.findUnique({
    where: { id, deletedAt: null },
    include: {
      studentProfile: true,
      teacherProfile: true,
      familyProfile: true,
    },
  });

  if (!user) return actionError('User not found. It may have been removed already.');

  if (normalized.email && normalized.email !== user.email) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email: normalized.email },
      select: { id: true },
    });

    if (existingByEmail && existingByEmail.id !== id) {
      return actionError('This email is already in use. Please use a different email address.');
    }
  }

  if (user.role === 'STUDENT') {
    const touchesStudentProfile = [
      normalized.classId,
      normalized.sectionId,
      normalized.rollNumber,
      normalized.registrationNo,
      normalized.guardianName,
      normalized.guardianPhone,
      normalized.dateOfBirth,
      normalized.gender,
    ].some((value) => value !== undefined);

    const nextClassId = normalized.classId ?? user.studentProfile?.classId;
    const nextSectionId = normalized.sectionId ?? user.studentProfile?.sectionId;

    if (normalized.rollNumber === null || normalized.registrationNo === null) {
      return actionError('Roll number and registration number are required for students.');
    }

    if (nextClassId || nextSectionId) {
      if (!nextClassId || !nextSectionId) {
        return actionError('Please provide both class and section for a student.');
      }

      const section = await prisma.section.findFirst({
        where: { id: nextSectionId, classId: nextClassId },
        select: { id: true },
      });
      if (!section) {
        return actionError('Selected section does not belong to the selected class.');
      }
    }

    if (normalized.registrationNo && normalized.registrationNo !== user.studentProfile?.registrationNo) {
      const existingByReg = await prisma.studentProfile.findUnique({
        where: { registrationNo: normalized.registrationNo },
        select: { userId: true },
      });

      if (existingByReg && existingByReg.userId !== id) {
        return actionError('This registration number is already assigned to another student.');
      }
    }

    if (!user.studentProfile && touchesStudentProfile) {
      if (!nextClassId || !nextSectionId || !normalized.rollNumber || !normalized.registrationNo) {
        return actionError('Student profile is incomplete. Please provide class, section, roll number, and registration number.');
      }
    }
  }

  if (user.role === 'TEACHER') {
    const touchesTeacherProfile = [
      normalized.employeeId,
      normalized.qualification,
      normalized.specialization,
    ].some((value) => value !== undefined);

    if (normalized.employeeId === null) {
      return actionError('Employee ID is required for teachers.');
    }

    if (normalized.employeeId && normalized.employeeId !== user.teacherProfile?.employeeId) {
      const existingByEmployeeId = await prisma.teacherProfile.findUnique({
        where: { employeeId: normalized.employeeId },
        select: { userId: true },
      });

      if (existingByEmployeeId && existingByEmployeeId.userId !== id) {
        return actionError('This employee ID is already assigned to another teacher.');
      }
    }

    if (!user.teacherProfile && touchesTeacherProfile && !normalized.employeeId) {
      return actionError('Employee ID is required to create a missing teacher profile.');
    }
  }

  if (user.role === 'FAMILY') {
    const touchesFamilyProfile = [
      normalized.relationship,
      normalized.occupation,
      normalized.address,
      normalized.emergencyPhone,
    ].some((value) => value !== undefined);

    if (normalized.relationship === null) {
      return actionError('Relationship is required for family profiles.');
    }

    if (!user.familyProfile && touchesFamilyProfile && !normalized.relationship) {
      return actionError('Relationship is required to create a missing family profile.');
    }
  }

  await prisma.$transaction(async (tx) => {
    const userData: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      isActive?: boolean;
    } = {};

    if (normalized.email !== undefined) userData.email = normalized.email;
    if (normalized.firstName !== undefined) userData.firstName = normalized.firstName;
    if (normalized.lastName !== undefined) userData.lastName = normalized.lastName;
    if (normalized.phone !== undefined) userData.phone = normalized.phone;
    if (normalized.isActive !== undefined) userData.isActive = normalized.isActive;

    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id }, data: userData });
    }

    if (user.role === 'STUDENT') {
      const nextClassId = normalized.classId ?? user.studentProfile?.classId;
      const nextSectionId = normalized.sectionId ?? user.studentProfile?.sectionId;

      if (user.studentProfile) {
        const studentData: {
          classId?: string;
          sectionId?: string;
          rollNumber?: string;
          registrationNo?: string;
          guardianName?: string | null;
          guardianPhone?: string | null;
          dateOfBirth?: Date | null;
          gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
        } = {};

        if (normalized.classId !== undefined || normalized.sectionId !== undefined) {
          studentData.classId = nextClassId;
          studentData.sectionId = nextSectionId;
        }
        if (normalized.rollNumber !== undefined && normalized.rollNumber !== null) {
          studentData.rollNumber = normalized.rollNumber;
        }
        if (normalized.registrationNo !== undefined && normalized.registrationNo !== null) {
          studentData.registrationNo = normalized.registrationNo;
        }
        if (normalized.guardianName !== undefined) studentData.guardianName = normalized.guardianName;
        if (normalized.guardianPhone !== undefined) studentData.guardianPhone = normalized.guardianPhone;
        if (normalized.dateOfBirth !== undefined) {
          studentData.dateOfBirth = normalized.dateOfBirth ? new Date(normalized.dateOfBirth) : null;
        }
        if (normalized.gender !== undefined) studentData.gender = normalized.gender;

        if (Object.keys(studentData).length > 0) {
          await tx.studentProfile.update({
            where: { userId: id },
            data: studentData,
          });
        }
      } else {
        const hasDataForStudentProfile = [
          normalized.classId,
          normalized.sectionId,
          normalized.rollNumber,
          normalized.registrationNo,
          normalized.guardianName,
          normalized.guardianPhone,
          normalized.dateOfBirth,
          normalized.gender,
        ].some((value) => value !== undefined);

        if (hasDataForStudentProfile && nextClassId && nextSectionId && normalized.rollNumber && normalized.registrationNo) {
          await tx.studentProfile.create({
            data: {
              userId: id,
              classId: nextClassId,
              sectionId: nextSectionId,
              rollNumber: normalized.rollNumber,
              registrationNo: normalized.registrationNo,
              guardianName: normalized.guardianName ?? null,
              guardianPhone: normalized.guardianPhone ?? null,
              dateOfBirth: normalized.dateOfBirth ? new Date(normalized.dateOfBirth) : null,
              gender: normalized.gender ?? null,
            },
          });
        }
      }
    }

    if (user.role === 'TEACHER') {
      if (user.teacherProfile) {
        const teacherData: {
          employeeId?: string;
          qualification?: string | null;
          specialization?: string | null;
        } = {};

        if (normalized.employeeId !== undefined && normalized.employeeId !== null) {
          teacherData.employeeId = normalized.employeeId;
        }
        if (normalized.qualification !== undefined) teacherData.qualification = normalized.qualification;
        if (normalized.specialization !== undefined) teacherData.specialization = normalized.specialization;

        if (Object.keys(teacherData).length > 0) {
          await tx.teacherProfile.update({
            where: { userId: id },
            data: teacherData,
          });
        }
      } else if (normalized.employeeId) {
        await tx.teacherProfile.create({
          data: {
            userId: id,
            employeeId: normalized.employeeId,
            qualification: normalized.qualification ?? null,
            specialization: normalized.specialization ?? null,
          },
        });
      }
    }

    if (user.role === 'FAMILY') {
      if (user.familyProfile) {
        const familyData: {
          relationship?: string;
          occupation?: string | null;
          address?: string | null;
          emergencyPhone?: string | null;
        } = {};

        if (normalized.relationship !== undefined && normalized.relationship !== null) {
          familyData.relationship = normalized.relationship;
        }
        if (normalized.occupation !== undefined) familyData.occupation = normalized.occupation;
        if (normalized.address !== undefined) familyData.address = normalized.address;
        if (normalized.emergencyPhone !== undefined) familyData.emergencyPhone = normalized.emergencyPhone;

        if (Object.keys(familyData).length > 0) {
          await tx.familyProfile.update({
            where: { userId: id },
            data: familyData,
          });
        }
      } else if (normalized.relationship) {
        await tx.familyProfile.create({
          data: {
            userId: id,
            relationship: normalized.relationship,
            occupation: normalized.occupation ?? null,
            address: normalized.address ?? null,
            emergencyPhone: normalized.emergencyPhone ?? null,
          },
        });
      }
    }
  });

  createAuditLog(session.user.id, 'UPDATE_USER', 'USER', id, normalized).catch((err) =>
    logger.error({ err }, 'Audit log failed'),
  );
  revalidatePath('/admin/users');
  return actionSuccess();
});
