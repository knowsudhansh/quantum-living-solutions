import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '../../../lib/db';
import { notifyAdminOfCareer, sendCareerAutoReply } from '../../../lib/email';
import { logger } from '../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

const MAX_RESUME_SIZE = 4 * 1024 * 1024;

const RESUME_POLICIES = {
  'application/pdf': {
    extension: '.pdf',
    hasValidSignature: (buffer: Buffer) => buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-',
  },
  'application/msword': {
    extension: '.doc',
    hasValidSignature: (buffer: Buffer) =>
      buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extension: '.docx',
    hasValidSignature: (buffer: Buffer) =>
      buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && [0x03, 0x05, 0x07].includes(buffer[2]),
  },
} as const;

type ResumeMimeType = keyof typeof RESUME_POLICIES;

type CareerPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  positionSlug?: string;
  source?: string;
  location?: string;
  experienceYears?: string | number;
  currentCompany?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  skills?: string | string[];
  availability?: string;
  message?: string;
  resumeUrl?: string;
};

function cleanText(value: unknown, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function nullableText(value: unknown, max = 500) {
  const text = cleanText(value, max);
  return text.length > 0 ? text : null;
}

function parseSkills(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item, 80)).filter(Boolean).slice(0, 12);
  }

  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) return parseSkills(parsed);
  } catch {
    // Fall through to comma/newline parsing.
  }

  return value
    .split(/[\n,]/)
    .map((item) => cleanText(item, 80))
    .filter(Boolean)
    .slice(0, 12);
}

function parseExperienceYears(value: unknown) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 60) return null;
  return Math.round(number);
}

function isValidOptionalUrl(value: unknown) {
  const text = cleanText(value, 512);
  if (!text) return true;

  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizeOriginalFilename(fileName: string, extension: string) {
  const baseName = path
    .basename(fileName, path.extname(fileName))
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^[_\.]+|[_\.]+$/g, '')
    .slice(0, 120);

  return `${baseName || 'resume'}${extension}`;
}

function mimeTypeFromFile(file: File): ResumeMimeType | null {
  if (file.type in RESUME_POLICIES) return file.type as ResumeMimeType;

  const extension = path.extname(file.name).toLowerCase();
  if (extension === '.pdf') return 'application/pdf';
  if (extension === '.doc') return 'application/msword';
  if (extension === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  return null;
}

async function storeResume(file: File) {
  if (file.size <= 0) {
    throw new Error('Resume file is required');
  }

  if (file.size > MAX_RESUME_SIZE) {
    throw new Error('Resume exceeds 4MB limit');
  }

  const mimeType = mimeTypeFromFile(file);
  if (!mimeType) {
    throw new Error('Only PDF, DOC, and DOCX resumes are allowed');
  }

  const policy = RESUME_POLICIES[mimeType];
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!policy.hasValidSignature(buffer)) {
    throw new Error('Resume file signature does not match the declared type');
  }

  const uniqueId = crypto.randomUUID();
  const safeOriginalFilename = sanitizeOriginalFilename(file.name, policy.extension);
  const safeFilename = `${uniqueId}${policy.extension}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, safeFilename), buffer);

  return {
    resumeUrl: `/uploads/resumes/${safeFilename}`,
    resumeFileName: safeOriginalFilename,
    resumeMimeType: mimeType,
    resumeSize: file.size,
  };
}

function validateCore(payload: CareerPayload, resumeUrl?: string) {
  const name = cleanText(payload.name, 100);
  const email = cleanText(payload.email, 255).toLowerCase();
  const phone = cleanText(payload.phone, 50);
  const role = cleanText(payload.role, 100);

  if (!name || !email || !phone || !role || !resumeUrl) {
    return { error: 'Name, email, phone, role, and resume are required' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Invalid email address syntax' };
  }

  if (!/^\+?[0-9\s\-()]{10,18}$/.test(phone)) {
    return { error: 'Invalid phone number' };
  }

  if (!isValidOptionalUrl(payload.portfolioUrl)) {
    return { error: 'Invalid portfolio URL' };
  }

  if (!isValidOptionalUrl(payload.linkedinUrl)) {
    return { error: 'Invalid LinkedIn URL' };
  }

  return { name, email, phone, role };
}

async function applicationFromFormData(formData: FormData) {
  const file = formData.get('resume');
  const resume = file instanceof File ? await storeResume(file) : null;

  if (!resume) {
    throw new Error('Resume file is required');
  }

  const payload: CareerPayload = {
    name: cleanText(formData.get('name'), 100),
    email: cleanText(formData.get('email'), 255),
    phone: cleanText(formData.get('phone'), 50),
    role: cleanText(formData.get('role'), 100),
    positionSlug: cleanText(formData.get('positionSlug'), 120),
    source: cleanText(formData.get('source'), 50),
    location: cleanText(formData.get('location'), 255),
    experienceYears: cleanText(formData.get('experienceYears'), 10),
    currentCompany: cleanText(formData.get('currentCompany'), 255),
    portfolioUrl: cleanText(formData.get('portfolioUrl'), 512),
    linkedinUrl: cleanText(formData.get('linkedinUrl'), 512),
    skills: cleanText(formData.get('skills'), 1000),
    availability: cleanText(formData.get('availability'), 100),
    message: cleanText(formData.get('message'), 3000),
    resumeUrl: resume.resumeUrl,
  };

  return { payload, resume };
}

async function applicationFromJson(request: Request) {
  const payload = await request.json() as CareerPayload;
  return {
    payload,
    resume: {
      resumeUrl: cleanText(payload.resumeUrl, 512),
      resumeFileName: null,
      resumeMimeType: null,
      resumeSize: null,
    },
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const { payload, resume } = contentType.includes('multipart/form-data')
      ? await applicationFromFormData(await request.formData())
      : await applicationFromJson(request);

    const validation = validateCore(payload, resume.resumeUrl);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const application = await prisma.careerApplication.create({
      data: {
        name: validation.name,
        email: validation.email,
        phone: validation.phone,
        role: validation.role,
        positionSlug: cleanText(payload.positionSlug, 120) || 'other-opportunities',
        source: cleanText(payload.source, 50) || 'CAREERS',
        location: nullableText(payload.location, 255),
        experienceYears: parseExperienceYears(payload.experienceYears),
        currentCompany: nullableText(payload.currentCompany, 255),
        portfolioUrl: nullableText(payload.portfolioUrl, 512),
        linkedinUrl: nullableText(payload.linkedinUrl, 512),
        skills: parseSkills(payload.skills),
        availability: nullableText(payload.availability, 100),
        message: nullableText(payload.message, 3000),
        resumeUrl: resume.resumeUrl,
        resumeFileName: resume.resumeFileName,
        resumeMimeType: resume.resumeMimeType,
        resumeSize: resume.resumeSize,
        status: 'SUBMITTED',
      },
    });

    logger.info(`Database career application recorded. ID: ${application.id}`);

    notifyAdminOfCareer(application).catch((err) =>
      logger.error('Admin career application alert failed', err instanceof Error ? err : new Error(String(err)))
    );

    sendCareerAutoReply(application.name, application.email, application.role).catch((err) =>
      logger.error('Career applicant confirmation failed', err instanceof Error ? err : new Error(String(err)))
    );

    return NextResponse.json({ success: true, applicationId: application.id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error occurred';
    const status = /required|allowed|exceeds|signature|invalid/i.test(message) ? 400 : 500;
    logger.error('Careers API endpoint exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: status === 400 ? message : 'Internal server error occurred' }, { status });
  }
}
