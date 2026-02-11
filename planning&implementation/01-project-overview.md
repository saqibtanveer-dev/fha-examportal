# ExamCore - School Examination & Quiz Automation System

## Project Overview

**ExamCore** is a web-based examination and quiz automation system designed for a single school. It digitizes the traditional paper-based testing process by enabling teachers to create, manage, and auto-grade examinations — including MCQs, short answers, and long answers — with AI-powered grading.

---

## Problem Statement

- Teachers spend excessive time creating, distributing, and grading paper-based tests
- MCQ grading is repetitive and error-prone when done manually
- Short answer and long answer grading is subjective and time-consuming
- No centralized system for tracking student performance over time
- Paper-based exams are not scalable and lack analytics

---

## Solution

A production-ready web application that:

1. Allows teachers to create exams with MCQ, short answer, and long answer questions
2. Enables students to take exams on computers with a clean, distraction-free interface
3. Auto-grades MCQs instantly via answer matching
4. Uses AI to evaluate and grade short and long answer responses
5. Provides detailed analytics and performance reports
6. Manages the entire examination lifecycle digitally

---

## Core Actors

| Actor   | Description                                                    |
| ------- | -------------------------------------------------------------- |
| Admin   | Manages school settings, teachers, students, classes, subjects |
| Teacher | Creates exams, manages question banks, reviews AI grades       |
| Student | Takes exams, views results, tracks own performance             |

---

## Core Features (High-Level)

### Authentication & Authorization
- Role-based access control (Admin, Teacher, Student)
- Secure login/logout with session management
- Password reset functionality

### User Management (Admin)
- CRUD operations for teachers and students
- Class and section management
- Subject and department management
- Bulk import via CSV

### Question Bank (Teacher)
- Create, edit, delete questions by subject/topic
- Question types: MCQ, Short Answer, Long Answer
- Tag-based categorization (difficulty, topic, bloom's taxonomy)
- Reuse questions across multiple exams

### Exam Management (Teacher)
- Create exams with mixed question types
- Set time limits, scheduling, and availability windows
- Assign exams to specific classes/sections
- Configure grading rules and passing criteria
- Random question ordering option
- Manual question selection or auto-generate from question bank

### Exam Taking (Student)
- Clean, distraction-free exam interface
- Timer with warnings
- Auto-save answers periodically
- Submit exam manually or auto-submit on timeout
- Navigation between questions
- Mark questions for review

### Auto-Grading Engine
- **MCQs**: Instant grading via exact answer matching
- **Short Answers**: AI-powered evaluation against model answers
- **Long Answers**: AI-powered evaluation with rubric-based scoring
- Confidence score for AI-graded answers
- Teacher can review and override AI grades

### Results & Analytics
- Individual student result cards
- Class-wide performance analytics
- Question-level analytics (difficulty, discrimination index)
- Export results to CSV/PDF
- Historical performance tracking

---

## Non-Functional Requirements

| Requirement              | Target                                          |
| ------------------------ | ----------------------------------------------- |
| Response Time            | < 200ms for API calls (95th percentile)         |
| Concurrent Users         | Support 500+ simultaneous exam takers           |
| Availability             | 99.5% uptime                                    |
| Data Security            | Encrypted at rest and in transit                 |
| Code Modularity          | No file exceeds 300 lines                       |
| Code Quality             | ESLint + Prettier enforced                       |
| Test Coverage            | Minimum 80% for critical paths                  |
| Accessibility            | WCAG 2.1 AA compliant                           |
| Browser Support          | Chrome, Firefox, Edge, Safari (latest 2 versions)|
| Mobile Responsive        | Fully responsive design                          |

---

## Project Principles

1. **MODULARITY FIRST**: Every file under 300 lines — no exceptions
2. **SCALABILITY**: Horizontally scalable architecture
3. **PRODUCTION READY**: Error handling, logging, monitoring from day one
4. **REUSABILITY**: Shared components, hooks, utilities, and services
5. **MAINTAINABILITY**: Clear separation of concerns, consistent patterns
6. **STANDARDS**: Industry-standard code patterns and conventions
7. **SINGLE TENANT**: One school deployment — no multi-tenant complexity
8. **SaaS-LEVEL QUALITY**: Even though single tenant, built with top-tier engineering standards

---

## Scope Boundaries

### In Scope
- Web application (desktop + mobile responsive)
- Three user roles (Admin, Teacher, Student)
- MCQ, Short Answer, Long Answer question types
- AI-powered grading for subjective questions
- Analytics and reporting
- Question bank management

### Out of Scope (V1)
- Mobile native applications
- Video proctoring
- Live exam monitoring/chat
- Multi-language support
- Parent portal
- Payment/billing (single school, not SaaS)
- Multi-tenant architecture
