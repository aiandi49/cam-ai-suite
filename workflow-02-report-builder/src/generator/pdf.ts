import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { Client } from '../../../shared/types/index';
import { PropertyWithSummary } from './report';

interface PdfInput {
  title: string;
  client: Client;
  properties: PropertyWithSummary[];
}

export async function generatePdf(input: PdfInput): Promise<Buffer> {
  const templatePath = path.join(__dirname, '../templates/report.hbs');
  const templateSrc = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSrc);

  const html = template({
    ...input,
    brokerName: process.env.BROKER_NAME || 'Cameron Norwood',
    brokerTitle: process.env.BROKER_TITLE || 'Commercial Real Estate Broker',
    brokerPhone: process.env.BROKER_PHONE || '',
    brokerEmail: process.env.BROKER_EMAIL || '',
    brokerLicense: process.env.BROKER_LICENSE || '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    propertyCount: input.properties.length,
  });

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
  });

  await browser.close();
  return Buffer.from(pdf);
}
