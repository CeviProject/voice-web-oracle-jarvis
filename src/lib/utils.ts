
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add ripple animation CSS keyframes
const style = document.createElement('style');
style.textContent = `
@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 1.5s ease-out infinite;
}
`;
document.head.appendChild(style);
