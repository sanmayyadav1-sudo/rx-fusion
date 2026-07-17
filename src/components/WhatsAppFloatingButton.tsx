"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function WhatsAppFloatingButton() {
  const pathname = usePathname();

  // Hide the floating WhatsApp contact button on admin pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/rx-admin-access")) {
    return null;
  }

  const phoneNumber = "919060005771";
  const message = "Hello RxFusion 👋\n\nI am visiting the RxFusion website and I have a query. Please help me.\n\nThank you.";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact RxFusion on WhatsApp"
      title="Contact RxFusion on WhatsApp"
      className="fixed bottom-[20px] right-[16px] md:bottom-[24px] md:right-[24px] z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center rounded-full shadow-lg hover:shadow-xl motion-safe:hover:scale-105 motion-safe:active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 w-[52px] h-[52px] md:w-[60px] md:h-[60px] cursor-pointer"
    >
      <svg
        className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] fill-current"
        viewBox="0 0 24 24"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.63 1.977 14.154.952 11.53.951c-5.444 0-9.87 4.372-9.874 9.802-.001 1.73.463 3.42 1.343 4.927l-.958 3.5 3.6-.94c1.514.826 3.1 1.258 4.675 1.258h.023zm10.963-7.477c-.3-.15-1.77-.875-2.046-.975-.276-.1-.477-.15-.677.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-3.04-1.52-4.004-2.61-4.74-3.885-.196-.34-.02-.52.15-.69.15-.15.3-.35.45-.53.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.677-1.625-.926-2.225-.244-.589-.493-.51-.677-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.025 2.9 1.175 3.1c.15.2 2.021 3.085 4.897 4.33.685.297 1.22.474 1.637.607.69.219 1.317.188 1.812.114.55-.082 1.77-.725 2.02-1.425.25-.7.25-1.3 1.75-1.4.075-.1.225-.25.075-.4z" />
      </svg>
    </a>
  );
}
