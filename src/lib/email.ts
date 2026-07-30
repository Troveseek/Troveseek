import { Resend } from 'resend';
import db from './db';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['email_resend_api', 'email_sender_name', 'email_sender_address'] } }
    });

    const config = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);

    if (!config.email_resend_api || !config.email_sender_address) {
      console.warn('⚠️ Email configuration missing in admin settings. Email not sent to:', to);
      return { success: false, error: 'Email configuration missing' };
    }

    const resend = new Resend(config.email_resend_api);
    const sender = config.email_sender_name 
      ? `${config.email_sender_name} <${config.email_sender_address}>` 
      : config.email_sender_address;

    const data = await resend.emails.send({
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    });

    if (data.error) {
      console.error('Resend API Error:', data.error);
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
