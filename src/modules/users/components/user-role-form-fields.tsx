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
};

export function StudentFormFields({
  classes, selectedClassId, onClassChange, selectedSectionId, onSectionChange, gender, onGenderChange, disabled,
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
          <Input id="rollNumber" name="rollNumber" required disabled={disabled} placeholder="e.g. 101" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationNo">Registration No <span className="text-destructive">*</span></Label>
          <Input id="registrationNo" name="registrationNo" required disabled={disabled} placeholder="e.g. STU-2026-001" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guardianName">Guardian Name</Label>
          <Input id="guardianName" name="guardianName" disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardianPhone">Guardian Phone</Label>
          <Input id="guardianPhone" name="guardianPhone" disabled={disabled} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" disabled={disabled} />
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

export function TeacherFormFields({ disabled }: { disabled: boolean }) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h4 className="text-sm font-semibold text-foreground">Teacher Profile</h4>
      <div className="space-y-2">
        <Label htmlFor="employeeId">Employee ID <span className="text-destructive">*</span></Label>
        <Input id="employeeId" name="employeeId" required disabled={disabled} placeholder="e.g. EMP-001" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="qualification">Qualification</Label>
          <Input id="qualification" name="qualification" disabled={disabled} placeholder="e.g. M.Sc Physics" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input id="specialization" name="specialization" disabled={disabled} placeholder="e.g. Quantum Mechanics" />
        </div>
      </div>
    </div>
  );
}

export function FamilyFormFields({ disabled }: { disabled: boolean }) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h4 className="text-sm font-semibold text-foreground">Family Profile</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship <span className="text-destructive">*</span></Label>
          <Input id="relationship" name="relationship" required disabled={disabled} placeholder="e.g. Father, Mother" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input id="occupation" name="occupation" disabled={disabled} placeholder="e.g. Engineer" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyPhone">Emergency Phone</Label>
          <Input id="emergencyPhone" name="emergencyPhone" disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
