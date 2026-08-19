import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendIncidentNotification = async ({emails,type,desciption,severity}) => {
  const {error,data} = await resend.emails.send({
     from: "CampusShield <onboarding@resend.dev>",
        to: emails,
        subject: `🚨 Campus Alert: ${type} incident`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

                <h1>🚨 CampusShield Alert</h1>

                <p>
                    A new incident has been <strong>verified</strong>
                    on campus.
                </p>

                <hr>

                <h2>${type}</h2>

                <p>
                    <strong>Severity:</strong> ${severity}
                </p>

                <p>
                    <strong>Description:</strong>
                </p>

                <p>${description}</p>

                <hr>

                <p>
                    Please stay alert and follow any instructions
                    from your campus authorities.
                </p>

                <p>
                    <strong>CampusShield</strong>
                </p>

            </div>
        `
  });
  if(error){
    throw error
  }

  return data;
}