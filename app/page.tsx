'use client';

import Shop from "@/components/Shop";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Shop />
      </div>
    </div>
  );
}
