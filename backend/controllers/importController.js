1/**
 * SAL Education - Admin Import Controller
 *
 * Supports bulk import for admin-managed entities using CSV or XML files.
 * Imports are transactional so partially invalid files do not create partial data.
 */

const path = require('path');
const { parse: parseCsv } = require('csv-parse/sync');
const { XMLParser } = require('fast-xml-parser');
const { sequelize, Class, Batch, Student, Teacher, Subject } = require('../models');
const { normalizeTeacherDepartments } = require('../utils/teacherDepartments');

const ENTITY_CONFIG = {
  classes: { label: 'classes', singular: 'class' },
  batches: { label: 'batches', singular: 'batch' },
  students: { label: 'students', singular: 'student' },
  teachers: { label: 'teachers', singular: 'teacher' },
  subjects: { label: 'subjects', singular: 'subject' }
};

const CLASS_DEPARTMENT_ALIASES = {
  'computerengineering': 'Computer Engineering',
  'ce': 'Computer Engineering',
  'informationtechnology': 'Information Technology',
  'it': 'Information Technology',
  'electronicsengineering': 'Electronics',
  'electronics': 'Electronics',
  'mechanicalengineering': 'Mechanical',
  'mechanical': 'Mechanical',
  'civilengineering': 'Civil',
  'civil': 'Civil',
  'electricalengineering': 'Electrical',
  'electrical': 'Electrical'
};

const SUBJECT_TYPE_ALIASES = {
  'theory': 'theory',
  'lab': 'lab',
  'theorylab': 'theory+lab',
  'theoryandlab': 'theory+lab',
  'both': 'theory+lab'
};

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  parseTagValue: false
});

const hasValue = (value) => {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim() !== '';
  }

  return true;
};

const normalizeKey = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const unwrapValue = (value) => {
  let current = value;

  while (Array.isArray(current) && current.length === 1) {
    current = current[0];
  }

  while (current && typeof current === 'object' && !Array.isArray(current)) {
    const keys = Object.keys(current);

    if (keys.length !== 1) {
      break;
    }

    current = current[keys[0]];
  }

  return current;
};

const getFieldValue = (row, aliases) => {
  const normalizedEntries = new Map(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), unwrapValue(value)])
  );

  for (const alias of aliases) {
    const normalizedAlias = normalizeKey(alias);
    if (normalizedEntries.has(normalizedAlias)) {
      const value = normalizedEntries.get(normalizedAlias);
      if (hasValue(value)) {
        return value;
      }
    }
  }

  return undefined;
};

const getTextValue = (row, aliases) => {
  const value = getFieldValue(row, aliases);
  if (!hasValue(value)) return null;
  let text = String(value).trim();
  // Fix Excel scientific notation (e.g. 2.41133E+11 → 241133000000)
  if (/^[\d.]+[eE][+\-]?\d+$/.test(text)) {
    const num = Number(text);
    if (Number.isFinite(num) && num > 1e6) {
      text = num.toFixed(0);
    }
  }
  return text;
};

const getIntegerValue = (row, aliases) => {
  const value = getFieldValue(row, aliases);
  if (!hasValue(value)) {
    return null;
  }

  const number = Number.parseInt(String(value).trim(), 10);
  return Number.isNaN(number) ? null : number;
};

const getBooleanValue = (row, aliases, defaultValue = true) => {
  const value = getFieldValue(row, aliases);
  if (!hasValue(value)) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (['true', '1', 'yes', 'y', 'active'].includes(normalizedValue)) {
    return true;
  }

  if (['false', '0', 'no', 'n', 'inactive'].includes(normalizedValue)) {
    return false;
  }

  return defaultValue;
};

const createRowError = (rowNumber, message) => {
  const error = new Error(`Row ${rowNumber}: ${message}`);
  error.statusCode = 400;
  return error;
};

