export function getOwnerEmail(): string | null {
  const owner = process.env.OWNER_EMAIL?.trim();
  return owner || null;
}

/** Skip owner copy when the customer address is the same as the owner inbox. */
export function shouldSendOwnerCopy(customerEmail: string): boolean {
  const owner = getOwnerEmail();
  if (!owner) {
    return false;
  }
  return owner.toLowerCase() !== customerEmail.trim().toLowerCase();
}
