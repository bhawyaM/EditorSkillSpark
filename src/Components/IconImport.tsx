// import * as Icons from "lucide-react";
// import type { ForwardRefExoticComponent, RefAttributes } from "react";
// import type { LucideProps } from "lucide-react";

// export type IconImportProps = {
//   name: string;
//   size?: number;
//   color?: string;
//   fill?: string;
// };

// function levenshtein(a: string, b: string): number {
//   const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
//     Array(b.length + 1).fill(0)
//   );
//   for (let i = 0; i <= a.length; i++) dp[i][0] = i;
//   for (let j = 0; j <= b.length; j++) dp[0][j] = j;
//   for (let i = 1; i <= a.length; i++) {
//     for (let j = 1; j <= b.length; j++) {
//       if (a[i - 1] === b[j - 1]) {
//         dp[i][j] = dp[i - 1][j - 1];
//       } else {
//         dp[i][j] = Math.min(
//           dp[i - 1][j - 1] + 1,
//           dp[i - 1][j] + 1,
//           dp[i][j - 1] + 1
//         );
//       }
//     }
//   }
//   return dp[a.length][b.length];
// }

// export const IconImport: React.FC<IconImportProps> = ({
//   name,
//   size = 24,
//   color = "currentColor",
//   fill = "none",
// }) => {
//   // Defensive: only use valid string names
//   if (typeof name !== "string" || !name.trim()) {
//     console.log(name)
//     console.warn("IconImport: Invalid icon name");
//     return null;
//   }
//     console.log(name)
//   // Only keep PascalCase keys (all Lucide icons follow this convention)
//   const entries = Object.entries(Icons).filter(([key]) => /^[A-Z]/.test(key));

//   if (entries.length === 0) {
//     console.warn("IconImport: No Lucide icons available!");
//     return null;
//   }
//   // Find closest match by Levenshtein distance
//   let closest: string | null = null;
//   let minDistance = Infinity;

//   for (const [iconName] of entries) {
//     const distance = levenshtein(name.toLowerCase(), iconName.toLowerCase());
//     if (distance < minDistance) {
//       minDistance = distance;
//       closest = iconName;
//     }
//   }

//   if (!closest) {
//     console.warn(`IconImport: Could not find a match for "${name}"`);
//     return null;
//   }

//   const LucideIcon =
//     Icons[closest as keyof typeof Icons] as ForwardRefExoticComponent<
//       Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
//     >;

//   if (!LucideIcon) {
//     console.warn(`IconImport: "${closest}" is not a valid Lucide icon`);
//     return null;
//   }

//   return <LucideIcon size={size} color={color} fill={fill} />;
// };

import * as Icons from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";
import { useMemo } from "react";

export type IconImportProps = {
  name: string;
  size?: number;
  color?: string;
  fill?: string;
};

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }
  return dp[a.length][b.length];
}

// Common icon name mappings to prevent confusion
const ICON_MAPPINGS: Record<string, string> = {
  rectangle: "RectangleHorizontal",
  rect: "RectangleHorizontal",
  square: "Square",
  circle: "Circle",
  triangle: "Triangle",
  bed: "Bed",
  "single-bed": "BedSingle",
  home: "Home",
  house: "Home",
  user: "User",
  person: "User",
  // Add more mappings as needed
};

// Normalize icon name to PascalCase
function toPascalCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export const IconImport: React.FC<IconImportProps> = ({
  name,
  size = 24,
  color = "none",
  fill = "none",
}) => {
  // Memoize the icon resolution to prevent re-computation on every render
  const resolvedIcon = useMemo(() => {
    // Defensive: only use valid string names
    if (typeof name !== "string" || !name.trim()) {
      console.warn("IconImport: Invalid icon name");
      return null;
    }

    // Only keep PascalCase keys (all Lucide icons follow this convention)
    const entries = Object.entries(Icons).filter(([key]) => /^[A-Z]/.test(key));

    if (entries.length === 0) {
      console.warn("IconImport: No Lucide icons available!");
      return null;
    }

    // Normalize input to PascalCase
    const normalizedInput = toPascalCase(name.trim());
    
    // Check explicit mappings first
    const mappingKey = name.toLowerCase().trim();
    if (ICON_MAPPINGS[mappingKey]) {
      const mappedIcon = ICON_MAPPINGS[mappingKey];
      if (Icons[mappedIcon as keyof typeof Icons]) {
        return {
          component: Icons[mappedIcon as keyof typeof Icons] as ForwardRefExoticComponent<
            Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
          >,
          resolvedName: mappedIcon,
          method: "mapping"
        };
      }
    }
    
    // First, try exact match
    for (const [iconName] of entries) {
      if (iconName.toLowerCase() === normalizedInput.toLowerCase()) {
        return {
          component: Icons[iconName as keyof typeof Icons] as ForwardRefExoticComponent<
            Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
          >,
          resolvedName: iconName,
          method: "exact"
        };
      }
    }

    // Then try starts-with match
    for (const [iconName] of entries) {
      if (iconName.toLowerCase().startsWith(normalizedInput.toLowerCase()) ||
          normalizedInput.toLowerCase().startsWith(iconName.toLowerCase())) {
        return {
          component: Icons[iconName as keyof typeof Icons] as ForwardRefExoticComponent<
            Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
          >,
          resolvedName: iconName,
          method: "starts-with"
        };
      }
    }

    // Finally, fall back to Levenshtein distance with better scoring
    let closest: string | null = null;
    let minDistance = Infinity;

    for (const [iconName] of entries) {
      const distance = levenshtein(normalizedInput.toLowerCase(), iconName.toLowerCase());
      
      // Penalize matches that are very different in length
      const lengthDiff = Math.abs(normalizedInput.length - iconName.length);
      const adjustedDistance = distance + (lengthDiff * 0.3);
      
      // Bonus for substring matches
      const bonus = iconName.toLowerCase().includes(normalizedInput.toLowerCase()) ||
                    normalizedInput.toLowerCase().includes(iconName.toLowerCase()) ? -0.5 : 0;
      
      const finalScore = adjustedDistance + bonus;
      
      if (finalScore < minDistance) {
        minDistance = finalScore;
        closest = iconName;
      }
    }

    if (!closest) {
      console.warn(`IconImport: Could not find a match for "${name}"`);
      return null;
    }

    const component = Icons[closest as keyof typeof Icons] as ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;

    if (!component) {
      console.warn(`IconImport: "${closest}" is not a valid Lucide icon`);
      return null;
    }

    return {
      component,
      resolvedName: closest,
      method: "levenshtein"
    };
  }, [name]);

  // Only log once when the icon is resolved, not on every render
  useMemo(() => {
    if (resolvedIcon) {
      console.log(`IconImport: Resolved "${name}" to "${resolvedIcon.resolvedName}" via ${resolvedIcon.method}`);
    }
  }, [resolvedIcon, name]);

  if (!resolvedIcon) {
    return null;
  }

  const { component: LucideIcon } = resolvedIcon;
  return <LucideIcon size={size} color={color} fill={fill} />;
};