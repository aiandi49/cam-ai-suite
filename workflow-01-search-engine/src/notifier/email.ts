import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { Client, Property } from '../../../shared/types/index';

const OAuth2 = google.auth.OAuth2;

async function getTransporter() {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  const { token } = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_FROM_ADDRESS,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: token as string,
    },
  });
}

export async function sendEmailAlert(
  client: Client,
  allProperties: Property[],
  newProperties: Property[]
): Promise<void> {
  const templatePath = path.join(__dirname, 'templates', 'daily-alert.html');
  const templateSrc = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSrc);

  const html = template({
    clientName: client.name,
    newCount: newProperties.length,
    totalCount: allProperties.length,
    newProperties,
    allProperties,
    brokerName: process.env.BROKER_NAME || 'Cameron Norwood',
    brokerPhone: process.env.BROKER_PHONE || '',
    calendarLink: process.env.CALENDAR_LINK || '',
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  });

  const subject = newProperties.length > 0
    ? `🏢 ${newProperties.length} New Space${newProperties.length > 1 ? 's' : ''} — ${client.name}'s Search Update`
    : `Your Weekly Search Update — ${allProperties.length} Properties`;

  const transporter = await getTransporter();
  await transporter.sendMail({
    from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_FROM_ADDRESS}>`,
    to: client.email,
    subject,
    html,
  });

  console.log(`[Email] Sent to ${client.email} — ${newProperties.length} new properties`);
}
