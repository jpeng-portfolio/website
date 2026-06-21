export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function validateContactPayload(payload: ContactPayload): string | null {
  if (!payload.name || !payload.email || !payload.subject || !payload.message)
    return "Please complete all fields.";
  if (payload.name.length > 100) return "Name must be 100 characters or fewer.";
  if (payload.email.length > 254) return "Email address is too long.";
  if (!EMAIL_RE.test(payload.email)) return "Please enter a valid email address.";
  if (payload.subject.length > 200) return "Subject must be 200 characters or fewer.";
  if (payload.message.length > 5000) return "Message must be 5,000 characters or fewer.";
  return null;
}