const parseXmlRows = (content, entity) => {
  const parsed = xmlParser.parse(content);
  const rootKey = Object.keys(parsed)[0];

  if (!rootKey) {
    throw new Error('XML file is empty or invalid.');
  }

  const root = parsed[rootKey];
  const { singular, label } = ENTITY_CONFIG[entity];

  const candidates = [
    root?.[singular],
    root?.record,
    root?.item,
    root?.row,
    root?.records?.[singular],
    root?.records?.record,
    root?.items?.item,
    root?.data?.[singular]
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (candidate && typeof candidate === 'object') {
      return [candidate];
    }
  }

  if (Array.isArray(root)) {
    return root;
  }

  if (root && typeof root === 'object') {
    const possibleArray = Object.values(root).find(
      (value) => Array.isArray(value) && value.every((item) => item && typeof item === 'object')
    );

    if (possibleArray) {
      return possibleArray;
    }

    const looksLikeSingleRecord = Object.values(root).some((value) => typeof unwrapValue(value) !== 'object');
    if (looksLikeSingleRecord) {
      return [root];
    }
  }

  throw new Error(
    `Unsupported XML structure. Wrap ${label} in <${ENTITY_CONFIG[entity].label}> with repeated <${singular}> nodes.`
  );
};

/**
 * Default CSV column order per entity when the file has no header row.
 * The detector checks whether the first CSV field looks like a known header name.
 */
const DEFAULT_CSV_COLUMNS = {
  students: ['enrollmentNo', 'name', 'email', 'phone', 'className', 'batchName'],
  teachers: ['employeeId', 'name', 'email', 'phone', 'department', 'departments', 'qualification'],
  classes: ['name', 'department', 'semester', 'academicYear', 'isActive'],
  batches: ['name', 'className', 'description', 'isActive'],
  subjects: ['code', 'name', 'type', 'className', 'theoryFacultyEmployeeId', 'labFacultyEmployeeId', 'credits']
};

const KNOWN_HEADER_TOKENS = new Set([
  'enrollmentno', 'enrollmentnumber', 'enrollment', 'name', 'fullname',
  'studentname', 'email', 'phone', 'phonenumber', 'class', 'classname',
  'batch', 'batchname', 'batchforlabs', 'employeeid', 'department', 'departments',
  'semester', 'code', 'type', 'credits', 'password', 'isactive',
  'academicyear', 'description', 'qualification', 'mobile', 'mobilenumber'
]);

const looksLikeHeader = (firstField) => {
  return KNOWN_HEADER_TOKENS.has(normalizeKey(firstField));
};

/**
 * Smart column detection for student CSV rows.
 * Analyses each cell value to figure out its type by content pattern,
 * then loads class/batch names from DB to match those columns.
 */
const detectStudentColumns = async (rawRows) => {
  // Collect all known class names and batch names from DB for matching
  const allClasses = await Class.findAll({ attributes: ['name'], raw: true });
  const allBatches = await Batch.findAll({ attributes: ['name'], raw: true });
  const classNames = new Set(allClasses.map(c => c.name.toLowerCase().trim()));
  const batchNames = new Set(allBatches.map(b => b.name.toLowerCase().trim()));

  // Patterns to identify column types
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = (v) => /^\d{10,15}$/.test(v.replace(/[\s\-+()]/g, ''));
  const isEnrollment = (v) => /^\d{6,}$/.test(v.replace(/[\s\-.]/g, '')) || /^[\d.]+[eE][+\-]?\d+$/.test(v);
  const isClassName = (v) => classNames.has(v.toLowerCase().trim());
  const isBatchName = (v) => batchNames.has(v.toLowerCase().trim());

  // Score each column across all rows
  const numCols = Math.max(...rawRows.map(r => r.length));
  const scores = Array.from({ length: numCols }, () => ({
    email: 0, phone: 0, enrollment: 0, className: 0, batchName: 0, text: 0, empty: 0
  }));

  for (const row of rawRows) {
    for (let i = 0; i < numCols; i++) {
      const val = (row[i] || '').trim();
      if (!val) { scores[i].empty++; continue; }
      if (isEmail(val)) scores[i].email++;
      else if (isClassName(val)) scores[i].className++;
      else if (isBatchName(val)) scores[i].batchName++;
      else if (isPhone(val)) scores[i].phone++;
      else if (isEnrollment(val)) scores[i].enrollment++;
      else scores[i].text++;
    }
  }

  // Assign columns by highest-confidence match, each type used once
  const columnMap = new Array(numCols).fill(null);
  const used = new Set();

  const assign = (type, field) => {
    if (used.has(field)) return;
    let bestCol = -1, bestScore = 0;
    for (let i = 0; i < numCols; i++) {
      if (columnMap[i] !== null) continue;
      if (scores[i][type] > bestScore) {
        bestScore = scores[i][type];
        bestCol = i;
      }
    }
    if (bestCol >= 0 && bestScore > 0) {
      columnMap[bestCol] = field;
      used.add(field);
    }
  };

  // Assign in priority order (most distinctive patterns first)
  assign('email', 'email');
  assign('className', 'className');
  assign('batchName', 'batchName');
  assign('enrollment', 'enrollmentNo');
  assign('phone', 'phone');

  // Remaining unassigned columns with text → first one is name
  for (let i = 0; i < numCols; i++) {
    if (columnMap[i] === null && scores[i].text > 0 && !used.has('name')) {
      columnMap[i] = 'name';
      used.add('name');
    }
  }

  // Any still-unassigned columns get generic labels
  let extra = 1;
  for (let i = 0; i < numCols; i++) {
    if (columnMap[i] === null) {
      columnMap[i] = `_extra${extra++}`;
    }
  }

  return columnMap;
};

