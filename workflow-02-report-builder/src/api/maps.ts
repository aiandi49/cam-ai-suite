export async function getGoogleMapsLink(address: string): Promise<string> {
  const encoded = encodeURIComponent(address + ', Tucson, AZ');
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

export async function getStaticMapUrl(lat: number, lng: number): Promise<string> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&markers=${lat},${lng}&key=${key}`;
}
