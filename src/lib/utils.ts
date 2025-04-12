
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add improved ripple animation CSS keyframes
const style = document.createElement('style');
style.textContent = `
@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 5px 0 rgba(0, 201, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(0, 201, 255, 0.6);
  }
  100% {
    box-shadow: 0 0 5px 0 rgba(0, 201, 255, 0.4);
  }
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes typing {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}

.typing-indicator span {
  animation: typing 1.5s infinite;
  display: inline-block;
  margin-right: 2px;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.3s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.6s;
}
`;
document.head.appendChild(style);
