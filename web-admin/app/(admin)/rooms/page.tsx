import { redirect } from 'next/navigation';

async function getFirstBuildingId() {
  try {
    const res = await fetch('http://localhost:4000/buildings', { cache: 'no-store' });
    if (!res.ok) return null;
    const buildings = await res.json();
    if (Array.isArray(buildings) && buildings.length > 0) {
      return buildings[0].id;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default async function RoomsRedirect() {
  const firstBuildingId = await getFirstBuildingId();
  
  if (firstBuildingId) {
    redirect(`/buildings/${firstBuildingId}/rooms`);
  } else {
    redirect('/buildings');
  }
}
