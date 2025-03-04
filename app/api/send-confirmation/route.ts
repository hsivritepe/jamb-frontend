// app/api/send-confirmation/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import { ALL_SERVICES } from "@/constants/services";

/**
 * Converts a service code (e.g. "1.1.2") to a user-friendly title by searching in ALL_SERVICES.
 */
function findServiceTitle(serviceCode: string): string {
  const normalized = serviceCode.replace(/\./g, "-");
  const found = ALL_SERVICES.find((svc) => svc.id === normalized);
  return found ? found.title : `Service code: ${serviceCode}`;
}

/**
 * Represents a single material item in the PDF data.
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
 * One "WorkItem" (service) in the PDF, possibly with materials.
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
 * The shape of the JSON payload expected by this route.
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

export async function POST(request: NextRequest) {
  try {
    // 1) Parse the incoming JSON
    const body: ConfirmationPayload = await request.json();

    // 2) Validate required fields
    if (!body.email || !body.orderId) {
      return NextResponse.json(
        { error: "Missing required fields: email or orderId" },
        { status: 400 }
      );
    }

    // 3) Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.office365.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 4) Convert numeric fields to numbers
    let laborSubtotalNum = toNum(body.laborSubtotal);
    let materialsSubtotalNum = toNum(body.materialsSubtotal);
    let sumBeforeTaxNum = toNum(body.sumBeforeTax);
    let finalTotalNum = toNum(body.finalTotal);
    let taxAmountNum = toNum(body.taxAmount);
    let serviceFeeLaborNum = toNum(body.serviceFeeOnLabor);
    let serviceFeeMaterialsNum = toNum(body.serviceFeeOnMaterials);

    const timeCoeffNum = toNum(body.timeCoefficient || "1");
    const dateSurchargeValue = toNum(body.date_surcharge || "0");

    // 5) Recompute labor and materials from the works array
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

    // 6) Calculate final labor + surcharge
    const finalLabor = laborSubtotalNum * timeCoeffNum;
    const computedSurcharge = finalLabor - laborSubtotalNum;
    const isDiscount = computedSurcharge < 0;
    const dateSurchargeLabel = isDiscount
      ? "Discount (Date Selection)"
      : "Surcharge (Date Selection)";
    const signPrefix = isDiscount ? "-" : "+";
    const absSurcharge = Math.abs(computedSurcharge);

    // 7) Subtotal & total
    const sumBeforeTaxCalc =
      finalLabor + materialsSubtotalNum + serviceFeeLaborNum + serviceFeeMaterialsNum;
    sumBeforeTaxNum = sumBeforeTaxCalc;

    const finalTotalCalc = sumBeforeTaxCalc + taxAmountNum;
    finalTotalNum = finalTotalCalc;

    // 8) Build HTML for each WorkItem
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

    // 9) Handle uploaded photos
    let photosHtml = "";
    if (Array.isArray(body.photos) && body.photos.length > 0) {
      const photoTags = body.photos
        .map(
          (url) => `
            <div style="border:1px solid #ccc; margin:3px; display:inline-block;">
              <img src="${url}" style="width:100px;" alt="uploaded"/>
            </div>`
        )
        .join("");

      photosHtml = `
        <h3 style="margin:6px 0 4px; font-size:1rem;">Uploaded Photos</h3>
        <div style="margin:6px 0; display:flex; flex-wrap:wrap;">
          ${photoTags}
        </div>
      `;
    }

    // 10) Disclaimers
    const disclaimers = `
      <p style="font-size:0.9rem; color:#999; margin-top:30px;">
        *All labor times and materials are estimated. Actual costs may vary.<br/>
        Thank you for choosing JAMB!
      </p>
    `;

    // 11) Final HTML for PDF
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Order ${body.orderId}</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 30px;
      color: #333;
    }
    h1, h2, h3 {
      margin: 0.5em 0;
    }
    .section {
      margin-top: 20px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin: 4px 0;
    }
    .label {
      font-weight: bold;
    }
    table {
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 4px 6px;
    }
  </style>
</head>
<body>
  <h1 style="margin-bottom:2px;">JAMB - Home Services</h1>
  <hr style="border:none; border-top:1px solid #ccc; margin-bottom:14px;"/>

  <h2>Order #${body.orderId}</h2>
  <div>
    <strong>Address:</strong> ${body.address}<br/>
    <strong>Date of Service:</strong> ${body.selectedDate}<br/>
    <strong>Description:</strong> ${body.description || "No details provided"}
  </div>

  <div class="section" style="margin-top:14px;">
    <h3>Your Selected Services:</h3>
    ${worksHtml}
  </div>

  ${photosHtml}

  <div class="section">
    <h3>Totals</h3>
    <!-- Labor -->
    <div class="row">
      <div class="label">Labor Total:</div>
      <div>$${formatWithSeparator(laborSubtotalNum)}</div>
    </div>
    <!-- Materials -->
    <div class="row">
      <div class="label">Materials, tools & equipment:</div>
      <div>$${formatWithSeparator(materialsSubtotalNum)}</div>
    </div>
    <!-- Surcharge or Discount -->
    <div class="row">
      <div class="label">${dateSurchargeLabel}:</div>
      <div>
        ${signPrefix}$${formatWithSeparator(absSurcharge)}
      </div>
    </div>
    <!-- Service Fee on Labor -->
    <div class="row">
      <div class="label">Service Fee on Labor:</div>
      <div>$${formatWithSeparator(serviceFeeLaborNum)}</div>
    </div>
    <!-- Delivery & Processing Fee -->
    <div class="row">
      <div class="label">Delivery & Processing Fee:</div>
      <div>$${formatWithSeparator(serviceFeeMaterialsNum)}</div>
    </div>
    <!-- Subtotal -->
    <div class="row">
      <div class="label">Subtotal:</div>
      <div>$${formatWithSeparator(sumBeforeTaxNum)}</div>
    </div>
    <!-- Taxes -->
    <div class="row">
      <div class="label">Taxes:</div>
      <div>$${formatWithSeparator(taxAmountNum)}</div>
    </div>
    <!-- Final Total -->
    <div class="row" style="font-weight:bold; margin-top:6px;">
      <div>Total:</div>
      <div>$${formatWithSeparator(finalTotalNum)}</div>
    </div>
    <!-- Optional: timeCoefficient if needed
    <div class="row">
      <div class="label">Time Coefficient:</div>
      <div>${timeCoeffNum}</div>
    </div>
    -->
  </div>

  ${disclaimers}
</body>
</html>
`;

    // 12) Attempt serverless-compatible path
    let ep: string | null = null;
    try {
      ep = await chromium.executablePath();
    } catch (err) {
      console.warn("Could not retrieve chromium.executablePath()", err);
    }

    // 13) Puppeteer fallback
    let browser;
    if (!ep) {
      console.log("Falling back to Puppeteer's bundled Chromium (local dev).");
      browser = await puppeteer.launch({ headless: true });
    } else {
      console.log("Launching serverless Chromium from @sparticuz/chromium");
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: ep,
        headless: chromium.headless,
      });
    }

    // 14) Generate PDF as Buffer
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
    const pdfBuffer = (await page.pdf({
      format: "A4",
      printBackground: true,
    })) as Buffer;

    await browser.close();

    // 15) Attach PDF to email
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || "info@thejamb.com",
      to: body.email,
      subject: `Order Confirmation #${body.orderId}`,
      text: `Thank you for your saved order #${body.orderId}!\nCheck the attached PDF for details.\n\nJAMB Team\n\nCheck details: https://thejamb.com/dashboard`,
      attachments: [
        {
          filename: `order-${body.orderId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // 16) Success
    return NextResponse.json({ message: "Email with PDF sent successfully" });
  } catch (err: any) {
    console.error("Error sending confirmation email with PDF:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}