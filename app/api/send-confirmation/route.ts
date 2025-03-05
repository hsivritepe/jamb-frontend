import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ALL_SERVICES } from "@/constants/services";

/**
 * Converts a service code into a user-friendly title
 */
function findServiceTitle(serviceCode: string): string {
  const normalized = serviceCode.replace(/\./g, "-");
  const found = ALL_SERVICES.find((svc) => svc.id === normalized);
  return found ? found.title : `Service code: ${serviceCode}`;
}

/**
 * Represents a single material item in the order.
 */
interface MaterialSpec {
  external_id: string;
  quantity: number;
  cost_per_unit: string;
  total: string;
  name?: string;
}

/**
 * If the material name is missing, returns "Material #<external_id>".
 */
function getMaterialName(mat: MaterialSpec): string {
  if (mat.name && mat.name.trim()) return mat.name;
  return `Material #${mat.external_id}`;
}

/**
 * Describes a "WorkItem" (service) with optional materials.
 */
interface WorkItem {
  type: string;
  code: string;
  unit_of_measurement: string;
  work_count: string;
  labor_cost: string;
  materials_cost: string;
  service_fee_on_labor: string;
  service_fee_on_materials: string;
  total: string;
  payment_type: string;
  payment_coefficient: string;
  materials: MaterialSpec[];
}

/**
 * The shape of the incoming JSON body for confirmation.
 */
interface ConfirmationPayload {
  email: string;
  orderId: string;
  address: string;
  description: string;
  selectedDate: string;
  laborSubtotal: string;
  materialsSubtotal: string;
  sumBeforeTax: string;
  finalTotal: string;
  taxAmount: string;
  timeCoefficient: string;
  serviceFeeOnLabor: string;
  serviceFeeOnMaterials: string;
  works: WorkItem[];
  photos: string[];
  date_surcharge?: string;
}

/**
 * Formats a numeric value with commas and exactly two decimals (US style).
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Converts a string or number to a float, returning 0 if parsing fails.
 */
function toNum(str: string | number): number {
  return Number(str) || 0;
}

/**
 * Helper to format date/time for Google Calendar link (YYYYMMDDTHHMMSSZ).
 */
