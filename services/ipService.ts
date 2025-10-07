
export async function getIPAddress(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) {
      throw new Error('Layanan IP tidak merespon dengan benar.');
    }
    const data = await response.json();
    if (!data.ip) {
      throw new Error('Respon tidak valid dari layanan IP.');
    }
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    throw error; // Re-throw for the UI to handle
  }
}
