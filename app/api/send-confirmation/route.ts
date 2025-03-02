import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import { ALL_SERVICES } from "@/constants/services";

function findServiceTitle(serviceCode: string): string {
  const normalized = serviceCode.replace(/\./g, "-");
  const found = ALL_SERVICES.find((svc) => svc.id === normalized);
  return found ? found.title : `Service code: ${serviceCode}`;
}

/**
 * A helper interface for material items. "name?" is optional, if available.
 */
interface MaterialSpec {
  external_id: string;
  quantity: number;
  cost_per_unit: string;
  total: string;
  name?: string;
}

/**
 * A helper to pick the material name (fallback to external_id).
 */
function getMaterialName(mat: MaterialSpec): string {
  if (mat.name && mat.name.trim()) {
    return mat.name;
  }
  return `Material #${mat.external_id}`;
}

/**
 * Interface for a single WorkItem in the PDF data.
 */
interface WorkItem {
  type: string;
  code: string; // e.g. "1.1.2"
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
}

/**
 * Formats numbers with commas and two decimals.
 */
function formatWithSeparator(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Converts a string or number to a float safely.
 */
function toNum(str: string | number): number {
  return Number(str) || 0;
}

export async function POST(request: NextRequest) {
  try {
    // 1) Parse JSON from the request body
    const body: ConfirmationPayload = await request.json();

    if (!body.email || !body.orderId) {
      return NextResponse.json(
        { error: "Missing required fields: email or orderId" },
        { status: 400 }
      );
    }

    // 2) Configure Nodemailer (Office 365 example)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.office365.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // STARTTLS on 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3) Convert numeric strings from the request body into real numbers
    const laborSubtotalNum = toNum(body.laborSubtotal);
    const materialsSubtotalNum = toNum(body.materialsSubtotal);
    const sumBeforeTaxNum = toNum(body.sumBeforeTax);
    const finalTotalNum = toNum(body.finalTotal);
    const taxAmountNum = toNum(body.taxAmount);
    const timeCoeff = toNum(body.timeCoefficient);
    const serviceFeeLaborNum = toNum(body.serviceFeeOnLabor);
    const serviceFeeMaterialsNum = toNum(body.serviceFeeOnMaterials);

    // 4) Build the HTML for each WorkItem
    let worksHtml = "";
    body.works.forEach((w, idx) => {
      const totalVal = toNum(w.total);
      const laborVal = toNum(w.labor_cost);
      const materialsVal = toNum(w.materials_cost);

      // Find the service's user-friendly title
      const serviceTitle = findServiceTitle(w.code);

      // Build a materials table if we have any
      let materialsTable = "";
      if (w.materials?.length) {
        const rows = w.materials
          .map((mat) => {
            const cpu = toNum(mat.cost_per_unit);
            const sub = toNum(mat.total);
            const matName = getMaterialName(mat);
            return `
              <tr>
                <td>${matName}</td>
                <td style="text-align:right;">$${formatWithSeparator(cpu)}</td>
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
                <th style="text-align:right;">Unit Price</th>
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

    // 5) Photos HTML if we want them in the PDF
    let photosHtml = "";
    if (Array.isArray(body.photos) && body.photos.length) {
      const photoTags = body.photos
        .map(
          (url) => `
          <div style="border:1px solid #ccc; margin:3px; display:inline-block;">
            <img src="${url}" style="width:100px;" alt="img"/>
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

    // 6) Minimal disclaimers
    const disclaimers = `
      <p style="font-size:0.9rem; color:#999; margin-top:30px;">
        *All labor times and materials are estimated. Actual costs may vary.<br/>
        Thank you for choosing JAMB!
      </p>
    `;

    // 7) Build final HTML with your heading "JAMB - Home Services"
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
    <h3>Works</h3>
    ${worksHtml}
  </div>

  ${photosHtml}

  <div class="section">
    <h3>Totals</h3>
    <div class="row">
      <div class="label">Labor subtotal:</div>
      <div>$${formatWithSeparator(laborSubtotalNum)}</div>
    </div>
    <div class="row">
      <div class="label">Materials subtotal:</div>
      <div>$${formatWithSeparator(materialsSubtotalNum)}</div>
    </div>
    <div class="row">
      <div class="label">Service fee (on Labor):</div>
      <div>$${formatWithSeparator(serviceFeeLaborNum)}</div>
    </div>
    <div class="row">
      <div class="label">Proccessing and Delivery fee (on Materials):</div>
      <div>$${formatWithSeparator(serviceFeeMaterialsNum)}</div>
    </div>
    <div class="row">
      <div class="label">Subtotal before tax:</div>
      <div>$${formatWithSeparator(sumBeforeTaxNum)}</div>
    </div>
    <div class="row">
      <div class="label">Tax:</div>
      <div>$${formatWithSeparator(taxAmountNum)}</div>
    </div>
    <div class="row" style="font-weight:bold; margin-top:6px;">
      <div>Total:</div>
      <div>$${formatWithSeparator(finalTotalNum)}</div>
    </div>
  </div>

  ${disclaimers}
</body>
</html>
`;

    // 8) Launch Puppeteer, generate PDF from the above HTML
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

    const pdfBuffer = (await page.pdf({
      format: "A4",
      printBackground: true,
    })) as Buffer;

    await browser.close();

    // 9) Build and send email with the PDF attachment
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

    return NextResponse.json({ message: "Email with PDF sent successfully" });
  } catch (err: any) {
    console.error("Error sending confirmation email with PDF:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}