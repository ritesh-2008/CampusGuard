import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/* ── Severity color map ─────────────────────────────────────────── */
const SEVERITY_STYLES = {
  low:      { bg: "#ecfdf5", accent: "#059669", border: "#a7f3d0", emoji: "ℹ️" },
  moderate: { bg: "#fffbeb", accent: "#d97706", border: "#fde68a", emoji: "⚠️" },
  high:     { bg: "#fef2f2", accent: "#dc2626", border: "#fecaca", emoji: "🔴" },
  critical: { bg: "#fef2f2", accent: "#991b1b", border: "#fca5a5", emoji: "🚨" },
};

/* ── Helpers ────────────────────────────────────────────────────── */
const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const severityStyle = (s) =>
  SEVERITY_STYLES[s?.toLowerCase()] ?? SEVERITY_STYLES.moderate;

const formatTimestamp = () =>
  new Date().toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

/* ── HTML builder ───────────────────────────────────────────────── */
function buildHtml({ type, description, severity }) {
  const s = severityStyle(severity);
  const time = formatTimestamp();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CampusShield Emergency Alert</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9">
<tr><td align="center" style="padding:40px 16px">

  <!-- Outer card -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

    <!-- ── HEADER ── -->
    <tr>
      <td style="background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%);padding:36px 32px 28px;text-align:center">
        <div style="font-size:44px;line-height:1;margin-bottom:10px">🚨</div>
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:.2px">
          CampusShield Emergency
        </h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,.82);font-size:13px;font-weight:500">
          Verified campus incident — ${time}
        </p>
      </td>
    </tr>

    <!-- ── SEVERITY BADGE + TYPE ── -->
    <tr>
      <td style="padding:28px 32px 0;display:flex;align-items:center;gap:12px">
        <table cellpadding="0" cellspacing="0" role="presentation" style="display:inline-table">
          <tr>
            <td style="background:${s.bg};border:1px solid ${s.border};border-radius:20px;padding:6px 16px;font-size:12px;font-weight:700;color:${s.accent};text-transform:uppercase;letter-spacing:.7px;white-space:nowrap">
              ${s.emoji} ${capitalize(severity)}
            </td>
            <td style="width:12px"></td>
            <td style="font-size:20px;font-weight:700;color:#111827;line-height:1.2">
              ${capitalize(type)}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── DESCRIPTION ── -->
    <tr>
      <td style="padding:20px 32px 0">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
          <tr>
            <td style="padding:18px 22px">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.8px">
                Incident Details
              </p>
              <p style="margin:0;color:#334155;font-size:15px;line-height:1.65">
                ${description || "No additional details were provided for this incident."}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── DIVIDER ── -->
    <tr>
      <td style="padding:28px 32px 0">
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:0" />
      </td>
    </tr>

    <!-- ── INSTRUCTIONS CALLOUT ── -->
    <tr>
      <td style="padding:24px 32px 0">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:8px">
          <tr>
            <td style="padding:18px 22px">
              <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e40af">
                What you should do
              </p>
              <p style="margin:0;color:#1e3a5f;font-size:14px;line-height:1.6">
                Stay calm and remain alert. Move to a safe location if necessary.
                Follow all instructions from campus security and local authorities.
                Do not re-enter the affected area until it has been cleared.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── FOOTER ── -->
    <tr>
      <td style="padding:32px 32px 36px">
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px" />
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td>
              <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827">
                CampusShield
              </p>
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5">
                This is an automated emergency notification. Do not reply to this email.
              </p>
            </td>
            <td align="right" style="vertical-align:bottom">
              <p style="margin:0;font-size:11px;color:#cbd5e1;text-align:right">
                Incident reported ${time}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
  <!-- / Outer card -->

</td></tr>
</table>
</body>
</html>`;
}

/* ── Public API ─────────────────────────────────────────────────── */
export const sendIncidentNotification = async ({ emails, type, description, severity }) => {
  if (!emails?.length) {
    throw new Error("sendIncidentNotification: at least one recipient email is required");
  }

  const { error, data } = await resend.emails.send({
    from: "CampusShield Alerts <alerts@alerts.riteshvanivdekar.me>",
    to: emails,
    subject: `🚨 Campus Alert: ${capitalize(type)} — ${capitalize(severity)}`,
    html: buildHtml({ type, description, severity }),
  });

  if (error) throw error;
  return data;
};
