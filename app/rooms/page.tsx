'use client';

import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/ui/BreadCrumb';
import RoomMakeovers from '@/components/home/RoomMakeovers';
import { ROOMS_STEPS } from '@/constants/navigation';

export default function Rooms() {
  const router = useRouter();

  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto">
        {/* Breadcrumb for navigation */}
        <BreadCrumb items={ROOMS_STEPS} />

        {/* Displaying RoomMakeovers */}
        <RoomMakeovers title = "" subtitle = ""/>
      </div>
    </main>
  );
}