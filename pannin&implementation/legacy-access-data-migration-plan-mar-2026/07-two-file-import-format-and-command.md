# Two-File Import Format and Command

## Goal
Aap do files bana sakte hain:
- students.xlsx
- families.xlsx

Aur script in dono se data database me insert/update kar degi (idempotent upsert style).

## Command
Use:
pnpm import:students-families --students ./students.xlsx --families ./families.xlsx --admin-email admin@faithhorizon.school --dry-run

Production apply (without dry-run):
pnpm import:students-families --students ./students.xlsx --families ./families.xlsx --admin-email admin@faithhorizon.school

Optional:
--default-password StrongTemp123!

## Students File (first sheet) required headers
- email
- first_name
- last_name
- registration_no
- roll_number
- class
- section

## Students File optional headers
- phone
- guardian_name
- guardian_phone
- date_of_birth
- gender

## Families File (first sheet) required headers
- email
- first_name

## Families File recommended headers
- last_name
- relationship
- phone
- occupation
- address
- emergency_phone
- student_registration_nos

## student_registration_nos format
One cell me multiple registrations allowed:
- REG-001, REG-002
- REG-001;REG-002
- REG-001|REG-002

## Important behavior
- Existing user/student/family rows upsert honge (duplicate create nahi honge)
- FamilyStudentLink upsert hoga based on family+student pair
- Class and section must already exist in database
- Missing/invalid rows skip ho kar failed count me jayengi

## Safety recommendation
1. Hamesha pehle dry-run karo
2. Small pilot file se test karo
3. Phir full apply run karo

## Linked script
scripts/import-students-families.ts
