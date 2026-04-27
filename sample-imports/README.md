Sample bulk import files for the admin CSV/XML upload feature.

Recommended import order:
1. `classes.csv` or `classes.xml`
2. `teachers.csv` or `teachers.xml`
3. `batches.csv` or `batches.xml`
4. `students.csv` or `students.xml`
5. `subjects.csv` or `subjects.xml`

Why this order:
- Batches depend on classes.
- Students depend on classes and optionally batches.
- Subjects depend on classes and teachers.

How to use:
- Login as admin.
- Open the matching manage page.
- Download/import the file from this folder.
- After import, the table on that page refreshes automatically.

Student CSV shortcut:
- `students.csv` uses simple form-style columns only:
  `Enrollment Number, Full Name, Email, Phone Number, Class, Batch (for Labs)`
- For student import, only `Class` is required from class mapping. `Batch (for Labs)` is optional.
