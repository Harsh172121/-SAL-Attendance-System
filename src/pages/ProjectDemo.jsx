/**
 * SAL Education - College Attendance Management System
 * Project Introduction & Interactive Demo Page
 *
 * A comprehensive, interactive presentation and live demonstration
 * explaining the architecture, workflow, features, and benefits of the
 * SAL Attendance Management System for non-technical visitors,
 * students, faculty, and administrators.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import salLogo from '../assets/SAL.png';

// ============================================================================
// SVG ICONS (Clean, lightweight, self-contained)
// ============================================================================
const Icons = {
  Check: () => (
    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Login: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  UserCheck: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Academic: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  ),
  Database: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Play: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  ),
  Pause: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  FileText: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
  ),
};

export default function ProjectDemo() {
  // ============================================================================
  // INTERACTIVE SANDBOX DEMO 1: TEACHER ATTENDANCE MARKER
  // ============================================================================
  const [demoSessionType, setDemoSessionType] = useState('theory'); // 'theory' | 'lab'
  const [demoStudents, setDemoStudents] = useState([
    { id: 1, rollNo: '101', name: 'Aarav Patel', batch: 'Batch A', present: true },
    { id: 2, rollNo: '102', name: 'Diya Shah', batch: 'Batch A', present: true },
    { id: 3, rollNo: '103', name: 'Rohan Mehta', batch: 'Batch A', present: false },
    { id: 4, rollNo: '104', name: 'Ananya Joshi', batch: 'Batch B', present: true },
    { id: 5, rollNo: '105', name: 'Kabir Verma', batch: 'Batch B', present: true },
    { id: 6, rollNo: '106', name: 'Isha Desai', batch: 'Batch B', present: false },
  ]);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const displayedDemoStudents =
    demoSessionType === 'theory'
      ? demoStudents
      : demoStudents.filter((s) => s.batch === 'Batch A');

  const presentCount = displayedDemoStudents.filter((s) => s.present).length;
  const totalCount = displayedDemoStudents.length;
  const sessionPercentage = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

  const toggleStudent = (id) => {
    setDemoStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, present: !s.present } : s))
    );
    setDemoSubmitted(false);
  };

  const handleMarkAll = (status) => {
    setDemoStudents((prev) =>
      prev.map((s) =>
        demoSessionType === 'theory' || s.batch === 'Batch A'
          ? { ...s, present: status }
          : s
      )
    );
    setDemoSubmitted(false);
  };

  const handleDemoSubmit = () => {
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoSubmitted(false);
    }, 4000);
  };

  // ============================================================================
  // INTERACTIVE SANDBOX DEMO 2: PEER PROXY REQUEST FLOW
  // ============================================================================
  const [proxyStep, setProxyStep] = useState(1); // 1: Request, 2: Notification, 3: Accepted
  const [proxySubmitting, setProxySubmitting] = useState(false);

  const resetProxyDemo = () => {
    setProxyStep(1);
    setProxySubmitting(false);
  };

  const submitProxyRequest = () => {
    setProxySubmitting(true);
    setTimeout(() => {
      setProxySubmitting(false);
      setProxyStep(2);
    }, 700);
  };

  const acceptProxyRequest = () => {
    setProxyStep(3);
  };

  // ============================================================================
  // INTERACTIVE SANDBOX DEMO 3: STUDENT ATTENDANCE GAUGE
  // ============================================================================
  const [attendedLectures, setAttendedLectures] = useState(38);
  const totalLectures = 48;
  const studentPercentage = Math.round((attendedLectures / totalLectures) * 100);

  const getStatusColor = (pct) => {
    if (pct >= 75) return { bg: 'bg-green-500', text: 'text-green-600', ring: 'stroke-green-500', label: 'Eligible for Exams', sub: 'Safe (> 75%)' };
    if (pct >= 65) return { bg: 'bg-amber-500', text: 'text-amber-600', ring: 'stroke-amber-500', label: 'Warning Zone', sub: 'Critical (65% - 74%)' };
    return { bg: 'bg-red-500', text: 'text-red-600', ring: 'stroke-red-500', label: 'Detention Risk', sub: 'Below 65%' };
  };

  const statusInfo = getStatusColor(studentPercentage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-green-500 selection:text-white font-sans antialiased">
      {/* ===================================================================== */}
      {/* TOP NAVIGATION BAR                                                    */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/85 border-b border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link
            to="/login"
            className="flex items-center gap-3.5 group cursor-pointer focus:outline-none"
            title="Click to return to Login"
          >
            <div className="relative">
              <img
                src={salLogo}
                alt="SAL Education"
                className="w-12 h-12 rounded-full bg-white p-1 object-contain shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-green-400"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  SAL Education
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-900/80 text-blue-300 border border-blue-700/50">
                  Demo
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Attendance Management System
              </p>
            </div>
          </Link>

          {/* Quick Nav Anchors */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#overview" className="hover:text-white transition-colors">
              Overview
            </a>
            <a href="#stakeholders" className="hover:text-white transition-colors">
              Stakeholders
            </a>
            <a href="#flowchart" className="hover:text-green-400 transition-colors flex items-center gap-1.5">
              <span>System Flowchart</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </a>
            <a href="#sandbox" className="hover:text-white transition-colors">
              Interactive Demo
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#benefits" className="hover:text-white transition-colors">
              Benefits
            </a>
          </nav>

          {/* Action Button: Return to Login */}
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-green-900/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-green-700/50"
          >
            <span>Back to Login</span>
            <Icons.ArrowRight />
          </Link>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* HERO SECTION - PROJECT INTRODUCTION                                   */}
      {/* ===================================================================== */}
      <section id="overview" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-green-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* College Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-xs sm:text-sm font-medium mb-6 shadow-md backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
              <span>Official Academic Automation Project</span>
              <span className="text-slate-500">•</span>
              <span className="text-blue-400 font-semibold">SAL Education Campus</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
              College Attendance <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>

            {/* Sub-headline description */}
            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed">
              A modern, role-based digital attendance solution engineered to replace
              outdated paper muster rolls with instant 1-click marking, peer proxy requests,
              live student analytics, and automated university compliance reports.
            </p>

            {/* Call to Action Buttons */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#flowchart"
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-xl shadow-blue-900/40 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>View System Flowchart</span>
                <Icons.ArrowRight />
              </a>
              <a
                href="#sandbox"
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-base border border-slate-700 transition-all duration-300 flex items-center gap-2"
              >
                <span>Try Live Demo</span>
                <Icons.Play />
              </a>
            </div>

            {/* Key Metrics Quick Ribbon */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">3 Roles</div>
                <div className="text-xs text-slate-400 mt-1">Admin, Teacher, Student</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-green-400">&lt; 60s</div>
                <div className="text-xs text-slate-400 mt-1">Class Roll Call Speed</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
                <div className="text-xs text-slate-400 mt-1">Paperless &amp; Cloud Stored</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">75% Alert</div>
                <div className="text-xs text-slate-400 mt-1">Instant Eligibility Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PROBLEMS SOLVED (BEFORE VS AFTER)                                     */}
      {/* ===================================================================== */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-green-400">
              Purpose &amp; Problem Solving
            </span>
            <h2 className="text-3xl font-bold text-white mt-2">
              Transforming Campus Attendance
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Why manual registers no longer work in higher education and how SAL Attendance System solves every bottleneck.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 mb-4 font-bold text-lg">
                ✕
              </div>
              <h3 className="text-lg font-bold text-white">The Old Paper Register Way</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">•</span>
                  <span>10–15 minutes lost per lecture calling names.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">•</span>
                  <span>Physical registers get damaged, torn, or misplaced.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">•</span>
                  <span>Manual addition errors when tallying percentages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">•</span>
                  <span>Students discover detention risks only at exam time.</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-800/40 hover:border-blue-700/60 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-400 mb-4 font-bold text-lg">
                ✓
              </div>
              <h3 className="text-lg font-bold text-white">The SAL Digital System Way</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <Icons.Check />
                  <span>1-click roll call completed in under 60 seconds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.Check />
                  <span>Immutable PostgreSQL database records with audit trails.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.Check />
                  <span>Real-time mathematical calculation of percentages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icons.Check />
                  <span>Live 24/7 visibility for students with 75% alerts.</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-green-950/40 to-slate-900 border border-green-800/40 hover:border-green-700/60 transition-all md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-green-900/60 border border-green-700/50 flex items-center justify-center text-green-400 mb-4">
                <Icons.Sparkles />
              </div>
              <h3 className="text-lg font-bold text-white">Smart Faculty Proxy Automation</h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                When faculty members are absent, classes aren't halted. Teachers can request peer proxy faculty directly from their dashboard. Substitute faculty receive instant notifications, accept with one click, and mark attendance under their proxy credential.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-green-400 font-semibold flex items-center gap-1.5">
                <span>Direct Faculty-to-Faculty Handover</span>
                <Icons.ArrowRight />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION: STAKEHOLDER VALUE (STUDENTS, TEACHERS, ADMINISTRATORS)       */}
      {/* ===================================================================== */}
      <section id="stakeholders" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-bold text-blue-400">
              Campus Stakeholder Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Empowering Students, Faculty &amp; Administrators
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              A single unified architecture customized to serve the unique daily academic responsibilities of every campus user.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Students */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-green-500/50 transition-all group shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-green-950/70 border border-green-700/50 text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icons.Academic />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">
                Self-Service Portal
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-3">For Students</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Live Attendance Dashboard:</strong> Track overall percentage 24/7 from phone or laptop.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Subject Breakdown:</strong> Individual breakdown for Theory lectures and Lab practicals.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Eligibility Alerts:</strong> Instant visual indicators for the university 75% requirement.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Online Leave Application:</strong> Submit medical or personal leaves without physical paperwork.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Weekly Timetable:</strong> Real-time schedule with allocated classrooms and faculties.</span>
                </li>
              </ul>
            </div>

            {/* Teachers */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all group shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-blue-950/70 border border-blue-700/50 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icons.UserCheck />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Faculty Workspace
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-3">For Teachers</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Fast 1-Click Marking:</strong> Mark a full class of 60+ students in under 60 seconds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Class vs Batch Support:</strong> Whole-class roll call for Theory; Batch-filtered for Labs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Peer Proxy Requests:</strong> Delegate lectures to available peers with instant sidebar notifications.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Same-Day Updates:</strong> Easily correct inadvertent mistakes on the same academic date.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Leave Request Review:</strong> Evaluate student leave requests with transparent history.</span>
                </li>
              </ul>
            </div>

            {/* Administrators */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all group shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-purple-950/70 border border-purple-700/50 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icons.Shield />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Executive Control Hub
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-3">For Administrators</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Complete Entity Management:</strong> Full CRUD for Classes, Batches, Subjects, and Classrooms.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Dynamic Subject Allocation:</strong> Assign separate theory and lab faculties to the same subject.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Bulk CSV/XML Import:</strong> Onboard entire semester batches and faculty rosters instantly.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Hall Ticket Reports:</strong> Generate instant exam eligibility and detention warning lists.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icons.Check />
                  <span><strong>Immutable Audit Trail:</strong> Verify who marked each session with precise timestamps.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 2: SIMPLIFIED SYSTEM WORKING FLOW (COMPACT FLOWCHART)         */}
      {/* ===================================================================== */}
      <section id="flowchart" className="py-16 lg:py-24 relative bg-slate-900/60 border-t border-slate-800">
        {/* SVG Marker Definitions for Directional Flowchart Arrows */}
        <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
          <defs>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
            </marker>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
            <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#a855f7" />
            </marker>
            <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
            </marker>
            <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06b6d4" />
            </marker>
          </defs>
        </svg>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-700/60 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span>Simple Visual Flowchart</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Interactive System Working Flow
            </h2>
            <p className="text-slate-300 mt-2.5 text-sm sm:text-base leading-relaxed">
              Understand how attendance moves through the system in seconds. From single login to live reports and exam clearance.
            </p>

            {/* Quick Role Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> Admin (Setup)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950/60 border border-sky-500/40 text-sky-300">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Teacher (Roll Call)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Student (Live %)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Database (Storage)
              </span>
            </div>
          </div>

          {/* Flowchart Diagram Container */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl relative">
            
            {/* START TERMINATOR */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold tracking-wide shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>START &bull; User Enters SAL Attendance Portal</span>
              </div>
            </div>

            {/* CONNECTOR 1 */}
            <div className="flex flex-col items-center my-2">
              <div className="h-6 w-0.5 relative flex items-center justify-center">
                <svg className="h-full w-6 overflow-visible" viewBox="0 0 24 24">
                  <line x1="12" y1="0" x2="12" y2="20" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" className="animate-flow-dash" markerEnd="url(#arrow-blue)" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                Enter Credentials
              </span>
            </div>

            {/* STEP 1: SINGLE LOGIN PAGE */}
            <div className="max-w-md mx-auto">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 shadow-lg hover:border-blue-500/60 transition-all text-center">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <Icons.Login />
                  </div>
                  <h3 className="text-base font-bold text-white">1. Secure Login Page</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Single entry for all users. Enter email &amp; password &mdash; system verifies credentials and automatically identifies role.
                </p>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60 font-medium">Admin</span>
                  <span>&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/60 font-medium">Teacher</span>
                  <span>&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-medium">Student</span>
                </div>
              </div>
            </div>

            {/* CONNECTOR 2 */}
            <div className="flex flex-col items-center my-2">
              <div className="h-7 w-0.5 relative flex items-center justify-center">
                <svg className="h-full w-6 overflow-visible" viewBox="0 0 24 28">
                  <line x1="12" y1="0" x2="12" y2="24" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" className="animate-flow-dash" markerEnd="url(#arrow-blue)" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-700/80 px-2.5 py-0.5 rounded-full shadow-sm">
                Choose Your Role &amp; Open Dashboard ➔
              </span>
            </div>

            {/* STEP 2: ROLE-BASED DASHBOARDS (3 CONNECTED BRANCHES) */}
            <div>
              <div className="text-center mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  2. Role-Based Dashboards &amp; Operations
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Admin Branch */}
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-500/60 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                        <Icons.Shield />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Admin Portal</h4>
                        <span className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold">System Setup</span>
                      </div>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li className="flex items-start gap-1.5">
                        <span className="text-purple-400 mt-0.5 font-bold">&bull;</span>
                        <span>Creates subjects, semesters &amp; timetables.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-purple-400 mt-0.5 font-bold">&bull;</span>
                        <span>Assigns teachers &amp; divides student batches (A, B, C).</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-purple-400 mt-0.5 font-bold">&bull;</span>
                        <span>Generates college-wide attendance reports.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-2 border-t border-purple-800/40 text-[11px] font-medium text-purple-300/80 flex items-center justify-between">
                    <span>Configures Schedules</span>
                    <span className="text-purple-400 font-bold">➔</span>
                  </div>
                </div>

                {/* Teacher Branch (Main Execution Path) */}
                <div className="p-3.5 rounded-xl bg-sky-950/20 border-2 border-sky-500/50 shadow-md shadow-sky-950/40 hover:border-sky-400 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                          <Icons.UserCheck />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Teacher Portal</h4>
                          <span className="text-[10px] text-sky-300 uppercase tracking-wider font-semibold">Active Roll Call</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40">
                        Primary Flow
                      </span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li className="flex items-start gap-1.5">
                        <span className="text-sky-400 mt-0.5 font-bold">&bull;</span>
                        <span>Views scheduled daily theory &amp; lab slots.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-sky-400 mt-0.5 font-bold">&bull;</span>
                        <span>Takes roll call in under 60 seconds with 1 click.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-sky-400 mt-0.5 font-bold">&bull;</span>
                        <span>Assigns proxy lectures to peers if on leave.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-2 border-t border-sky-800/40 text-[11px] font-semibold text-sky-300 flex items-center justify-between">
                    <span>Marks Today's Attendance</span>
                    <span className="text-sky-400 font-bold">➔</span>
                  </div>
                </div>

                {/* Student Branch */}
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <Icons.Academic />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Student Portal</h4>
                        <span className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">Self-Service</span>
                      </div>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5 font-bold">&bull;</span>
                        <span>Checks live attendance % per subject.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5 font-bold">&bull;</span>
                        <span>Instant alerts if attendance drops below 75%.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-400 mt-0.5 font-bold">&bull;</span>
                        <span>Views timetable and submits leave requests.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-2 border-t border-amber-800/40 text-[11px] font-medium text-amber-300/80 flex items-center justify-between">
                    <span>Monitors Live Attendance</span>
                    <span className="text-amber-400 font-bold">➔</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CONNECTOR 3 */}
            <div className="flex flex-col items-center my-2">
              <div className="h-7 w-0.5 relative flex items-center justify-center">
                <svg className="h-full w-6 overflow-visible" viewBox="0 0 24 28">
                  <line x1="12" y1="0" x2="12" y2="24" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 3" className="animate-flow-dash" markerEnd="url(#arrow-cyan)" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-sky-300 bg-slate-900 border border-sky-700/60 px-2.5 py-0.5 rounded-full shadow-sm">
                Teacher Marks Roll Call ➔
              </span>
            </div>

            {/* STEP 3: MANAGE ATTENDANCE (THEORY VS LAB) */}
            <div className="max-w-2xl mx-auto">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-sky-500/40 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                      <Icons.Calendar />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">3. Manage &amp; Mark Attendance</h3>
                      <p className="text-xs text-slate-300">Teacher selects slot type and marks present or absent</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold">
                    &lt; 60 Seconds
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-slate-800">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 mb-1">
                      <span>📖</span>
                      <span>Theory Lecture Session</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Loads complete classroom roster for the semester. 1-click &ldquo;Mark All Present&rdquo; and toggle absentees quickly.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 mb-1">
                      <span>🔬</span>
                      <span>Lab Practical Session</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Filters automatically by Batch (Batch A, B, or C). Only students in the current lab batch appear on the screen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONNECTOR 4 */}
            <div className="flex flex-col items-center my-2">
              <div className="h-7 w-0.5 relative flex items-center justify-center">
                <svg className="h-full w-6 overflow-visible" viewBox="0 0 24 28">
                  <line x1="12" y1="0" x2="12" y2="24" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" className="animate-flow-dash" markerEnd="url(#arrow-green)" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-emerald-300 bg-slate-900 border border-emerald-700/60 px-2.5 py-0.5 rounded-full shadow-sm">
                Save &amp; Verify Record ➔
              </span>
            </div>

            {/* STEP 4: SAVE IN DATABASE (AUTO DUPLICATE CHECK) */}
            <div className="max-w-2xl mx-auto">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Icons.Database />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">4. Save Attendance in Database</h3>
                    <p className="text-xs text-slate-300">Secure PostgreSQL storage with automated validation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                    <div className="font-semibold text-emerald-300 text-[11px] flex items-center gap-1">
                      <span>🛡️</span> Prevents Duplicates
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Blocks recording attendance twice for the same slot on the same day.
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                    <div className="font-semibold text-emerald-300 text-[11px] flex items-center gap-1">
                      <span>✏️</span> Safe Updates
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      If a teacher corrects a mistake, the record updates seamlessly without extra rows.
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                    <div className="font-semibold text-emerald-300 text-[11px] flex items-center gap-1">
                      <span>⚡</span> Instant Percentage
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Recalculates attended lectures and overall % immediately in real time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONNECTOR 5 */}
            <div className="flex flex-col items-center my-2">
              <div className="h-7 w-0.5 relative flex items-center justify-center">
                <svg className="h-full w-6 overflow-visible" viewBox="0 0 24 28">
                  <line x1="12" y1="0" x2="12" y2="24" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" className="animate-flow-dash" markerEnd="url(#arrow-purple)" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-700/80 px-2.5 py-0.5 rounded-full shadow-sm">
                View Attendance &amp; Live Reports ➔
              </span>
            </div>

            {/* STEP 5: VIEW ATTENDANCE & LIVE REPORTS (STUDENT & COLLEGE OUTCOMES) */}
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* For Students */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Icons.Chart />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Student: Live Attendance %</h4>
                      <span className="text-[10px] text-amber-300 font-semibold">Immediate Visibility</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">&bull;</span>
                      <span><strong>&ge; 75% Safe:</strong> Marked eligible for final exam hall ticket.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-400 font-bold">&bull;</span>
                      <span><strong>&lt; 75% Warning:</strong> Automated alert shows classes needed to recover.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">&bull;</span>
                      <span><strong>Full History:</strong> Students can verify every single lecture date.</span>
                    </li>
                  </ul>
                </div>

                {/* For Admin & College */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/40 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                      <Icons.FileText />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">College: Reports &amp; Clearance</h4>
                      <span className="text-[10px] text-purple-300 font-semibold">Admin &amp; HOD Oversight</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">&bull;</span>
                      <span><strong>Instant Defaulter Lists:</strong> 1-click export of students below 75%.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">&bull;</span>
                      <span><strong>Hall Ticket Approvals:</strong> Clear audit trail for exam eligibility.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">&bull;</span>
                      <span><strong>Teacher Accountability:</strong> Timestamped record of who marked each session.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CONNECTOR TO END */}
            <div className="flex flex-col items-center my-2">
              <div className="h-6 w-0.5 relative flex items-center justify-center">
                <svg className="h-full w-6 overflow-visible" viewBox="0 0 24 24">
                  <line x1="12" y1="0" x2="12" y2="20" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" className="animate-flow-dash" markerEnd="url(#arrow-green)" />
                </svg>
              </div>
            </div>

            {/* END TERMINATOR */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-300 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/60">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>✓ END &bull; Academic Compliance &amp; Examination Clearance Approved</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Fast, reliable, 100% paperless attendance lifecycle from daily roll call to final examinations.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 3: INTERACTIVE LIVE SANDBOX DEMO                              */}
      {/* ===================================================================== */}
      <section id="sandbox" className="py-20 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-bold text-teal-400">
              Interactive Sandbox Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Try Core System Capabilities Live
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Interact directly with three real-world simulations: Teacher attendance marking,
              Peer proxy lecture dispatch, and Student health gauge calculation.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ------------------------------------------------------------- */}
            {/* SANDBOX 1: TEACHER ATTENDANCE MARKER                          */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-400">
                      <Icons.UserCheck />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">1. Teacher Roll Call</h3>
                      <p className="text-xs text-slate-400">1-Click Attendance Toggle</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                    Live Demo
                  </span>
                </div>

                {/* Session Mode Selector */}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDemoSessionType('theory');
                      setDemoSubmitted(false);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      demoSessionType === 'theory'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Theory (All Class)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDemoSessionType('lab');
                      setDemoSubmitted(false);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      demoSessionType === 'lab'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Lab (Batch A Only)
                  </button>
                </div>

                {/* Quick actions: Mark All Present / Absent */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Toggle student row:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkAll(true)}
                      className="text-green-400 hover:underline cursor-pointer"
                    >
                      All Present
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => handleMarkAll(false)}
                      className="text-red-400 hover:underline cursor-pointer"
                    >
                      All Absent
                    </button>
                  </div>
                </div>

                {/* Student list */}
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {displayedDemoStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                        student.present
                          ? 'bg-green-950/30 border-green-800/40 hover:bg-green-950/50'
                          : 'bg-red-950/30 border-red-800/40 hover:bg-red-950/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {student.rollNo}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {student.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {student.batch}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          student.present
                            ? 'bg-green-500 text-slate-950'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {student.present ? 'P' : 'A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit & Percentage summary */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="text-slate-400">
                    Session Attendance: <strong className="text-white">{presentCount}</strong> / {totalCount}
                  </span>
                  <span className="font-bold text-green-400 text-sm">
                    {sessionPercentage}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDemoSubmit}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icons.Database />
                  <span>Submit to Database</span>
                </button>

                {demoSubmitted && (
                  <div className="mt-2.5 p-2 rounded-lg bg-green-950/80 border border-green-800 text-green-300 text-xs text-center font-medium animate-bounce">
                    ✓ Attendance saved to PostgreSQL without duplicates!
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SANDBOX 2: PROXY LECTURE FLOW                                 */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-900/60 border border-green-700/50 flex items-center justify-center text-green-400">
                      <Icons.Users />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">2. Proxy Lecture Handover</h3>
                      <p className="text-xs text-slate-400">Faculty-to-Faculty Dispatch</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetProxyDemo}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    title="Reset simulation"
                  >
                    <Icons.Refresh />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Scenario details */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Absent Faculty:</span>
                    <span className="text-slate-200 font-medium">Prof. Rajesh Sharma</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Subject / Slot:</span>
                    <span className="text-blue-300 font-medium">Web Tech • Slot 2 (10:15)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target Substitute:</span>
                    <span className="text-emerald-400 font-medium">Prof. Anita Patel</span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="mt-5 space-y-4">
                  {proxyStep === 1 && (
                    <div className="space-y-3">
                      <div className="text-xs text-slate-300">
                        Prof. Sharma requests Prof. Patel to cover Slot 2.
                      </div>
                      <button
                        type="button"
                        onClick={submitProxyRequest}
                        disabled={proxySubmitting}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {proxySubmitting ? 'Sending Request...' : 'Send Proxy Request ➔'}
                      </button>
                    </div>
                  )}

                  {proxyStep === 2 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                          <Icons.Bell />
                          <span>Incoming Proxy Notification</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Prof. Anita Patel has received an unread proxy request for Slot 2 (Web Tech).
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={acceptProxyRequest}
                            className="flex-1 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                          >
                            Accept Proxy ✓
                          </button>
                          <button
                            type="button"
                            onClick={resetProxyDemo}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {proxyStep === 3 && (
                    <div className="p-4 bg-green-950/40 border border-green-800/60 rounded-xl space-y-2 text-center animate-fade-in">
                      <div className="text-green-400 font-bold text-sm">
                        ✓ Proxy Lecture Assigned!
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Slot 2 is now assigned to Prof. Anita Patel. She can directly open the attendance roll call for Web Tech.
                      </p>
                      <button
                        type="button"
                        onClick={resetProxyDemo}
                        className="mt-2 text-xs text-blue-400 hover:underline cursor-pointer"
                      >
                        Run simulation again
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Direct faculty handover removes administrative delays during sudden medical leaves.
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SANDBOX 3: STUDENT ATTENDANCE HEALTH GAUGE                    */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-900/60 border border-teal-700/50 flex items-center justify-center text-teal-400">
                      <Icons.Chart />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">3. Student Health Gauge</h3>
                      <p className="text-xs text-slate-400">Live 75% Threshold Engine</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Interactive
                  </span>
                </div>

                {/* Slider */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Lectures Attended:</span>
                    <span className="font-bold text-white text-sm">
                      {attendedLectures} / {totalLectures}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max={totalLectures}
                    value={attendedLectures}
                    onChange={(e) => setAttendedLectures(Number(e.target.value))}
                    className="w-full accent-green-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>15 Lectures</span>
                    <span className="text-amber-400">36 = 75% Target</span>
                    <span>48 Lectures</span>
                  </div>
                </div>

                {/* Circular Gauge Display */}
                <div className="mt-6 flex flex-col items-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background Ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      {/* Dynamic Value Ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className={`${statusInfo.ring} transition-all duration-300`}
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - studentPercentage / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-3xl font-extrabold text-white">
                        {studentPercentage}%
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Attendance
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold ${statusInfo.bg} text-slate-950 transition-all`}>
                    {statusInfo.label} • {statusInfo.sub}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
                Students see real-time status 24/7 without waiting for end-of-semester notices.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 4: KEY SYSTEM FEATURES                                        */}
      {/* ===================================================================== */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-bold text-blue-400">
              Capabilities Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Everything Needed for Modern Attendance
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Engineered with precision for SAL Education's students, teachers, and administrators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-700/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-900/40 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Shield />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Role-Based Security</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dedicated interfaces for Admin, Teacher, and Student with JWT HTTP-only cookie authentication and route guards.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-green-700/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-green-900/40 text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.UserCheck />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Theory &amp; Lab Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Seamless support for class-level theory lectures and batch-specific practical labs with separate faculty assignments.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-700/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-900/40 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Users />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Direct Peer Proxy</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Instant faculty-to-faculty lecture coverage requests with live unread indicators, notification popups, and 1-click approvals.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-700/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-900/40 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Chart />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real-Time % Analytics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automated cumulative percentage calculations, subject breakdowns, and color-coded threshold alerts (75% eligibility).
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-700/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.FileText />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Digital Leave Portal</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Students apply for medical or personal leaves online with dates and reasons; faculty review and record decisions digitally.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-700/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-900/40 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Calendar />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Academic Timetable</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Centralized schedules mapped to classrooms, subjects, batches, and lecture slots for seamless campus coordination.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-700/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-900/40 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Database />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Bulk CSV/XML Import</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Fast onboarding of students, teachers, and classes using standard CSV or XML files with duplicate detection.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-700/60 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-red-900/40 text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Clock />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Duplicate Prevention</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Relational constraints prevent duplicate attendance entries on identical slots while supporting same-day corrections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 5: TANGIBLE & INTANGIBLE BENEFITS                             */}
      {/* ===================================================================== */}
      <section id="benefits" className="py-20 bg-slate-900/70 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-bold text-green-400">
              Project Value &amp; Outcomes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Tangible &amp; Intangible Benefits
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              A comprehensive breakdown of concrete operational improvements and positive institutional cultural shifts.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Tangible Benefits */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-blue-900/50 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-blue-400 font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Tangible Benefits</h3>
                  <p className="text-xs text-blue-400">Measurable Operational Efficiencies</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icons.Check />
                  <div>
                    <h4 className="text-sm font-bold text-white">Time Saving</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Roll call time drops from 12 minutes per lecture to under 60 seconds, saving ~50 teaching hours per semester across departments.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.Check />
                  <div>
                    <h4 className="text-sm font-bold text-white">Reduced Paperwork</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Eliminates physical registers, paper muster sheets, physical folders, and ongoing printing and physical storage expenses.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.Check />
                  <div>
                    <h4 className="text-sm font-bold text-white">Improved Attendance Tracking</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Complete digital visibility into class-wide and batch-wide attendance history with slot timestamps and faculty identification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.Check />
                  <div>
                    <h4 className="text-sm font-bold text-white">Reduced Manual Errors</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Automated calculations prevent counting mistakes, inaccurate rounding, and accidental duplicate roll entries on identical slots.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.Check />
                  <div>
                    <h4 className="text-sm font-bold text-white">Better Administrative Efficiency</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hall ticket clearance lists that previously took administrative staff two weeks are generated instantaneously with single-click filters.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Intangible Benefits */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-green-900/50 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-green-900/60 border border-green-700/60 flex items-center justify-center text-green-400 font-bold">
                  ★
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Intangible Benefits</h3>
                  <p className="text-xs text-green-400">Institutional Culture &amp; Campus Dynamics</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icons.Check />
                  <div>
                    <h4 className="text-sm font-bold text-white">Transparency</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Students have continuous real-time insight into their attendance records, completely eliminating disputes and end-of-semester surprises.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.Check />
                  <div>
                    <h4 className="text-sm font-bold text-white">Accountability</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Every marked session retains audit timestamps, session slot links, and explicit proxy tagging for both teachers and administrators.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.Check />
                  <div>
                    <h4 className="text-sm font-bold text-white">Improved Communication</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Automated peer proxy notifications and digital leave status updates bridge faculty and student communication effortlessly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.Check />
                  <div>
                    <h4 className="text-sm font-bold text-white">Better User Experience</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      A fast, responsive, and mobile-friendly interface designed according to modern UI/UX standards with clear visual states.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.Check />
                  <div>
                    <h4 className="text-sm font-bold text-white">Trust &amp; Academic Integrity</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Consistent enforcement of university attendance guidelines reinforces student discipline and builds trust across the institution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CALL TO ACTION / FOOTER                                               */}
      {/* ===================================================================== */}
      <footer className="py-16 bg-slate-950 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <img
            src={salLogo}
            alt="SAL Education Logo"
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-white p-1 object-contain shadow-lg"
          />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Experience the System Firsthand
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-lg mx-auto">
            Ready to log in to your account? Access your student, teacher, or administrative dashboard right now.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-base shadow-xl shadow-green-900/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span>Go to Login Portal</span>
              <Icons.ArrowRight />
            </Link>
            <a
              href="#overview"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-base border border-slate-800 transition-all cursor-pointer"
            >
              Back to Top ↑
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-900 text-xs text-slate-400">
            © {new Date().getFullYear()} SAL Education • College Attendance Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
