interface InviteData {
  name: string;
  email: string;
  company?: string;
  role: string;
  createdAt: string;
}

export async function sendToGoogleSheets(data: InviteData): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending to Google Sheets webhook:', error);
      return false;
    }
  }

  console.warn('Google Sheets webhook URL not configured');
  return true;
}
