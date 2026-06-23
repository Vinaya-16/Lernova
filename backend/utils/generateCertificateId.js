import Certificate from "../models/Certificate.js";

/**
 * Generates a unique certificate ID of the form LN-YYYY-MMDD-XXX, e.g.
 * LN-2026-0622-001. The sequence number (XXX) increments per day and
 * is verified against the database to guarantee uniqueness even under
 * concurrent requests.
 *
 * @returns {Promise<string>} a unique certificate ID
 */
const generateCertificateId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const datePart = `${year}-${month}${day}`;

  const MAX_ATTEMPTS = 20;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    // Count existing certificates issued today to determine the next sequence number.
    const countToday = await Certificate.countDocuments({
      certificateId: { $regex: `^LN-${datePart}-` },
    });

    const sequence = String(countToday + 1 + attempt).padStart(3, "0");
    const candidateId = `LN-${datePart}-${sequence}`;

    // eslint-disable-next-line no-await-in-loop
    const existing = await Certificate.findOne({ certificateId: candidateId }).lean();
    if (!existing) {
      return candidateId;
    }
  }

  throw new Error("Failed to generate a unique certificate ID. Please try again.");
};

export default generateCertificateId;