const parseFileRows = (fileName, content, entity) => {
  const extension = path.extname(fileName || '').toLowerCase();

  if (!['.csv', '.xml'].includes(extension)) {
    throw new Error('Only CSV and XML files are supported.');
  }

  if (extension === '.csv') {
    // First, peek at the raw rows to decide whether a header is present
    const rawRows = parseCsv(content, {
      columns: false,
      skip_empty_lines: true,
      trim: true
    });

    if (!rawRows.length) {
      return [];
    }

    const firstCell = (rawRows[0][0] || '').trim();
    const hasHeader = looksLikeHeader(firstCell);

    if (hasHeader) {
      return parseCsv(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    }

    // No header detected – return raw rows; smart detection handled later per entity
    return { _rawRows: rawRows, _entity: entity };
  }

  return parseXmlRows(content, entity);
};

const normalizeClassDepartment = (value) => {
  if (!hasValue(value)) {
    return null;
  }

  const normalized = CLASS_DEPARTMENT_ALIASES[normalizeKey(value)];
  return normalized || String(value).trim();
};

const normalizeSubjectType = (value) => {
  if (!hasValue(value)) {
    return null;
  }

  return SUBJECT_TYPE_ALIASES[normalizeKey(value)] || null;
};

const resolveClassByReference = async (row, transaction, rowNumber) => {
  const classId = getIntegerValue(row, ['classId']);
  if (classId) {
    const classRecord = await Class.findByPk(classId, { transaction });
    if (!classRecord) {
      throw createRowError(rowNumber, `Class with ID ${classId} was not found.`);
    }
    return classRecord;
  }

  const className = getTextValue(row, ['className', 'class']);
  if (!className) {
    throw createRowError(rowNumber, 'Class reference is required. Use classId or className.');
  }

  const department = normalizeClassDepartment(getTextValue(row, ['classDepartment']));
  const semester = getIntegerValue(row, ['classSemester']);

  const where = { name: className };
  if (department) {
    where.department = department;
  }
  if (semester) {
    where.semester = semester;
  }

  const matches = await Class.findAll({ where, transaction });

  if (!matches.length) {
    throw createRowError(rowNumber, `Class "${className}" was not found.`);
  }

  if (matches.length > 1) {
    throw createRowError(
      rowNumber,
      `Class "${className}" is ambiguous. Add classDepartment or classSemester.`
    );
  }

  return matches[0];
};

const resolveBatchByReference = async (row, classId, transaction, rowNumber, required = false) => {
  const batchId = getIntegerValue(row, ['batchId']);
  if (batchId) {
    const batchRecord = await Batch.findByPk(batchId, { transaction });
    if (!batchRecord) {
      throw createRowError(rowNumber, `Batch with ID ${batchId} was not found.`);
    }
    if (classId && batchRecord.classId !== classId) {
      throw createRowError(rowNumber, 'Batch does not belong to the referenced class.');
    }
    return batchRecord;
  }

  const batchName = getTextValue(row, ['batchName', 'batch', 'batchForLabs']);
  if (!batchName) {
    if (required) {
      throw createRowError(rowNumber, 'Batch reference is required.');
    }
    return null;
  }

  const where = { name: batchName };
  if (classId) {
    where.classId = classId;
  }

  const matches = await Batch.findAll({ where, transaction });

  if (!matches.length) {
    // Auto-create the batch if a classId is available
    if (classId) {
      const newBatch = await Batch.create(
        { name: batchName, classId, isActive: true },
        { transaction }
      );
      return newBatch;
    }
    throw createRowError(rowNumber, `Batch "${batchName}" was not found.`);
  }

  if (matches.length > 1) {
    throw createRowError(rowNumber, `Batch "${batchName}" is ambiguous. Add classId or className.`);
  }

  return matches[0];
};

const resolveTeacherByReference = async (row, transaction, rowNumber, aliases, required = false) => {
  const teacherId = getIntegerValue(row, aliases.id);
  if (teacherId) {
    const teacher = await Teacher.findByPk(teacherId, { transaction });
    if (!teacher) {
      throw createRowError(rowNumber, `Teacher with ID ${teacherId} was not found.`);
    }
    return teacher;
  }

  const employeeId = getTextValue(row, aliases.employeeId);
  if (employeeId) {
    const teacher = await Teacher.findOne({ where: { employeeId }, transaction });
    if (!teacher) {
      throw createRowError(rowNumber, `Teacher with employee ID "${employeeId}" was not found.`);
    }
    return teacher;
  }

  const email = getTextValue(row, aliases.email);
  if (email) {
    const teacher = await Teacher.findOne({ where: { email: email.toLowerCase() }, transaction });
    if (!teacher) {
      throw createRowError(rowNumber, `Teacher with email "${email}" was not found.`);
    }
    return teacher;
  }

  if (required) {
    throw createRowError(rowNumber, 'Teacher reference is required.');
  }

  return null;
};

const buildStudentPassword = (enrollmentNo, password) => {
  if (hasValue(password)) {
    return String(password).trim();
  }

  return enrollmentNo.length >= 6
    ? enrollmentNo
    : `${enrollmentNo}${'123456'.slice(enrollmentNo.length)}`;
};

const buildTeacherPassword = (employeeId, password) => {
  if (hasValue(password)) {
    return String(password).trim();
  }

  return employeeId.length >= 6
    ? employeeId
    : `${employeeId}${'123456'.slice(employeeId.length)}`;
};

const importClasses = async (rows, transaction) => {
  let created = 0;
  let updated = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 1;
    const row = rows[index];

    const name = getTextValue(row, ['name']);
    const department = normalizeClassDepartment(getTextValue(row, ['department']));
    const semester = getIntegerValue(row, ['semester']);
    const academicYear = getTextValue(row, ['academicYear']);
    const isActive = getBooleanValue(row, ['isActive'], true);

    if (!name || !department || !semester) {
      throw createRowError(rowNumber, 'name, department, and semester are required.');
    }

    const existing = await Class.findOne({
      where: { name, department, semester },
      transaction
    });

    if (existing) {
      existing.academicYear = academicYear || existing.academicYear;
      existing.isActive = isActive;
      await existing.save({ transaction });
      updated += 1;
      continue;
    }

    await Class.create(
      {
        name,
        department,
        semester,
        academicYear: academicYear || '2025-26',
        isActive
      },
      { transaction }
    );

    created += 1;
  }

  return { created, updated };
};

