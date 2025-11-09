require('dotenv').config();
const { sendMail } = require('./lib/mailer');

async function main(){
  try{
    const info = await sendMail({
      to: process.env.SMTP_USER,
      subject: 'Zimba SMTP test',
      text: 'This is a test email sent from the Zimba backend using configured SMTP.',
      html: '<p>This is a test email sent from the Zimba backend using configured SMTP.</p>'
    });
    console.log('Message sent OK:', info && info.messageId ? info.messageId : info);
  } catch (err){
    console.error('Send failed:', err);
    process.exitCode = 1;
  }
}

main();
