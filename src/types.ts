/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PosterFields, TemplateKey, ThemeKey } from './lib/posterComposer';

export type LocationType = 'abri' | 'digital';

export interface LocationSpecs {
  formats: string[];
  maxTextDensity: string;
  restrictions: string[];
  deadline: string;
}

export interface LocationCoordinates {
  x: number; // percentage X on our custom mock map
  y: number; // percentage Y on our custom mock map
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  street: string;
  city: string;
  neighborhood: string;
  reach: number; // weekly reach
  price: number; // price per week
  image: string; // URL or background style
  description: string;
  dimensions: string;
  visibility: string;
  environment: string;
  specs: LocationSpecs;
  coordinates: LocationCoordinates;
  recommendedFor: string[]; // matching tags: "studenten", "forensen", "gezinnen", "sportievelingen", "zakelijk"
}

export interface TargetRegion {
  type: 'postcode' | 'provincie' | 'land';
  postcode?: string;
  radius?: number;
  province?: string;
}

export interface IntakeAnswers {
  businessType: string;
  targetAudience: string;
  region: TargetRegion;
  budget: number;
}

export interface CartItem {
  location: Location;
  weeks: number;
  creative?: {
    type: 'upload' | 'ai-generated' | 'verified';
    fileName?: string;
    previewUrl?: string; // CSS poster design or image
    promptText?: string;
    verifiedOk?: boolean;
    title?: string;
    subtitle?: string;
    textColor?: string;
    styleName?: string;
    align?: 'left' | 'center' | 'right';
    titleScale?: number;
    badgeText?: string;
    // Editable poster design (AI-generated creatives) — lets the cart re-open the
    // real template composer and live-edit, then re-export the PNG previewUrl.
    poster?: {
      fields: PosterFields;
      template: TemplateKey;
      theme: ThemeKey;
      photoUrl: string | null;
    };
  };
}
