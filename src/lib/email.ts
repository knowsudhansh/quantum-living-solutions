import { logger } from './utils/logger';
import { BUSINESS_CONTACT, PRIVATE_SITE_VISIT } from './config/business';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = `Quantum Living Solutions <${BUSINESS_CONTACT.supportEmail}>`;
const ADMIN_EMAIL = BUSINESS_CONTACT.ownerEmail;

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = FROM_EMAIL }: SendMailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    logger.info(`[Email Service Mockup] Email would be sent to: ${to} | Subject: "${subject}"`);
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      logger.error(`Resend API Error: Status ${res.status} - ${errorText}`);
      return false;
    }

    const data = await res.json() as { id?: string };
    logger.info(`Email successfully dispatched via Resend. Message ID: ${data.id || 'N/A'}`);
    return true;
  } catch (err) {
    logger.error('Resend dispatch failed with exception', err instanceof Error ? err : new Error(String(err)));
    return false;
  }
}

export async function notifyAdminOfContact(name: string, email: string, phone: string, interest: string, message: string) {
  const html = `
    <h2>New Contact Inquiry Received</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Interest:</strong> ${interest}</p>
    <p><strong>Message:</strong> ${message}</p>
    <hr />
    <p><em>Sent automatically from the Quantum Living Solutions Portal.</em></p>
  `;
  return sendEmail({ to: ADMIN_EMAIL, subject: `New Inquiry: ${name} - ${interest}`, html });
}

export async function sendContactAutoReply(name: string, email: string) {
  const html = `
    <p>Dear ${name},</p>
    <p>Thank you for reaching out to Quantum Living Solutions. We have received your inquiry regarding our smart automation systems and our team will get in touch with you shortly.</p>
    <p>If you have any urgent details to add, feel free to reply to this email or connect with us on WhatsApp.</p>
    <br />
    <p>Best regards,</p>
    <p><strong>Raj Kumar Sharma</strong><br />Founder, Quantum Living Solutions</p>
  `;
  return sendEmail({ to: email, subject: 'We have received your inquiry - Quantum Living Solutions', html });
}

interface PrivateSiteVisitDetails {
  automationCategory: string;
  automationSelections: string[];
  creativeRequirement: string | null;
  location: string;
}

export async function notifyAdminOfDemo(name: string, email: string, phone: string, slotTime: string, details: PrivateSiteVisitDetails) {
  const requirement = details.creativeRequirement || details.automationSelections.join(', ');
  const html = `
    <h2>New Private Site Visit Request</h2>
    <p><strong>Customer Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Site Location:</strong> ${details.location}</p>
    <p><strong>Automation Category:</strong> ${details.automationCategory}</p>
    <p><strong>Requirement:</strong> ${requirement}</p>
    <p><strong>Requested Visit Slot:</strong> ${slotTime}</p>
    <p><strong>Visit Charge:</strong> ${PRIVATE_SITE_VISIT.priceLabel}</p>
    <hr />
    <p><em>Review schedule details in the admin dashboard portal.</em></p>
  `;
  return sendEmail({ to: ADMIN_EMAIL, subject: `Private Site Visit Request: ${name}`, html });
}

export async function sendDemoAutoReply(name: string, email: string, slotTime: string) {
  const html = `
    <p>Dear ${name},</p>
    <p>Your private site visit is scheduled for: <strong>${slotTime}</strong>.</p>
    <p>The visit charge is <strong>${PRIVATE_SITE_VISIT.priceLabel}</strong>. ${PRIVATE_SITE_VISIT.adjustmentNote}</p>
    <p>If you need to make changes or reschedule, please contact us at least 24 hours in advance at ${BUSINESS_CONTACT.supportEmail}.</p>
    <br />
    <p>We look forward to welcoming you to the smart space experience.</p>
    <p>Best regards,</p>
    <p><strong>Quantum Living Solutions Team</strong></p>
  `;
  return sendEmail({ to: email, subject: 'Private Site Visit Confirmed - Quantum Living Solutions', html });
}

export async function notifyAdminOfCareer(name: string, email: string, phone: string, role: string, message?: string, resumeUrl?: string) {
  const html = `
    <h2>New Career Candidate Application</h2>
    <p><strong>Applicant Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Target Position:</strong> ${role}</p>
    <p><strong>Cover message:</strong> ${message || 'None'}</p>
    <p><strong>Resume Attachment Path:</strong> <a href="${resumeUrl || '#'}">${resumeUrl || 'Not provided'}</a></p>
    <hr />
  `;
  return sendEmail({ to: ADMIN_EMAIL, subject: `Career Application Intake: ${name} (${role})`, html });
}
