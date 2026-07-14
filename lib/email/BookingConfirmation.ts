// lib/email/templates/BookingConfirmation.ts

export interface BookingConfirmationData {
    to: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    ticketId: string;
    price: number;
    eventSlug: string;
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function formatTime(timeStr: string): string {
    try {
        const [h, m] = timeStr.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const hour = h % 12 || 12;
        return `${hour}:${String(m).padStart(2, "0")} ${period}`;
    } catch {
        return timeStr;
    }
}

export function bookingConfirmationSubject(eventTitle: string): string {
    return `Your ticket for "${eventTitle}" is confirmed ✓`;
}

export function bookingConfirmationHtml(data: BookingConfirmationData, baseUrl: string): string {
    const {
        eventTitle,
        eventDate,
        eventTime,
        eventLocation,
        ticketId,
        price,
        eventSlug,
    } = data;

    const ticketIdShort = ticketId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 16);
    const isPaid = price > 0;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        `${baseUrl}/verify?id=${ticketId}`
    )}&size=160x160&bgcolor=ffffff&color=000000&margin=10`;

    const eventUrl = `${baseUrl}/events/${eventSlug}`;
    const dashboardUrl = `${baseUrl}/dashboard/attended`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:540px;" cellpadding="0" cellspacing="0">

          <!-- Logo row -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:20px;font-weight:700;color:#080c10;letter-spacing:-0.02em;">
                Dev<span style="color:#008AF7;">Event</span>
              </span>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

              <!-- Top accent bar -->
              <div style="height:4px;background:linear-gradient(to right,#008AF7,#00C2FF);"></div>

              <!-- Card body -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 32px 24px;">
                <tr>
                  <td>
                    <!-- Heading -->
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#008AF7;text-transform:uppercase;letter-spacing:0.12em;">
                      Booking Confirmed
                    </p>
                    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#080c10;line-height:1.2;letter-spacing:-0.02em;">
                      You're in. 🎉
                    </h1>
                    <p style="margin:0 0 28px;font-size:15px;color:#444;line-height:1.5;">
                      Your ticket for <strong>${eventTitle}</strong> has been confirmed.
                    </p>

                    <!-- Event details box -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background:#f8fafc;border:1px solid #e8edf2;border-radius:12px;margin-bottom:28px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom:12px;">
                                <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Event</span><br/>
                                <span style="font-size:15px;font-weight:600;color:#080c10;line-height:1.4;">${eventTitle}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:10px;border-top:1px solid #e8edf2;padding-top:12px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="50%">
                                      <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Date</span><br/>
                                      <span style="font-size:13px;color:#333;">${formatDate(eventDate)}</span>
                                    </td>
                                    <td width="50%">
                                      <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Time</span><br/>
                                      <span style="font-size:13px;color:#333;">${formatTime(eventTime)}</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:10px;border-top:1px solid #e8edf2;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="50%">
                                      <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Location</span><br/>
                                      <span style="font-size:13px;color:#333;">${eventLocation}</span>
                                    </td>
                                    <td width="50%">
                                      <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Ticket</span><br/>
                                      <span style="font-size:13px;color:${isPaid ? "#d97706" : "#16a34a"};font-weight:600;">
                                        ${isPaid ? `₹${price.toLocaleString("en-IN")} · Paid` : "Free"}
                                      </span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Ticket ID + QR side by side -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background:#080c10;border-radius:12px;margin-bottom:28px;overflow:hidden;">
                      <tr>
                        <td style="padding:20px 24px;" width="55%">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:rgba(255,255,255,0.35);">
                            Ticket ID
                          </p>
                          <p style="margin:0 0 16px;font-size:14px;font-family:monospace;color:#ffffff;letter-spacing:0.08em;">
                            ${ticketIdShort}
                          </p>
                          <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:rgba(255,255,255,0.35);">
                            Scan at entry
                          </p>
                          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.4;">
                            Show this QR code at the event entrance for check-in.
                          </p>
                        </td>
                        <td style="padding:16px;text-align:right;" width="45%">
                          <img src="${qrUrl}" width="120" height="120"
                            alt="Ticket QR Code"
                            style="border-radius:8px;display:block;margin-left:auto;"/>
                        </td>
                      </tr>
                    </table>

                    <!-- CTAs -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                      <tr>
                        <td style="padding-right:8px;" width="50%">
                          <a href="${dashboardUrl}"
                            style="display:block;text-align:center;background:#008AF7;color:#ffffff;
                                   text-decoration:none;font-size:13px;font-weight:600;
                                   padding:12px 16px;border-radius:10px;">
                            View my tickets →
                          </a>
                        </td>
                        <td style="padding-left:8px;" width="50%">
                          <a href="${eventUrl}"
                            style="display:block;text-align:center;background:#f4f6f8;color:#333;
                                   text-decoration:none;font-size:13px;font-weight:600;
                                   padding:12px 16px;border-radius:10px;border:1px solid #e8edf2;">
                            View event
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border-top:1px solid #f0f0f0;padding:16px 32px;">
                <tr>
                  <td style="font-size:11px;color:#aaa;line-height:1.6;">
                    This email was sent to <strong>${data.to}</strong> because you booked a ticket on DevEvent.<br/>
                    DevEvent · Built for the dev community
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
