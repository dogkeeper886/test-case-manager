# User Authentication Test Plan

## Test Case 1: Valid User Login
**Description**: Verify that a user can successfully log in with valid credentials.

**Preconditions**: 
- User account exists in the system
- User has valid username and password

**Test Steps**:
1. Navigate to the login page
   - Expected: Login form is displayed with username and password fields
2. Enter valid username in the username field
   - Expected: Username is accepted and displayed
3. Enter valid password in the password field
   - Expected: Password is masked with asterisks
4. Click the "Login" button
   - Expected: User is redirected to the dashboard page
5. Verify user is logged in successfully
   - Expected: User's name is displayed in the header

**Priority**: High
**Type**: Functional

## Test Case 2: Invalid Password Login Attempt
**Description**: Verify that the system properly handles login attempts with invalid passwords.

**Preconditions**:
- User account exists in the system
- User has valid username but incorrect password

**Test Steps**:
1. Navigate to the login page
   - Expected: Login form is displayed
2. Enter valid username
   - Expected: Username is accepted
3. Enter incorrect password
   - Expected: Password field accepts input
4. Click the "Login" button
   - Expected: Error message "Invalid username or password" is displayed
5. Verify user remains on login page
   - Expected: User is not redirected and stays on login page

**Priority**: High
**Type**: Security

## Test Case 3: Password Reset Functionality
**Description**: Test the password reset functionality for users who forgot their password.

**Preconditions**:
- User account exists with valid email address
- Email service is configured and working

**Test Steps**:
1. Navigate to the login page
   - Expected: Login page loads successfully
2. Click "Forgot Password?" link
   - Expected: Password reset form is displayed
3. Enter valid email address
   - Expected: Email field accepts the input
4. Click "Send Reset Link" button
   - Expected: Success message "Reset link sent to your email" appears
5. Check email inbox for reset link
   - Expected: Password reset email is received within 5 minutes
6. Click the reset link in email
   - Expected: Password reset form opens
7. Enter new password
   - Expected: Password requirements are displayed and validated
8. Confirm new password
   - Expected: Password confirmation matches
9. Submit new password
   - Expected: Success message and redirect to login page

**Priority**: Medium
**Type**: Functional