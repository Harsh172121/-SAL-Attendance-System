/**
 * SAL Education - Lecture Slot Routes
 * 
 * Teacher routes for managing lecture timetable slots.
 * VIVA NOTE: Teachers can create, view, edit, delete their slots
 * and auto-detect current lecture for attendance marking.
 */

const express = require('express');
const router = express.Router();
const {
  createSlot,
  getMySlots,
  getCurrentSlot,
  updateSlot,
  deleteSlot
} = require('../controllers/lectureSlotController');
const { protect, teacherOnly } = require('../middleware');

// All routes require authentication and teacher role
router.use(protect);
router.use(teacherOnly);

// Get current active lecture slot (auto-detect)
router.get('/current', getCurrentSlot);

// Get all lecture slots for logged-in faculty
router.get('/', getMySlots);

// Create a new lecture slot
router.post('/', createSlot);

// Update a lecture slot
router.put('/:id', updateSlot);

// Delete a lecture slot
router.delete('/:id', deleteSlot);

module.exports = router;