const importBatches = async (rows, transaction) => {
  let created = 0;
  let updated = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 1;
    const row = rows[index];

    const name = getTextValue(row, ['name']);
    const description = getTextValue(row, ['description']);
    const isActive = getBooleanValue(row, ['isActive'], true);
    const classRecord = await resolveClassByReference(row, transaction, rowNumber);

    if (!name) {
      throw createRowError(rowNumber, 'Batch name is required.');
    }

    const existing = await Batch.findOne({
      where: { name, classId: classRecord.id },
      transaction
    });

    if (existing) {
      existing.description = description;
      existing.isActive = isActive;
      await existing.save({ transaction });
      updated += 1;
      continue;
    }

    await Batch.create(
      {
        name,
        classId: classRecord.id,
        description,
        isActive
      },
      { transaction }
    );

    created += 1;
  }

  return { created, updated };
};

const importStudents = async (rows, transaction) => {
  let created = 0;
  let updated = 0;

  // If rows came from smart detection (headerless CSV), resolve columns now
  let resolvedRows = rows;
  if (rows._rawRows) {
    const columnMap = await detectStudentColumns(rows._rawRows);
    resolvedRows = rows._rawRows.map((values) => {
      const row = {};
      columnMap.forEach((col, i) => {
        row[col] = i < values.length ? values[i] : '';
      });
      return row;
    });
  }

  for (let index = 0; index < resolvedRows.length; index += 1) {
    const rowNumber = index + 1;
    const row = resolvedRows[index];

    const enrollmentNo = getTextValue(row, ['enrollmentNo', 'enrollment', 'enrollmentNumber']);
    const name = getTextValue(row, ['name', 'fullName', 'studentName']);
    const email = getTextValue(row, ['email']);
    const phone = getTextValue(row, ['phone', 'phoneNumber', 'mobile', 'mobileNumber']);
    const password = getTextValue(row, ['password']);
    const isActive = getBooleanValue(row, ['isActive'], true);

    if (!enrollmentNo || !name || !email) {
      throw createRowError(rowNumber, 'enrollmentNo, name, and email are required.');
    }

    const classRecord = await resolveClassByReference(row, transaction, rowNumber);
    const batchRecord = await resolveBatchByReference(row, classRecord.id, transaction, rowNumber, false);

    const existing = await Student.scope('withPassword').findOne({
      where: { enrollmentNo },
      transaction
    });

    if (existing) {
      existing.name = name;
      existing.email = email.toLowerCase();
      existing.phone = phone;
      existing.classId = classRecord.id;
      existing.batchId = batchRecord ? batchRecord.id : null;
      existing.isActive = isActive;

      if (password) {
        existing.password = password;
      }

      await existing.save({ transaction });
      updated += 1;
      continue;
    }

    await Student.create(
      {
        enrollmentNo,
        name,
        email: email.toLowerCase(),
        phone,
        classId: classRecord.id,
        batchId: batchRecord ? batchRecord.id : null,
        password: buildStudentPassword(enrollmentNo, password),
        isActive
      },
      { transaction }
    );

    created += 1;
  }

  return { created, updated };
};

