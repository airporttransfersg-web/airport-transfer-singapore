const BRAND = {
  name: "Airport Transfer Singapore",
  domain: "airporttransfersingapore.com",
  sender: "booking@airporttransfersingapore.com",
  operations: "hello@mysingaporedriver.com",
  phone: "+65 8081 6218",
};

const LIMITS = {
  name: 100,
  email: 254,
  phone: 40,
  transport_date: 10,
  transport_time: 5,
  service_type: 30,
  pickup: 200,
  dropoff: 200,
  flight: 80,
  passengers: 2,
  luggage: 2,
  additional_information: 2000,
};

const required = ["name", "email", "phone", "transport_date", "service_type", "pickup", "passengers", "luggage"];

function clean(value, max = 200) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(input) {
  return Object.fromEntries(Object.entries(LIMITS).map(([key, max]) => [key, clean(input[key], max)]));
}

function validate(data) {
  const missing = required.filter((key) => !data[key]);
  if (missing.length) return "Please complete all required fields.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Please enter a valid email address.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.transport_date)) return "Please enter a valid transport date.";
  if (!new Set(["point-to-point", "hourly"]).has(data.service_type)) return "Please choose a valid service type.";
  if (!/^\d{1,2}$/.test(data.passengers) || Number(data.passengers) < 1) return "Please enter a valid passenger count.";
  if (!/^\d{1,2}$/.test(data.luggage) || Number(data.luggage) < 0) return "Please enter a valid luggage count.";
  return null;
}

function referenceId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `ATS-${date}-${suffix}`;
}

function serviceLabel(value) {
  return value === "hourly" ? "By the hour" : "Transfer (point-to-point)";
}

function rows(data) {
  return [
    ["Reference", data.reference],
    ["Name", data.name],
    ["Contact number", data.phone],
    ["Email", data.email],
    ["Service", serviceLabel(data.service_type)],
    ["Date", data.transport_date],
    ["Time", data.transport_time || "Not provided"],
    ["Pick-up location", data.pickup],
    ["Drop-off location", data.dropoff || "Not provided"],
    ["Flight details", data.flight || "Not provided"],
    ["Passengers", data.passengers],
    ["Large luggage", data.luggage],
    ["Additional information", data.additional_information || "None provided"],
  ];
}

function detailsTable(data) {
  return rows(data).map(([label, value], index) => `
    <tr>
      <td style="width:34%;padding:12px 14px;border-bottom:1px solid #dedbd3;background:${index % 2 ? "#fbfaf7" : "#f4f2ec"};color:#66645f;font-size:13px;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #dedbd3;background:${index % 2 ? "#fbfaf7" : "#f4f2ec"};color:#171819;font-size:13px;line-height:1.55;vertical-align:top;overflow-wrap:anywhere;">${escapeHtml(value)}</td>
    </tr>`).join("");
}

function textDetails(data) {
  return rows(data).map(([label, value]) => `${label}: ${value}`).join("\n");
}

