import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const path = require('path');

export default {
  // other config...
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // make @ point to /src
    },
  },
};