const importTeachers = async (rows, transaction) => {
  let created = 0;
  let updated = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 1;
    const row = rows[index];

    const employeeId = getTextValue(row, ['employeeId']);
    const name = getTextValue(row, ['name']);
    const email = getTextValue(row, ['email']);
    const phone = getTextValue(row, ['phone']);
    const departments = normalizeTeacherDepartments(getTextValue(row, ['departments', 'department']));
    const qualification = getTextValue(row, ['qualification']);
    const password = getTextValue(row, ['password']);
    const isActive = getBooleanValue(row, ['isActive'], true);

    if (!employeeId || !name || !email || departments.length === 0) {
      throw createRowError(rowNumber, 'employeeId, name, email, and at least one department are required.');
    }

    const existing = await Teacher.scope('withPassword').findOne({
      where: { employeeId },
      transaction
    });

    if (existing) {
      existing.name = name;
      existing.email = email.toLowerCase();
      existing.phone = phone;
      existing.department = departments[0];
      existing.departments = departments;
      existing.qualification = qualification;
      existing.isActive = isActive;

      if (password) {
        existing.password = password;
      }

      await existing.save({ transaction });
      updated += 1;
      continue;
    }

    await Teacher.create(
      {
        employeeId,
        name,
        email: email.toLowerCase(),
        phone,
        department: departments[0],
        departments,
        qualification,
        password: buildTeacherPassword(employeeId, password),
        isActive
      },
      { transaction }
    );

    created += 1;
  }

  return { created, updated };
};

