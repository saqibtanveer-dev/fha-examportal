# Source to Target Mapping and Rules

## Mapping Strategy
Do-step mapping adopt karein:
1. Raw ingest (staging tables / staging JSON)
2. Validated transform into production entities

Direct raw-to-final insert avoid karein.

## Core Entity Mapping

### User + Profile
- Legacy student row -> User(role=STUDENT) + StudentProfile
- Legacy teacher row -> User(role=TEACHER) + TeacherProfile
- Legacy guardian row -> User(role=FAMILY) + FamilyProfile

### Academic Structure
- Legacy class label -> Class(name, grade)
- Legacy section label + class -> Section(unique classId+name)
- Legacy session/year -> AcademicSession

### Relationship Mapping
- Legacy guardian-student relation -> FamilyStudentLink
- Legacy promotion/year pass record -> StudentPromotion

### Fees
- Legacy fee plan -> FeeStructure / FeeCategory
- Legacy monthly challan -> FeeAssignment
- Legacy concession -> StudentFeeDiscount or FeeDiscount
- Legacy payment entries -> FeePayment / FamilyPayment
- Legacy advance/excess -> FeeCredit

## Identity Resolution Priority

### Student identity key order
1. registrationNo (strongest)
2. class + section + rollNumber
3. exact normalized name + guardianPhone + DOB (fallback)

### Teacher identity key order
1. employeeId
2. email
3. normalized name + phone

### Family identity key order
1. phone
2. email
3. normalized guardian name + address hash

## Normalization Rules
- Trim all strings
- Multiple spaces collapse into single
- Phone normalize to E.164-like local policy
- Email lower-case
- Name title-case only for display; matching me case-insensitive
- Dates canonical ISO format
- Decimal amounts 2 precision with strict parser

## Required Field Rules

### Student minimum required
- firstName
- lastName or fullName split policy
- class reference
- section reference
- registrationNo (if unavailable, pre-approved generated strategy)

### Fee minimum required
- student reference
- academic session reference
- month key (YYYY-MM)
- total amount
- due date

## Conflict Policy
- Duplicate with same canonical identity: merge candidate
- Duplicate with conflicting key fields: quarantine bucket
- Missing foreign references: unresolved bucket
- Invalid enumerations: mapped via lookup table or quarantined

## Quarantine Design
Har invalid row reject karne ke bajaye quarantine report me jaye:
- source row index
- source sheet
- error code
- error reason
- suggested fix

## Idempotency Rules
- Har row ko deterministic source hash mile
- Import batch run id maintain kare
- Re-run par already applied hashes skip hon
- Upsert only on approved unique keys

## Example Mapping Registry (template)
Use this structure in implementation:
- sourceSheet
- sourceColumn
- targetModel
- targetField
- transformer
- required
- validationRule
- defaultValue

## Domain-Specific Notes
- StudentProfile.registrationNo unique hai, is liye pre-clean mandatory
- Section unique class scope me hai, global section name se mapping na karein
- FeeAssignment unique student+session+month par constrained hai; duplicates aggregate ya reject policy pehle decide karein
- FamilyStudentLink unique familyProfile+studentProfile par constrained hai

## Approval Checkpoint
Mapping freeze tab hoga jab:
- 100% required columns mapped
- unresolved rate agreed threshold se kam
- sample dry-run 200 records par pass
