import pandas as pd
import yagmail
import getpass
import os

# === CONFIGURATION ===
excel_file = "HR_data.xlsx"       # Excel file with Email column
pdf_attachment = "resume.pdf"       # PDF file to attach (resume)

# === READ EMAILS FROM EXCEL ===
df = pd.read_excel(excel_file)
emails = df["Email"].dropna().astype(str).tolist()

# === SAVE EMAILS TO FILE ===
with open("output.email", "w") as f:
    for email in emails:
        f.write(email + "\n")

print(f"📥 Extracted {len(emails)} emails. Saved to output.email")

# === GET USER CREDENTIALS ===
sender_email = input("Enter your email address: ")
app_password = getpass.getpass("Enter your Gmail app password (App Password): ")
yag = yagmail.SMTP(sender_email, app_password)

# === VALIDATE ATTACHMENT ===
if not os.path.exists(pdf_attachment):
    print(f"❌ PDF attachment not found: {pdf_attachment}")
    exit()

# === SEND EMAIL ===
if emails:
    selected_emails = emails[:3]
    for recipient in selected_emails:
        yag.send(
        to=recipient,
        subject="Your Resume from Python Bot 📨",
        contents=f"Hi,\n\nPlease find my resume attached.\n\nRegards,\n{sender_email}",
        attachments=pdf_attachment
    )
        print(f"✅ Email with attachment sent to {recipient}")

    yag = yagmail.SMTP(sender_email, app_password)

    yag.send(
        to=recipient,
        subject="Your Resume from Python Bot 📨",
        contents=f"Hi,\n\nPlease find my resume attached.\n\nRegards,\n{sender_email}",
        attachments=pdf_attachment
    )

    print(f"✅ Email with attachment sent successfully to {recipient}")
else:
    print("❌ No valid emails found in Excel.")

