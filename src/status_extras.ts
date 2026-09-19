// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Pre-configured dental status presets for quick application of common
 * restorative scenarios (bridges, full-arch, partial/full removable, bar dentures).
 *
 * `arches` defines the FDI tooth layout; `options` is the array of presets
 * selectable from the "Extras" dropdown in the UI.
 */
export const STATUS_EXTRAS = {
  arches: {
    upper: [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28],
    lower: [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
    wisdom: {
      upper: [18,28],
      lower: [48,38],
    },
  },
  options: [
    { id: "upper-12-22-zircon", labelKey: "statusExtras.upper12_22Zircon", type: "span", teeth: [12,11,21,22], material: "zircon" },
    { id: "upper-13-23-zircon", labelKey: "statusExtras.upper13_23Zircon", type: "span", teeth: [13,12,11,21,22,23], material: "zircon" },
    { id: "upper-16-26-zircon", labelKey: "statusExtras.upper16_26Zircon", type: "span", teeth: [16,15,14,13,12,11,21,22,23,24,25,26], material: "zircon" },
    { id: "upper-full-zircon", labelKey: "statusExtras.upperFullZircon", type: "arch-bridge", arch: "upper", material: "zircon", missingMaterial: "zircon" },
    { id: "upper-12-22-metal", labelKey: "statusExtras.upper12_22Metal", type: "span", teeth: [12,11,21,22], material: "metal" },
    { id: "upper-13-23-metal", labelKey: "statusExtras.upper13_23Metal", type: "span", teeth: [13,12,11,21,22,23], material: "metal" },
    { id: "upper-16-26-metal", labelKey: "statusExtras.upper16_26Metal", type: "span", teeth: [16,15,14,13,12,11,21,22,23,24,25,26], material: "metal" },
    { id: "upper-full-metal", labelKey: "statusExtras.upperFullMetal", type: "arch-bridge", arch: "upper", material: "metal", missingMaterial: "metal" },
    { id: "upper-partial-removable", labelKey: "statusExtras.upperPartialRemovable", type: "partial-removable", arch: "upper" },
    { id: "upper-full-removable", labelKey: "statusExtras.upperFullRemovable", type: "full-removable", arch: "upper" },
    { id: "upper-bar-denture", labelKey: "statusExtras.upperBarDenture", type: "bar-denture", arch: "upper", implants: [14,12,22,24], missing: [16,15,13,11,21,23,25,26] },

    { id: "lower-42-32-zircon", labelKey: "statusExtras.lower42_32Zircon", type: "span", teeth: [42,41,31,32], material: "zircon" },
    { id: "lower-43-33-zircon", labelKey: "statusExtras.lower43_33Zircon", type: "span", teeth: [43,42,41,31,32,33], material: "zircon" },
    { id: "lower-46-36-zircon", labelKey: "statusExtras.lower46_36Zircon", type: "span", teeth: [46,45,44,43,42,41,31,32,33,34,35,36], material: "zircon" },
    { id: "lower-full-zircon", labelKey: "statusExtras.lowerFullZircon", type: "arch-bridge", arch: "lower", material: "zircon", missingMaterial: "zircon" },
    { id: "lower-42-32-metal", labelKey: "statusExtras.lower42_32Metal", type: "span", teeth: [42,41,31,32], material: "metal" },
    { id: "lower-43-33-metal", labelKey: "statusExtras.lower43_33Metal", type: "span", teeth: [43,42,41,31,32,33], material: "metal" },
    { id: "lower-46-36-metal", labelKey: "statusExtras.lower46_36Metal", type: "span", teeth: [46,45,44,43,42,41,31,32,33,34,35,36], material: "metal" },
    { id: "lower-full-metal", labelKey: "statusExtras.lowerFullMetal", type: "arch-bridge", arch: "lower", material: "metal", missingMaterial: "metal" },
    { id: "lower-partial-removable", labelKey: "statusExtras.lowerPartialRemovable", type: "partial-removable", arch: "lower" },
    { id: "lower-full-removable", labelKey: "statusExtras.lowerFullRemovable", type: "full-removable", arch: "lower" },
    { id: "lower-bar-denture", labelKey: "statusExtras.lowerBarDenture", type: "bar-denture", arch: "lower", implants: [44,42,32,34], missing: [46,45,43,41,31,33,35,36] },
  ],
};
