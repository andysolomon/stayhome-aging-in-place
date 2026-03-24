export type HazardCategory = {
  id: string;
  name: string;
  description: string;
  applicableRoomTypes: string[];
};

export type HazardItem = {
  id: string;
  categoryId: string;
  label: string;
  defaultSeverity: "low" | "medium" | "high";
  description: string;
  applicableRoomTypes: string[];
};

export const HAZARD_CATEGORIES: HazardCategory[] = [
  {
    id: "fall_hazards",
    name: "Fall Hazards",
    description: "Risks that could cause slips, trips, or falls",
    applicableRoomTypes: ["bathroom", "kitchen", "bedroom", "living_room", "stairs_hallways", "entrance_exit", "exterior"],
  },
  {
    id: "fire_safety",
    name: "Fire Safety",
    description: "Fire prevention and detection concerns",
    applicableRoomTypes: ["kitchen", "bedroom", "living_room", "stairs_hallways"],
  },
  {
    id: "accessibility",
    name: "Accessibility",
    description: "Barriers to safe movement and daily activities",
    applicableRoomTypes: ["bathroom", "kitchen", "bedroom", "living_room", "stairs_hallways", "entrance_exit"],
  },
  {
    id: "lighting",
    name: "Lighting",
    description: "Inadequate or hazardous lighting conditions",
    applicableRoomTypes: ["bathroom", "kitchen", "bedroom", "living_room", "stairs_hallways", "entrance_exit", "exterior"],
  },
  {
    id: "bathroom_safety",
    name: "Bathroom Safety",
    description: "Bathroom-specific safety concerns",
    applicableRoomTypes: ["bathroom"],
  },
  {
    id: "kitchen_safety",
    name: "Kitchen Safety",
    description: "Kitchen-specific hazards and accessibility issues",
    applicableRoomTypes: ["kitchen"],
  },
  {
    id: "exterior_hazards",
    name: "Exterior Hazards",
    description: "Outdoor safety risks around the property",
    applicableRoomTypes: ["exterior", "entrance_exit"],
  },
];

