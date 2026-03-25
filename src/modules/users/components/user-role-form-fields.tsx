'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ClassInfo = {
  id: string;
  name: string;
  grade: number;
  sections: { id: string; name: string }[];
};

type StudentFieldsProps = {
  classes: ClassInfo[];
  selectedClassId: string;
  onClassChange: (id: string) => void;
  selectedSectionId: string;
  onSectionChange: (id: string) => void;
  gender: string;
  onGenderChange: (g: string) => void;
  disabled: boolean;
  defaults?: {
    rollNumber?: string;
    registrationNo?: string;
    guardianName?: string;
    guardianPhone?: string;
    dateOfBirth?: string;
  };
};

export function StudentFormFields({
  classes,
  selectedClassId,
  onClassChange,
  selectedSectionId,
  onSectionChange,
  gender,
  onGenderChange,
  disabled,
  defaults,
}: StudentFieldsProps) {
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const availableSections = selectedClass?.sections ?? [];

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h4 className="text-sm font-semibold text-foreground">Student Profile</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Class <span className="text-destructive">*</span></Label>
          <Select value={selectedClassId} onValueChange={onClassChange} disabled={disabled}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} (Grade {c.grade})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Section <span className="text-destructive">*</span></Label>
          <Select value={selectedSectionId} onValueChange={onSectionChange} disabled={disabled || !selectedClassId}>
            <SelectTrigger><SelectValue placeholder={selectedClassId ? 'Select section' : 'Select class first'} /></SelectTrigger>
            <SelectContent>
              {availableSections.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rollNumber">Roll Number <span className="text-destructive">*</span></Label>
          <Input
            id="rollNumber"
            name="rollNumber"
            required
            disabled={disabled}
            placeholder="e.g. 101"
            defaultValue={defaults?.rollNumber ?? ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationNo">Registration No <span className="text-destructive">*</span></Label>
          <Input
            id="registrationNo"
            name="registrationNo"
            required
            disabled={disabled}
            placeholder="e.g. STU-2026-001"
            defaultValue={defaults?.registrationNo ?? ''}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guardianName">Guardian Name</Label>
          <Input id="guardianName" name="guardianName" disabled={disabled} defaultValue={defaults?.guardianName ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardianPhone">Guardian Phone</Label>
          <Input id="guardianPhone" name="guardianPhone" disabled={disabled} defaultValue={defaults?.guardianPhone ?? ''} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" disabled={disabled} defaultValue={defaults?.dateOfBirth ?? ''} />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={gender} onValueChange={onGenderChange} disabled={disabled}>
            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function TeacherFormFields({
  disabled,
  defaults,
  requireEmployeeId = true,
}: {
  disabled: boolean;
  defaults?: {
    employeeId?: string;
    qualification?: string;
    specialization?: string;
  };
  requireEmployeeId?: boolean;
}) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h4 className="text-sm font-semibold text-foreground">Teacher Profile</h4>
      <div className="space-y-2">
        <Label htmlFor="employeeId">Employee ID <span className="text-destructive">*</span></Label>
        <Input
          id="employeeId"
          name="employeeId"
          required={requireEmployeeId}
          disabled={disabled}
          placeholder="e.g. EMP-001"
          defaultValue={defaults?.employeeId ?? ''}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="qualification">Qualification</Label>
          <Input id="qualification" name="qualification" disabled={disabled} placeholder="e.g. M.Sc Physics" defaultValue={defaults?.qualification ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input id="specialization" name="specialization" disabled={disabled} placeholder="e.g. Quantum Mechanics" defaultValue={defaults?.specialization ?? ''} />
        </div>
      </div>
    </div>
  );
}

export function FamilyFormFields({
  disabled,
  defaults,
  requireRelationship = true,
}: {
  disabled: boolean;
  defaults?: {
    relationship?: string;
    occupation?: string;
    address?: string;
    emergencyPhone?: string;
  };
  requireRelationship?: boolean;
}) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h4 className="text-sm font-semibold text-foreground">Family Profile</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship <span className="text-destructive">*</span></Label>
          <Input
            id="relationship"
            name="relationship"
            required={requireRelationship}
            disabled={disabled}
            placeholder="e.g. Father, Mother"
            defaultValue={defaults?.relationship ?? ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input id="occupation" name="occupation" disabled={disabled} placeholder="e.g. Engineer" defaultValue={defaults?.occupation ?? ''} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" disabled={disabled} defaultValue={defaults?.address ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyPhone">Emergency Phone</Label>
          <Input id="emergencyPhone" name="emergencyPhone" disabled={disabled} defaultValue={defaults?.emergencyPhone ?? ''} />
        </div>
      </div>
    </div>
  );
}
