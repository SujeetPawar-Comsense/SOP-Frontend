# 🤖 AI BRD Upload Feature - User Guide

## 🎯 What is This?

The **Parse BRD with AI** feature allows Project Owners to:
- ✅ Upload or paste a Business Requirements Document
- ✅ AI automatically extracts project structure
- ✅ Creates complete project with modules, user stories, and features
- ✅ Saves everything to the database
- ✅ Ready to start development immediately!

---

## 🚀 How to Use

### Step 1: Access the Feature

1. **Login** as Project Owner
2. Go to **"Select a Project"** page
3. Click the **"Parse BRD with AI"** button (cyan/sparkles icon)

### Step 2: Upload Your BRD

**Option A: Paste Content**
1. Click **"Paste Content"** tab
2. Paste your BRD document text
3. (Optional) Enter custom project name

**Option B: Upload File**
1. Click **"Upload File"** tab
2. Click **"Choose File"**
3. Select your BRD file (.txt, .md, .doc, .docx)
4. File content loads automatically
5. (Optional) Enter custom project name

### Step 3: Parse with AI

1. Review the content preview
2. Click **"Parse BRD with AI"** button
3. Wait for AI to process (~10-30 seconds)
4. See success message!

### Step 4: View Your Project

- ✅ Project automatically created
- ✅ Modules extracted and saved
- ✅ User stories generated
- ✅ Features/tasks created
- ✅ Business rules identified

You'll be redirected to the new project automatically!

---

## 📄 BRD Format

### Recommended Structure:

```markdown
# Business Requirements Document

## Project Overview
**Project Name:** E-commerce Platform
**Description:** Online shopping platform for small businesses

**Vision:** Become the leading e-commerce solution

**Objectives:**
- Launch MVP in 3 months
- Support 1000 concurrent users
- Process secure payments

**In Scope:**
- User registration
- Product catalog
- Shopping cart
- Checkout

**Out of Scope:**
- Mobile apps (Phase 2)
- International shipping (Phase 2)

## Functional Requirements
1. Users must be able to create accounts
2. Products must be searchable
3. Secure payment processing required

## Non-Functional Requirements
- Performance: Page load < 2 seconds
- Security: PCI DSS compliant
- Availability: 99.9% uptime

## Modules

### 1. User Management

**Description:** Handles all user-related functionality

#### User Stories:

**US-001: User Registration**
- **As a** new user
- **I want to** create an account
- **So that** I can shop online

**Priority:** High

**Acceptance Criteria:**
- User can register with email and password
- Email must be validated
- Password must be 8+ characters
- Welcome email sent on registration

**Features/Tasks:**
- Registration Form UI
- Email Validation API
- Password Hashing Service
- Welcome Email Template

**US-002: User Login**
- **As a** registered user
- **I want to** login to my account
- **So that** I can access my profile

**Priority:** High

**Acceptance Criteria:**
- Login with email/password
- Session persists for 7 days
- "Remember me" option available

**Features:**
- Login Form UI
- Authentication API
- Session Management
- "Forgot Password" Link

### 2. Product Catalog

**Description:** Product browsing and search

#### User Stories:

**US-003: Browse Products**
...

## Business Rules

**BR-001: Password Policy**
- All passwords must be 10+ characters
- Must include: uppercase, lowercase, number, special character

**Applicable to:**
- User Management Module
- User Registration Story
- Password Reset Story

**BR-002: Email Uniqueness**
- Each email address can only register once
- Case-insensitive comparison

**Applicable to:**
- User Management Module
```

---

## 🎨 What AI Extracts

### ✅ **Project Overview:**
- Project name
- Description
- Vision statement
- Purpose
- Objectives
- Scope (in/out)

### ✅ **Requirements:**
- Functional requirements
- Non-functional requirements
- Integration requirements
- Reporting requirements

### ✅ **Modules:**
- Module name
- Module description
- Priority (inferred)
- Status (defaulted)

### ✅ **User Stories:**
- User story text
- Title
- User role (extracted from "As a...")
- Priority
- Acceptance criteria
- Linked to module

### ✅ **Features/Tasks:**
- Feature name
- Task description
- Priority
- Acceptance criteria
- Linked to user story

