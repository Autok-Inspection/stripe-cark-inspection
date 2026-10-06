"use server";

import db from "@/lib/db";
import { buildReportRequestOwnerEmailHtml } from "@/lib/emails/templates";
import { createResendClient, getResendFrom } from "@/lib/emails/resend-config";
import { getOwnerEmail } from "@/lib/emails/owner-inbox";

type ReportRequest = {
  firstName: string;
  lastName: string;
  email: string;
  vnNumber: string;
};

export async function handleReportRequest(data: ReportRequest) {
  try {
    const { firstName, lastName, email, vnNumber } = data;

    if (!firstName || !lastName || !email || !vnNumber) {
      throw new Error("Required fields are missing");
    }

    const report = await db.report.create({
      data: {
        firstName,
        lastName,
        email,
        vinNumber: vnNumber,
      },
    });

    const resend = createResendClient();
    if (!resend) {
      console.warn("[handleReportRequest] RESEND_API_KEY not set; skipping emails.");
      return { success: true, data: report };
    }

    const owner = getOwnerEmail();
    if (!owner) {
      console.warn("[handleReportRequest] OWNER_EMAIL not set; skipping email.");
      return { success: true, data: report };
    }

    const from = getResendFrom();
    const fullName = `${firstName} ${lastName}`;
    const emailParams = { fullName, email, vinNumber: vnNumber };

    const { error: ownerError } = await resend.emails.send({
      from,
      to: owner,
      replyTo: email,
      subject: "Get Car Inspection Report - CarK",
      html: buildReportRequestOwnerEmailHtml(emailParams),
    });

    if (ownerError) {
      console.error("[handleReportRequest] owner email failed", ownerError);
      throw ownerError;
    }

    return { success: true, data: report };
  } catch (error) {
    console.error("Error processing report request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}