export const HAZARD_ITEMS: HazardItem[] = [
  // Fall Hazards
  { id: "loose_rugs", categoryId: "fall_hazards", label: "Loose or unsecured rugs", defaultSeverity: "high", description: "Rugs without non-slip backing that could cause slips", applicableRoomTypes: ["bathroom", "kitchen", "bedroom", "living_room", "entrance_exit"] },
  { id: "cluttered_pathways", categoryId: "fall_hazards", label: "Cluttered walking pathways", defaultSeverity: "medium", description: "Objects obstructing main walking paths", applicableRoomTypes: ["bathroom", "kitchen", "bedroom", "living_room", "stairs_hallways", "entrance_exit"] },
  { id: "uneven_flooring", categoryId: "fall_hazards", label: "Uneven or damaged flooring", defaultSeverity: "high", description: "Floor surfaces with cracks, bumps, or level changes", applicableRoomTypes: ["bathroom", "kitchen", "bedroom", "living_room", "stairs_hallways", "entrance_exit", "exterior"] },
  { id: "missing_handrails", categoryId: "fall_hazards", label: "Missing or loose handrails", defaultSeverity: "high", description: "Stairs or steps without secure handrails", applicableRoomTypes: ["stairs_hallways", "entrance_exit", "exterior"] },
  { id: "slippery_surfaces", categoryId: "fall_hazards", label: "Slippery floor surfaces", defaultSeverity: "high", description: "Smooth or wet surfaces without non-slip treatment", applicableRoomTypes: ["bathroom", "kitchen", "entrance_exit", "exterior"] },
  { id: "exposed_cords", categoryId: "fall_hazards", label: "Exposed electrical cords", defaultSeverity: "medium", description: "Cords crossing walkways that could cause tripping", applicableRoomTypes: ["bedroom", "living_room", "kitchen"] },

  // Fire Safety
  { id: "no_smoke_detector", categoryId: "fire_safety", label: "Missing smoke detector", defaultSeverity: "high", description: "Room lacks a working smoke detector", applicableRoomTypes: ["kitchen", "bedroom", "living_room", "stairs_hallways"] },
  { id: "blocked_exits", categoryId: "fire_safety", label: "Blocked emergency exits", defaultSeverity: "high", description: "Furniture or objects blocking exit paths", applicableRoomTypes: ["bedroom", "living_room", "stairs_hallways"] },
  { id: "overloaded_outlets", categoryId: "fire_safety", label: "Overloaded electrical outlets", defaultSeverity: "medium", description: "Too many devices plugged into one outlet or power strip", applicableRoomTypes: ["kitchen", "bedroom", "living_room"] },
  { id: "flammable_near_heat", categoryId: "fire_safety", label: "Flammable items near heat sources", defaultSeverity: "high", description: "Curtains, towels, or paper near stoves or heaters", applicableRoomTypes: ["kitchen", "bedroom", "living_room"] },
  { id: "no_fire_extinguisher", categoryId: "fire_safety", label: "No fire extinguisher accessible", defaultSeverity: "medium", description: "Kitchen lacks an easily reachable fire extinguisher", applicableRoomTypes: ["kitchen"] },

  // Accessibility
  { id: "narrow_doorways", categoryId: "accessibility", label: "Narrow doorways", defaultSeverity: "medium", description: "Doorways too narrow for walkers or wheelchairs", applicableRoomTypes: ["bathroom", "kitchen", "bedroom", "living_room"] },
  { id: "high_thresholds", categoryId: "accessibility", label: "High door thresholds", defaultSeverity: "medium", description: "Raised thresholds that could cause tripping", applicableRoomTypes: ["bathroom", "kitchen", "bedroom", "entrance_exit"] },
  { id: "hard_to_reach_items", categoryId: "accessibility", label: "Frequently used items out of reach", defaultSeverity: "low", description: "Daily items stored too high or too low", applicableRoomTypes: ["kitchen", "bathroom", "bedroom"] },
  { id: "no_seated_option", categoryId: "accessibility", label: "No seated option for tasks", defaultSeverity: "low", description: "No stool or chair for activities like cooking or grooming", applicableRoomTypes: ["kitchen", "bathroom"] },

  // Lighting
  { id: "dim_lighting", categoryId: "lighting", label: "Inadequate lighting", defaultSeverity: "medium", description: "Room is poorly lit, especially walkways and stairs", applicableRoomTypes: ["bathroom", "kitchen", "bedroom", "living_room", "stairs_hallways", "entrance_exit", "exterior"] },
  { id: "no_nightlight", categoryId: "lighting", label: "No nightlight in pathway", defaultSeverity: "medium", description: "No illumination for nighttime bathroom trips", applicableRoomTypes: ["bedroom", "bathroom", "stairs_hallways"] },
  { id: "hard_to_reach_switches", categoryId: "lighting", label: "Light switches hard to reach", defaultSeverity: "low", description: "Switches not at accessible height or location", applicableRoomTypes: ["bathroom", "kitchen", "bedroom", "living_room", "stairs_hallways", "entrance_exit"] },

  // Bathroom Safety
  { id: "no_grab_bars", categoryId: "bathroom_safety", label: "Missing grab bars", defaultSeverity: "high", description: "No grab bars near toilet, shower, or bathtub", applicableRoomTypes: ["bathroom"] },
  { id: "no_nonslip_mat", categoryId: "bathroom_safety", label: "No non-slip bath mat", defaultSeverity: "high", description: "Tub or shower floor lacks non-slip surface", applicableRoomTypes: ["bathroom"] },
  { id: "high_tub_entry", categoryId: "bathroom_safety", label: "High bathtub entry", defaultSeverity: "medium", description: "Bathtub requires high step-over to enter", applicableRoomTypes: ["bathroom"] },
  { id: "no_shower_seat", categoryId: "bathroom_safety", label: "No shower seat available", defaultSeverity: "medium", description: "No seat for sitting while showering", applicableRoomTypes: ["bathroom"] },
  { id: "hot_water_risk", categoryId: "bathroom_safety", label: "Hot water scald risk", defaultSeverity: "medium", description: "Water heater set above 120°F / no anti-scald valve", applicableRoomTypes: ["bathroom"] },

  // Kitchen Safety
  { id: "stove_knob_access", categoryId: "kitchen_safety", label: "Stove knobs easily bumped", defaultSeverity: "medium", description: "Front-mounted stove knobs that could be accidentally turned on", applicableRoomTypes: ["kitchen"] },
  { id: "no_auto_shutoff", categoryId: "kitchen_safety", label: "No auto-shutoff on appliances", defaultSeverity: "medium", description: "Stove or oven lacks automatic shutoff feature", applicableRoomTypes: ["kitchen"] },
  { id: "heavy_items_high", categoryId: "kitchen_safety", label: "Heavy items stored on high shelves", defaultSeverity: "medium", description: "Heavy pots or dishes stored above shoulder height", applicableRoomTypes: ["kitchen"] },
  { id: "sharp_objects_accessible", categoryId: "kitchen_safety", label: "Sharp objects unsecured", defaultSeverity: "low", description: "Knives or sharp tools not in a secure block or drawer", applicableRoomTypes: ["kitchen"] },

  // Exterior Hazards
  { id: "uneven_walkway", categoryId: "exterior_hazards", label: "Uneven outdoor walkway", defaultSeverity: "high", description: "Cracked, heaved, or uneven paths outside the home", applicableRoomTypes: ["exterior", "entrance_exit"] },
  { id: "poor_outdoor_lighting", categoryId: "exterior_hazards", label: "Poor outdoor lighting", defaultSeverity: "medium", description: "Entry, walkways, or steps poorly lit at night", applicableRoomTypes: ["exterior", "entrance_exit"] },
  { id: "no_outdoor_handrail", categoryId: "exterior_hazards", label: "Missing outdoor handrails", defaultSeverity: "high", description: "Exterior steps or ramps without handrails", applicableRoomTypes: ["exterior", "entrance_exit"] },
  { id: "overgrown_vegetation", categoryId: "exterior_hazards", label: "Overgrown vegetation on paths", defaultSeverity: "low", description: "Plants or bushes encroaching on walkways", applicableRoomTypes: ["exterior"] },
  { id: "no_secure_entry", categoryId: "exterior_hazards", label: "Unsecured entry door", defaultSeverity: "medium", description: "Entry door lacks deadbolt or peephole", applicableRoomTypes: ["entrance_exit"] },
];

/**
 * Get hazard items applicable to a specific room type.
 */
export function getHazardItemsForRoom(roomCategory: string): HazardItem[] {
  return HAZARD_ITEMS.filter((item) =>
    item.applicableRoomTypes.includes(roomCategory)
  );
}

/**
 * Get hazard categories applicable to a specific room type.
 */
export function getHazardCategoriesForRoom(roomCategory: string): HazardCategory[] {
  return HAZARD_CATEGORIES.filter((cat) =>
    cat.applicableRoomTypes.includes(roomCategory)
  );
}

/**
 * Look up a hazard item by ID.
 */
export function getHazardItemById(id: string): HazardItem | undefined {
  return HAZARD_ITEMS.find((item) => item.id === id);
}