function enquiryEmail(data) {
  const firstName = data.name.split(" ")[0] || data.name;
  const title = "Thank you for your enquiry";
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title></head>
<body style="margin:0;background:#f4f2ec;color:#171819;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">We have received your Airport Transfer Services enquiry ${escapeHtml(data.reference)}.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f2ec;"><tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dedbd3;">
      <tr><td align="center" style="padding:34px 24px 28px;border-bottom:3px solid #171819;">
        <div style="font-size:28px;font-weight:800;letter-spacing:.055em;line-height:1.08;text-transform:uppercase;color:#171819;">Airport Transfer</div>
        <div style="margin-top:4px;font-size:28px;font-weight:800;letter-spacing:.055em;line-height:1.08;text-transform:uppercase;color:#171819;">Singapore</div>
        <div style="margin-top:10px;color:#77746e;font-size:11px;letter-spacing:.11em;text-transform:uppercase;">${BRAND.domain}</div>
        <div style="margin-top:6px;color:#9a9790;font-size:10px;letter-spacing:.04em;">A MySingaporeDriver brand</div>
      </td></tr>
      <tr><td style="padding:34px;">
        <h1 style="margin:0 0 22px;font-size:28px;line-height:1.2;font-weight:600;">Thank you for your enquiry</h1>
        <p style="margin:0 0 14px;color:#55534f;font-size:15px;line-height:1.7;">Hi ${escapeHtml(firstName)},</p>
        <p style="margin:0 0 14px;color:#55534f;font-size:15px;line-height:1.7;">We’ve received your enquiry regarding <strong style="color:#171819;">Airport Transfer Services</strong>.</p>
        <p style="margin:0 0 24px;color:#55534f;font-size:15px;line-height:1.7;">Our representative will review your requirements and contact you within 1–2 business days.</p>
        <p style="margin:0 0 24px;padding:14px 16px;background:#f4f2ec;color:#55534f;font-size:13px;line-height:1.6;"><strong style="color:#171819;">Please note:</strong> this email acknowledges your enquiry; it is not a booking confirmation. Your vehicle, fare and pickup arrangements will be confirmed separately.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dedbd3;border-bottom:0;">${detailsTable(data)}</table>
        <p style="margin:24px 0 0;color:#55534f;font-size:14px;line-height:1.65;">Need to add something? Reply to this email and include reference <strong style="color:#171819;">${escapeHtml(data.reference)}</strong>.</p>
      </td></tr>
      <tr><td style="padding:24px 34px;background:#171819;color:#d7d4ce;font-size:12px;line-height:1.7;">
        <strong style="color:#ffffff;">${BRAND.name}</strong><br>
        <a href="mailto:${BRAND.sender}" style="color:#ffffff;">${BRAND.sender}</a> &nbsp;·&nbsp; <a href="tel:+6580816218" style="color:#ffffff;">${BRAND.phone}</a><br>
        <span style="color:#96948f;font-size:10px;">${BRAND.domain} · A MySingaporeDriver brand</span>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = `${title}\n\nHi ${firstName},\n\nWe’ve received your enquiry regarding Airport Transfer Services.\n\nOur representative will review your requirements and contact you within 1–2 business days.\n\nPlease note: this email acknowledges your enquiry; it is not a booking confirmation. Your vehicle, fare and pickup arrangements will be confirmed separately.\n\n${textDetails(data)}\n\nReply to this email if you need to add anything.\n\n${BRAND.name}\n${BRAND.sender}\n${BRAND.phone}\n${BRAND.domain}\nA MySingaporeDriver brand`;
  return { html, text };
}

function json(body, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function formatAddress(address) {
  if (typeof address === "string") return address;
  const safeName = clean(address?.name, 100).replace(/["<>\\]/g, " ").replace(/\s+/g, " ").trim();
  return safeName ? `${safeName} <${address.email}>` : address?.email;
}

async function sendEmail(env, message, idempotencyKey) {
  if (env.EMAIL?.send) return env.EMAIL.send(message);
  if (!env.RESEND_API_KEY) throw new Error("Email delivery is not configured.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: formatAddress(message.from),
      to: [formatAddress(message.to)],
      reply_to: formatAddress(message.replyTo),
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Email provider returned ${response.status}: ${detail.slice(0, 300)}`);
  }

  return response.json();
}

export async function onRequestPost(context) {
  const requestUrl = new URL(context.request.url);
  const origin = context.request.headers.get("origin");
  if (!origin || new URL(origin).host !== requestUrl.host) return json({ message: "This submission source is not allowed." }, 403);

  const contentLength = Number(context.request.headers.get("content-length") || 0);
  if (contentLength > 20_000) return json({ message: "The enquiry is too large to submit." }, 413);

  const contentType = context.request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return json({ message: "Please submit the website enquiry form." }, 415);

  let input;
  try {
    input = await context.request.json();
  } catch {
    return json({ message: "The enquiry details could not be read." }, 400);
  }

  if (clean(input.website, 100)) return json({ message: "Thank you. Your enquiry has been received." });

  const data = normalize(input);
  const validationError = validate(data);
  if (validationError) return json({ message: validationError }, 400);
  if (!context.env.EMAIL?.send && !context.env.RESEND_API_KEY) return json({ message: "Email delivery is not configured yet." }, 503);

  data.reference = referenceId();
  const email = enquiryEmail(data);
  const subject = `New website enquiry — ${data.reference}`;

  try {
    await Promise.all([
      sendEmail(context.env, {
        to: { email: BRAND.operations, name: "Airport Transfer Singapore bookings" },
        from: { email: BRAND.sender, name: BRAND.name },
        replyTo: { email: data.email, name: data.name },
        subject,
        html: email.html,
        text: email.text,
      }, `${data.reference}-operations`),
      sendEmail(context.env, {
        to: { email: data.email, name: data.name },
        from: { email: BRAND.sender, name: BRAND.name },
        replyTo: BRAND.sender,
        subject,
        html: email.html,
        text: email.text,
      }, `${data.reference}-customer`),
    ]);
  } catch (error) {
    console.error("Enquiry email delivery failed", error);
    return json({ message: "We could not deliver your enquiry right now." }, 502);
  }

  return json({ message: `Thank you. Your enquiry has been received. Reference: ${data.reference}`, reference: data.reference });
}

export function onRequest() {
  return json({ message: "Method not allowed." }, 405);
}