### ✅ **Business Rules:**
- Rule name
- Description
- Applicable modules/stories

---

## 💡 Tips for Best Results

### 1. **Use Clear Headings**
```markdown
## Modules
### 1. User Management
#### User Stories:
```

### 2. **Format User Stories Properly**
```markdown
**US-001: User Login**
- As a customer
- I want to login
- So that I can access my account
```

### 3. **List Features Clearly**
```markdown
**Features:**
- Login Form UI
- Authentication API
- Session Management
```

### 4. **Specify Priorities**
```markdown
Priority: High
```

### 5. **Include Acceptance Criteria**
```markdown
**Acceptance Criteria:**
- User can login with email
- Session persists for 7 days
```

---

## 🔍 What Happens Behind the Scenes

```
1. You upload BRD
    ↓
2. Frontend sends to backend
    ↓
3. Backend sends to OpenRouter/OpenAI
    ↓
4. AI analyzes BRD
    ↓
5. AI returns structured JSON
    ↓
6. Backend creates:
   - Project
   - Project Information
   - Modules
   - User Stories
   - Features
   - Business Rules
    ↓
7. Everything saved to Supabase
    ↓
8. Frontend shows success
    ↓
9. You're redirected to new project!
```

**Time:** 10-30 seconds depending on BRD size

---

## 🧪 Try It Out

### Sample BRD for Testing:

```markdown
Business Requirements Document

Project: Task Management App

Vision: Simplify task tracking for small teams

Objectives:
- Launch in 2 months
- Support 100 users
- Mobile-friendly design

Modules:

1. User Authentication
- User signup
- User login
- Password reset

2. Task Management
- Create tasks
- Assign tasks
- Mark complete

Business Rules:
- Tasks must have due dates
- Only assigned user can mark complete
```

**Paste this and test!** 🧪

---

## ⚠️ Requirements

### **For AI Parsing to Work:**

- ✅ Backend must be running
- ✅ OpenRouter/OpenAI API key configured
- ✅ You must be logged in as Project Owner
- ✅ BRD content must be provided

### **Check Backend is Configured:**

```bash
curl http://localhost:3000/api/brd/check \
  -H "Authorization: Bearer TOKEN"
```

Should return: `"configured": true`

---

## 🚨 Troubleshooting

### Issue: "Failed to parse BRD"

**Fix:**
1. Check backend is running on port 3000
2. Verify OpenRouter API key in Backend/.env
3. Check browser console for errors
4. Ensure you're logged in

### Issue: "OpenAI is not configured"

**Fix:**
1. Backend/.env needs `OPENROUTER_API_KEY`
2. Restart backend
3. Test `/api/brd/check` endpoint

### Issue: Modal doesn't open

**Fix:**
1. Ensure you're logged in as Project Owner
2. Check browser console for errors
3. Refresh page

### Issue: Parsing takes too long

**Normal:** Large BRDs (10+ pages) can take 30-60 seconds
**If > 2 minutes:** Check backend logs for errors

---

## 📊 Cost Estimate

### Typical BRD Parsing:

**Small BRD (1-2 pages):**
- ~$0.02-$0.05 per parse

**Medium BRD (5-10 pages):**
- ~$0.05-$0.15 per parse

**Large BRD (20+ pages):**
- ~$0.15-$0.30 per parse

**Using Gemini Pro (OpenRouter):**
- Often FREE or very cheap!

---

## 🎊 Benefits

### **Time Saved:**
- Manual entry: 2-4 hours ❌
- AI parsing: 30 seconds ✅
- **Saves 99% of time!**

### **Accuracy:**
- Manual errors: Common ❌
- AI extraction: Consistent ✅
- **Reduces human error!**

### **Completeness:**
- AI extracts everything ✅
- Nothing missed ✅
- **Comprehensive extraction!**

---

## ✅ Summary

**Feature:** AI-powered BRD parsing  
**Location:** "Parse BRD with AI" button (Project Owner only)  
**Input:** BRD document (paste or upload)  
**Output:** Complete project with all data  
**Time:** 10-30 seconds  
**Cost:** ~$0.05-$0.15 per parse  

**Try it now!** 🚀