function toGoogleDateString(date: Date): string {
  // Example: "20250310T100000Z"
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function POST(request: NextRequest) {
  try {
    // 1) Parse the incoming JSON body
    const body: ConfirmationPayload = await request.json();

    // 2) Check required fields
    if (!body.email || !body.orderId) {
      return NextResponse.json(
        { error: "Missing required fields: email or orderId" },
        { status: 400 }
      );
    }

    // 3) Configure Nodemailer (SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.office365.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 4) Convert various numeric fields
    let laborSubtotalNum = toNum(body.laborSubtotal);
    let materialsSubtotalNum = toNum(body.materialsSubtotal);
    let sumBeforeTaxNum = toNum(body.sumBeforeTax);
    let finalTotalNum = toNum(body.finalTotal);
    let taxAmountNum = toNum(body.taxAmount);
    let serviceFeeLaborNum = toNum(body.serviceFeeOnLabor);
    let serviceFeeMaterialsNum = toNum(body.serviceFeeOnMaterials);

    const timeCoeffNum = toNum(body.timeCoefficient || "1");
    const dateSurchargeValue = toNum(body.date_surcharge || "0");

    // 5) Recompute labor/materials from works[] for consistency
    const computedLaborSubtotal = body.works.reduce(
      (acc, w) => acc + toNum(w.labor_cost),
      0
    );
    const computedMaterialsSubtotal = body.works.reduce(
      (acc, w) => acc + toNum(w.materials_cost),
      0
    );

    laborSubtotalNum = computedLaborSubtotal;
    materialsSubtotalNum = computedMaterialsSubtotal;

    // 6) Calculate final labor, surcharge/discount
    const finalLabor = laborSubtotalNum * timeCoeffNum;
    const computedSurcharge = finalLabor - laborSubtotalNum;
    const isDiscount = computedSurcharge < 0;
    const dateSurchargeLabel = isDiscount
      ? "Discount (Date Selection)"
      : "Surcharge (Date Selection)";
    const signPrefix = isDiscount ? "-" : "+";
    const absSurcharge = Math.abs(computedSurcharge);

    // 7) Compute subtotal & final total
    const sumBeforeTaxCalc =
      finalLabor + materialsSubtotalNum + serviceFeeLaborNum + serviceFeeMaterialsNum;
    sumBeforeTaxNum = sumBeforeTaxCalc;

    const finalTotalCalc = sumBeforeTaxCalc + taxAmountNum;
    finalTotalNum = finalTotalCalc;

    // 8) Build the HTML snippet for each WorkItem
    let worksHtml = "";
    body.works.forEach((w, idx) => {
      const totalVal = toNum(w.total);
      const laborVal = toNum(w.labor_cost);
      const materialsVal = toNum(w.materials_cost);
      const serviceTitle = findServiceTitle(w.code);

      let materialsTable = "";
      if (w.materials && w.materials.length > 0) {
        const rows = w.materials
          .map((mat) => {
            const cpu = toNum(mat.cost_per_unit);
            const sub = toNum(mat.total);
            const matName = getMaterialName(mat);
            return `
              <tr>
                <td>${matName}</td>
                <td style="text-align:center;">$${formatWithSeparator(cpu)}</td>
                <td style="text-align:center;">${mat.quantity}</td>
                <td style="text-align:right;">$${formatWithSeparator(sub)}</td>
              </tr>
            `;
          })
          .join("");

        materialsTable = `
          <table style="width:100%; border:1px solid #ccc; margin:6px 0; font-size:0.9rem">
            <thead style="background:#f9f9f9">
              <tr>
                <th style="text-align:left;">Material</th>
                <th style="text-align:center;">Unit Price</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        `;
      }

      worksHtml += `
        <div style="margin-bottom:18px; border-bottom:1px dashed #ccc; padding-bottom:10px;">
          <div style="font-weight:bold;">
            ${idx + 1}. ${serviceTitle}
            ${w.work_count} ${w.unit_of_measurement}
            - $${formatWithSeparator(totalVal)}
          </div>
          <div style="margin:4px 0;">
            Labor: $${formatWithSeparator(laborVal)}<br/>
            Materials: $${formatWithSeparator(materialsVal)}
          </div>
          ${materialsTable}
        </div>
      `;
    });

    // 9) Generate a Google Calendar link (assuming 1 hour block from selectedDate)
    //    If selectedDate is invalid or missing, we fallback to "now".
    const startDate = body.selectedDate ? new Date(body.selectedDate) : new Date();
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour
    const startStr = toGoogleDateString(startDate); // e.g. "20250310T100000Z"
    const endStr = toGoogleDateString(endDate);

    const calendarDetails = encodeURIComponent(body.description || "");
    const calendarLocation = encodeURIComponent(body.address || "");
    const googleCalendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=JAMB+Service+Order+${body.orderId}&dates=${startStr}/${endStr}&details=${calendarDetails}&location=${calendarLocation}`;

    // 10) Disclaimer text
    const disclaimers = `
      <p style="font-size:0.9rem; color:#999; margin-top:30px;">
        *All labor times and materials are estimated. Actual costs may vary.<br/>
        Thank you for choosing JAMB!
      </p>
    `;

    // 11) Assemble HTML email content
    const htmlEmailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Order ${body.orderId}</title>
</head>
<body style="font-family: sans-serif; color: #333; margin: 10px;">
  <p>
    Thank you for your order!<br/>
    Check the Estimate below.<br/>
    <br/>
    <br/>
    More info on
    <a href="https://thejamb.com/dashboard" target="_blank">Dashboard</a>
    <br/><br/>
    <a href="${googleCalendarLink}" target="_blank">Add to Google Calendar</a>
  </p>

  <hr style="border:none; border-top:1px solid #ccc; margin-bottom:14px;"/>

  <h1 style="margin-bottom:4px;">JAMB - Home Services</h1>

  <h2>Order #${body.orderId}</h2>
  <div>
    <strong>Address:</strong> ${body.address}<br/>
    <strong>Date of Service:</strong> ${body.selectedDate}<br/>
    <strong>Description:</strong> ${body.description || "No details provided"}
  </div>

  <div style="margin-top:16px;">
    <h3>Your Selected Services:</h3>
    ${worksHtml}
  </div>

  <div style="margin-top:20px;">
    <h3>Totals</h3>
    <div style="margin:4px 0;"><strong>Labor Total:</strong> $${formatWithSeparator(laborSubtotalNum)}</div>
    <div style="margin:4px 0;"><strong>Materials, tools & equipment:</strong> $${formatWithSeparator(materialsSubtotalNum)}</div>
    <div style="margin:4px 0;"><strong>${dateSurchargeLabel}:</strong> ${signPrefix}$${formatWithSeparator(absSurcharge)}</div>
    <div style="margin:4px 0;"><strong>Service Fee on Labor:</strong> $${formatWithSeparator(serviceFeeLaborNum)}</div>
    <div style="margin:4px 0;"><strong>Delivery & Processing Fee:</strong> $${formatWithSeparator(serviceFeeMaterialsNum)}</div>
    <div style="margin:4px 0;"><strong>Subtotal:</strong> $${formatWithSeparator(sumBeforeTaxNum)}</div>
    <div style="margin:4px 0;"><strong>Taxes:</strong> $${formatWithSeparator(taxAmountNum)}</div>
    <div style="margin:6px 0; font-weight:bold; font-size:1.5rem;">
      Total: $${formatWithSeparator(finalTotalNum)}
    </div>
  </div>

  ${disclaimers}

</body>
</html>
`;

    // 12) Send the email
    const fromEmail = process.env.SMTP_FROM_EMAIL || "info@thejamb.com";
    const fromField = `"JAMB" <${fromEmail}>`;

    await transporter.sendMail({
      from: fromField,
      to: body.email,
      subject: `Order Confirmation #${body.orderId}`,
      text: `Thank you for your saved order #${body.orderId}!\nCheck the Estimate below.\n\nJAMB Team\n\nMore information: https://thejamb.com/dashboard\n\n${googleCalendarLink}`,
      html: htmlEmailContent,
    });

    // 13) Return success
    return NextResponse.json({
      message: "HTML email with Calendar link sent successfully (no PDF).",
    });
  } catch (err: any) {
    console.error("Error sending confirmation email (HTML only):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}