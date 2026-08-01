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

    const apiKey = process.env.RESEND_API_KEY || config.email_resend_api;
    if (!apiKey) {
      console.warn('⚠️ Email configuration missing. Email not sent to:', to);
      return { success: false, error: 'Email configuration missing' };
    }

    const resend = new Resend(apiKey);
    const defaultSender = process.env.NODE_ENV === 'development' ? 'onboarding@resend.dev' : 'no-reply@troveseek.com';
    const senderAddress = config.email_sender_address || process.env.RESEND_SENDER_EMAIL || defaultSender;
    
    const sender = config.email_sender_name 
      ? `${config.email_sender_name} <${senderAddress}>` 
      : senderAddress;

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
