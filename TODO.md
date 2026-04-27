# Subject-Class Many-to-Many Migration TODO

## Models
- [ ] Create `backend/models/SubjectClass.js` junction table model
- [ ] Update `backend/models/Subject.js` — remove `classIds` JSON field
- [ ] Update `backend/models/index.js` — replace broken associations with `belongsToMany`

## Controllers
- [ ] Update `backend/controllers/subjectController.js`
- [ ] Update `backend/controllers/studentAttendanceController.js`
- [ ] Update `backend/controllers/teacherAttendanceController.js`
- [ ] Update `backend/controllers/classController.js`
- [ ] Update `backend/controllers/lectureSlotController.js`
- [ ] Update `backend/controllers/slotAttendanceController.js`
- [ ] Update `backend/controllers/importController.js`
- [ ] Update `backend/controllers/teacherController.js`
- [ ] Update `backend/controllers/adminAttendanceController.js`

## Seeders & Migrations
- [ ] Update `backend/seeder.js`
- [ ] Create `backend/migrations/create-subject-classes.sql`

## Frontend
- [ ] Update `src/pages/admin/ManageSubjects.jsx` (filter safeguard)

## Testing
- [ ] Run migration SQL
- [ ] Restart backend and verify `/api/admin/subjects`

