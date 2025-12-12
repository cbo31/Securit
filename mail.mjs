import nodemailer from 'nodemailer'

export function sendMail( {from = 'buisson@enseeiht.fr', to, subject, text, html} ) {
    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net" ,
      port: "587" ,
      secure: false,
      auth: {
         user: "apikey",
         pass: process.env.SEND_PWD, 

      },
      name: "dufullstack.fr"   
   });
   transporter.sendMail( {from, to, subject, text, html} );
};