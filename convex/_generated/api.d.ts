/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_analyzePhoto from "../ai/analyzePhoto.js";
import type * as ai_generatePdf from "../ai/generatePdf.js";
import type * as assessmentHazards from "../assessmentHazards.js";
import type * as assessmentPhotos from "../assessmentPhotos.js";
import type * as assessments from "../assessments.js";
import type * as contractors from "../contractors.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_entitlements from "../lib/entitlements.js";
import type * as lib_hazardTaxonomy from "../lib/hazardTaxonomy.js";
import type * as lib_riskScoring from "../lib/riskScoring.js";
import type * as properties from "../properties.js";
import type * as quoteRequests from "../quoteRequests.js";
import type * as rooms from "../rooms.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/analyzePhoto": typeof ai_analyzePhoto;
  "ai/generatePdf": typeof ai_generatePdf;
  assessmentHazards: typeof assessmentHazards;
  assessmentPhotos: typeof assessmentPhotos;
  assessments: typeof assessments;
  contractors: typeof contractors;
  health: typeof health;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/entitlements": typeof lib_entitlements;
  "lib/hazardTaxonomy": typeof lib_hazardTaxonomy;
  "lib/riskScoring": typeof lib_riskScoring;
  properties: typeof properties;
  quoteRequests: typeof quoteRequests;
  rooms: typeof rooms;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
