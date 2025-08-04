# E-commerce Checkout Process Test Cases

## Overview
This document contains test cases for the checkout process in our e-commerce application.

## Test Case: Successful Checkout with Credit Card

**Test ID**: CHECKOUT-001  
**Priority**: High  
**Type**: Functional  

**Objective**: Verify users can complete checkout process with credit card payment

**Preconditions**:
- User is logged in
- Shopping cart contains at least one item
- Credit card payment gateway is available

**Test Steps**:

1. **Navigate to Shopping Cart**
   - Action: Click on shopping cart icon
   - Expected Result: Shopping cart page displays with items

2. **Proceed to Checkout**
   - Action: Click "Proceed to Checkout" button
   - Expected Result: Checkout page loads with order summary

3. **Enter Shipping Information**
   - Action: Fill in shipping address form
   - Expected Result: Form accepts valid address information

4. **Select Shipping Method**
   - Action: Choose "Standard Shipping (5-7 days)"
   - Expected Result: Shipping cost updates in order total

5. **Enter Payment Information**
   - Action: Enter credit card details (4111-1111-1111-1111, 12/25, 123)
   - Expected Result: Payment form accepts card information

6. **Review Order**
   - Action: Verify order details, shipping, and total
   - Expected Result: All information displays correctly

7. **Complete Purchase**
   - Action: Click "Place Order" button
   - Expected Result: Order confirmation page displays

8. **Verify Order Confirmation**
   - Action: Check confirmation details
   - Expected Result: Order number generated, confirmation email sent

---

## Test Case: Checkout with Invalid Credit Card

**Test ID**: CHECKOUT-002  
**Priority**: High  
**Type**: Negative Testing  

**Objective**: Verify system handles invalid credit card information

**Test Steps**:

1. Navigate to checkout with items in cart
2. Enter shipping information
3. Enter invalid credit card number (1234-5678-9012-3456)
4. Click "Place Order"
   - **Expected**: Error message displays "Invalid credit card number"
5. Verify order is not processed
   - **Expected**: User remains on checkout page, no order created

---

## Test Case: Guest Checkout Process

**Test ID**: CHECKOUT-003  
**Priority**: Medium  
**Type**: Functional  

**Objective**: Verify guest users can checkout without creating account

**Preconditions**:
- User is not logged in
- Shopping cart has items

**Test Steps**:

1. **Start Checkout as Guest**
   - Action: Click "Checkout as Guest" option
   - Expected: Guest checkout form appears

2. **Enter Contact Information**
   - Action: Provide email address and phone number
   - Expected: Form accepts contact details

3. **Complete Shipping Details**
   - Action: Fill in complete shipping address
   - Expected: Address validation passes

4. **Process Payment**
   - Action: Enter valid payment information
   - Expected: Payment processes successfully

5. **Receive Confirmation**
   - Action: Complete order
   - Expected: Guest receives order confirmation via email

---

## Test Case: Apply Discount Code

**Test ID**: CHECKOUT-004  
**Priority**: Medium  
**Type**: Functional  

**Prerequisites**:
- Valid discount code "SAVE10" exists (10% off)
- Cart total is over $50

**Steps**:
1. Proceed to checkout
2. Enter discount code "SAVE10" in promo code field
3. Click "Apply Code"
   - **Expected**: 10% discount applied to order total
4. Verify discount shows in order summary
   - **Expected**: Discount line item appears with correct amount
5. Complete checkout process
   - **Expected**: Final total reflects discounted amount

---

## Test Case: Shipping Options Validation

**Test ID**: CHECKOUT-005  
**Priority**: Medium  

**Objective**: Verify different shipping options calculate correctly

**Test Data**:
- Standard Shipping: $5.99 (5-7 days)
- Express Shipping: $12.99 (2-3 days)  
- Overnight Shipping: $24.99 (Next day)

**Steps**:
1. Add items totaling $30 to cart
2. Proceed to checkout
3. Test each shipping option:
   - Select Standard Shipping → Verify total = $35.99
   - Select Express Shipping → Verify total = $42.99
   - Select Overnight Shipping → Verify total = $54.99

---

## Edge Cases

### Test Case: Empty Cart Checkout Prevention
- **Objective**: Verify users cannot checkout with empty cart
- **Steps**: 
  1. Ensure cart is empty
  2. Navigate to checkout URL directly
  3. **Expected**: Redirect to shopping cart with message "Cart is empty"

### Test Case: Session Timeout During Checkout
- **Objective**: Handle session expiration gracefully
- **Steps**:
  1. Start checkout process
  2. Wait for session to expire (30 minutes)
  3. Try to complete order
  4. **Expected**: Login prompt appears, cart contents preserved

## Success Criteria
- All payment methods process correctly
- Order confirmation emails are sent
- Inventory is updated after successful orders
- Failed payments do not create orders
- User data is validated and secure