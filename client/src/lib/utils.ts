import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAge(age: string): string {
  // Convert age strings like "2 years" to a more readable format
  return age;
}

export function formatLocation(location: string): string {
  return location;
}

export function getPetImageUrl(imageUrl: string): string {
  // In a real app, you might want to handle image transformations here
  return imageUrl;
}

export function getDefaultPetImage(petType: string): string {
  // Fallback images for different pet types
  const defaultImages = {
    dog: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    cat: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop",
    rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop",
    bird: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&h=300&fit=crop",
  };
  
  return defaultImages[petType.toLowerCase() as keyof typeof defaultImages] || defaultImages.dog;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateMatchPercentage(score: number): string {
  return `${Math.round(score)}%`;
}