const importSubjects = async (rows, transaction) => {
  let created = 0;
  let updated = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 1;
    const row = rows[index];

    const code = getTextValue(row, ['code']);
    const name = getTextValue(row, ['name']);
    const type = normalizeSubjectType(getTextValue(row, ['type']));
    const credits = getIntegerValue(row, ['credits']) || 3;
    const isActive = getBooleanValue(row, ['isActive'], true);

    if (!code || !name || !type) {
      throw createRowError(rowNumber, 'code, name, and type are required.');
    }

    const classRecord = await resolveClassByReference(row, transaction, rowNumber);
    const theoryTeacher = await resolveTeacherByReference(
      row,
      transaction,
      rowNumber,
      {
        id: ['theoryFacultyId', 'theoryTeacherId'],
        employeeId: ['theoryFacultyEmployeeId', 'theoryTeacherEmployeeId'],
        email: ['theoryFacultyEmail', 'theoryTeacherEmail']
      },
      type === 'theory' || type === 'theory+lab'
    );
    const labTeacher = await resolveTeacherByReference(
      row,
      transaction,
      rowNumber,
      {
        id: ['labFacultyId', 'labTeacherId'],
        employeeId: ['labFacultyEmployeeId', 'labTeacherEmployeeId'],
        email: ['labFacultyEmail', 'labTeacherEmail']
      },
      type === 'lab' || type === 'theory+lab'
    );

    const existing = await Subject.findOne({
      where: { code: code.toUpperCase() },
      transaction
    });

    const values = {
      code: code.toUpperCase(),
      name,
      type,
      classId: classRecord.id,
      theoryFacultyId: type === 'lab' ? null : theoryTeacher?.id || null,
      labFacultyId: type === 'theory' ? null : labTeacher?.id || null,
      theoryFacultyIds: type === 'lab' || !theoryTeacher?.id ? [] : [theoryTeacher.id],
      labFacultyIds: type === 'theory' || !labTeacher?.id ? [] : [labTeacher.id],
      credits,
      isActive
    };

    if (existing) {
      Object.assign(existing, values);
      await existing.save({ transaction });
      updated += 1;
      continue;
    }

    await Subject.create(values, { transaction });
    created += 1;
  }

  return { created, updated };
};

const importHandlers = {
  classes: importClasses,
  batches: importBatches,
  students: importStudents,
  teachers: importTeachers,
  subjects: importSubjects
};

/**
 * @desc    Bulk import data for admin entities
 * @route   POST /api/admin/import/:entity
 * @access  Private/Admin
 */
const importEntityData = async (req, res) => {
  try {
    const entity = req.params.entity;
    const { fileName, content } = req.body;

    if (!ENTITY_CONFIG[entity]) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported import entity.'
      });
    }

    if (!fileName || !content) {
      return res.status(400).json({
        success: false,
        message: 'fileName and content are required.'
      });
    }

    const rows = parseFileRows(fileName, content, entity);

    const rowCount = rows._rawRows ? rows._rawRows.length : rows.length;
    if (!rowCount) {
      return res.status(400).json({
        success: false,
        message: 'The provided file does not contain any rows.'
      });
    }

    const summary = await sequelize.transaction(async (transaction) => {
      const result = await importHandlers[entity](rows, transaction);
      return {
        entity,
        totalRows: rowCount,
        ...result
      };
    });

    res.status(200).json({
      success: true,
      message: `${summary.created} ${ENTITY_CONFIG[entity].label} created and ${summary.updated} updated successfully.`,
      data: summary
    });
  } catch (error) {
    console.error('Import error:', error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Error importing data'
    });
  }
};

module.exports = {
  importEntityData
};
