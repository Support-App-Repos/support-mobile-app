# Feature Requirements

This document outlines all features to be implemented. **DO NOT IMPLEMENT YET** - waiting for screen designs.

## Profile Features

### Profile View
- User profile display screen
- Show user information
- Profile editing capabilities

### Help & Support
- Help and support section
- FAQ or support contact options

### Sign Out Button
- Logout functionality (already implemented in HomeScreen)
- May need to move to Profile screen

---

## Browsing Features

### Home Feed
- Main feed/home screen
- Display listings in feed format

### Category Tabs
- Tab navigation for categories:
  - All
  - Property
  - Event
  - Product
  - Service

### Listing Cards
- Card component for displaying listings
- Show listing preview information
- Clickable to navigate to detail pages

### Detail Pages
- **Product Detail Page** - Full product information
- **Property Detail Page** - Full property information
- **Event Detail Page** - Full event information
- (Service Detail Page - implied but not explicitly mentioned)

---

## Listings Management

### Create Listings
- **Create Product Listing** - Form to create product listing
- **Create Property Listing** - Form to create property listing
- **Create Service Listing** - Form to create service listing
- **Create Event Listing** - Form to create event listing

### Listing Features
- **Upload Photos** - Support up to 6 photos per listing
- **Region Selection** - Location/region picker for listings
- **Edit Listing** - Edit existing listings
- **Delete Listing** - Delete existing listings

---

## Payments

### Pay-Per-Listing Payment
- Payment flow for listing creation
- One-time payment per listing

### Price Breakdown
- Display pricing details
- Show cost breakdown before payment

### Payment Success Screen
- Confirmation screen after successful payment
- Show payment details

---

## Seller Tools

### My Listings Dashboard
- Dashboard for sellers to manage their listings
- View all their created listings
- Quick actions (edit/delete/view)

---

## Messaging

### Contact Seller Button
- Button on listing detail pages
- Initiate contact/messaging with seller
- Messaging interface/chat functionality

---

## Implementation Notes

- **Backend Integration Required**: All features need corresponding backend APIs
- **Screen Designs**: Will be provided later - implement according to designs
- **Current Status**: Requirements documented, awaiting designs before implementation

---

## Backend API Endpoints Needed

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/help-support` - Get help content

### Listings
- `GET /api/listings` - Get all listings (with category filters)
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `POST /api/listings/:id/upload-photos` - Upload photos

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/:id` - Get payment details

### Seller Tools
- `GET /api/seller/listings` - Get seller's listings
- `GET /api/seller/dashboard` - Get seller dashboard stats

### Messaging
- `POST /api/messaging/contact` - Contact seller
- `GET /api/messaging/conversations` - Get conversations
- `POST /api/messaging/messages` - Send message
- `GET /api/messaging/conversations/:id/messages` - Get messages

---

## File Structure (To Be Created)

```
src/
  screens/
    Profile/
      ProfileScreen.tsx
      HelpSupportScreen.tsx
    Browse/
      HomeFeedScreen.tsx
      ProductDetailScreen.tsx
      PropertyDetailScreen.tsx
      EventDetailScreen.tsx
      ServiceDetailScreen.tsx
    Listings/
      CreateProductScreen.tsx
      CreatePropertyScreen.tsx
      CreateServiceScreen.tsx
      CreateEventScreen.tsx
      EditListingScreen.tsx
    Payments/
      PaymentScreen.tsx
      PaymentSuccessScreen.tsx
    Seller/
      MyListingsDashboardScreen.tsx
    Messaging/
      ContactSellerScreen.tsx
      ChatScreen.tsx
  components/
    listings/
      ListingCard.tsx
      CategoryTabs.tsx
      PhotoUploader.tsx
      RegionSelector.tsx
    payments/
      PriceBreakdown.tsx
  services/
    listingService.ts
    paymentService.ts
    messagingService.ts
    profileService.ts
```

---

**Status**: Requirements documented. Awaiting screen designs before implementation.



