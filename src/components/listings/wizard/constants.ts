/** Shared create-flow steps across Product, Event, Service, and Property. */
export const LISTING_FORM_STEPS = ['Details', 'Payment', 'Select Region', 'Confirm'] as const;

export type ListingFormStep = (typeof LISTING_FORM_STEPS)[number];
