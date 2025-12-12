// app.js
import express from 'express'
import cookieParser from 'cookie-parser'
import prisma from './prisma.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendMail } from "./mail.mjs"
import { generateCode } from './generate_code.js'



const app = express()
const email2code = {}; //pour pouvoir faire correspondre un code a un email
const secret = process.env.SECRET

app.set('view engine', 'ejs')



// --------------------  SPARSERS  ----------------------------------

app.use('/assets', express.static('./assets'))
app.use(express.urlencoded( {extended: true} )) //permet de sparser les requetes et renvoie dans un body
app.use(cookieParser())  // permet de sparser les cookies 



// --------------------  REQUEST TO DISPLAY PAGE  -------------------

app.get('/', (req, res) => {
   res.render('login', { error_message: "" })
});
// app.get('/verify_code', (req, res) => {
//    res.render('verify_code', { error_message: "" })
// })
app.get('/forgotten_password_verify', (req, res) => {
   res.render('forgotten_password_verify', { error_message: "" })
})
app.get('/register', (req, res) => {
   res.render('register', { error_message: "" })
})
// app.get('/register_verify', (req, res) => {
//    res.render('register_verify', { error_message: "" })
// })
// app.get('/set_name_password', (req, res) => {
//    res.render('set_name_password', { error_message: "" })
// })
app.get('/forgotten_password', (req, res) => {
   res.render('forgotten_password', { error_message: "" })
});

app.get('/reset_password', (req, res) => {
   res.render('reset_password', { error_message: "" })
})



// app.post('/check_credentials', async (req, res) => {
//    await sendMail( {
//       to: "clementdufullstack@yopmail.com",
//       subject: "test_fonction",
//       html: "Test envoie via fonction"
//    });
// })



// --------------------  LOGIN  ----------------------------------

// Verifier si l'utilisateur est deja inscrit 
app.post("/check_login", async (req, res) => {
   const { email, password } = req.body;
   const user = await prisma.user.findUnique( { where: { email } });

   const checkPwd = await bcrypt.compare(password, user.password);  // retourne un boolean si le mdp est vrai par rapport au hash

   const code = generateCode();
   if ( checkPwd ) {
      // sendMail( {
      //    to: "clementfullstack@yopmail.com",
      //    subject: "Code de Verification",
      //    html: `Votre code est : ${code}`,
      // });
      email2code[email] = code;
      console.log("email2code :", email2code);

      res.cookie('codeWait', "dummy", { maxAge: 60 * 1000 } );
      res.render("login_verify", { email, error_message: ""});
   } else {
      res.render("login", { error_message: "Mot de passe et/ou email incorrect" });
   }
});


// // token authenticator 
// app.use( async (req, res, next) => {
//    const cookie = req.cookies;
//    const token = cookie.sessionToken.value;

//    if ( token ) {
//       try {
//          const payload = jwt.verify(token, secret);
//       } catch (error) {
//          console.log("Signature Invalide");
//       }
//       next();
//    } else {
//       res.sendStatus(403);
//    };
// });


// envoyer un code de securite pour valider la connexion
app.post("/check_login_code", async (req, res) => {
   const { email, code } = req.body;
   const cookie = req.cookies;

   const user = await prisma.user.findUnique( { where: { email } });
   const token = jwt.sign( { sub: user.id}, secret);


   if ( 'codeWait' in cookie ) {
      if ( email2code[email] === parseInt(code) ) {
         res.cookie( "sessionToken", token, { httpOnly: true, maxAge: 3600 * 1000});
         res.send("Code bon")
      } else {
         res.render("login_verify", { email, error_message:"Code incorrect"});
      };
   } else {
      res.render("login_verify", { email, error_message:"Code expiré"});
   };
})







// ----------------  CREATE ACCOUNT (REGISTER)  -------------------

// envoyer un code par mail pour vérifier l'email
app.post("/check_register", async (req, res) => {
   const email = req.body.email.toLowerCase(); // recuperer le mail entrer depuis '/register'
   
   const user = await prisma.user.findUnique({ // permet de chercher si dans la base de donne il y a un utilisateur avec ce mailno
      where: { email },
   });
   console.log("user", user);

   const code = generateCode();
   console.log("code genere :", code);
   if ( user === null) { // Envoyer un mail si l'utilisateur n'est pas present, findUnique() renvoie null si il trouve pas ce qu'on lui demande
      // sendMail( {
      //    to: "clementfullstack@yopmail.com",
      //    subject: "Code de Verification",
      //    html: `Votre code est : ${code}`,
      // });
      email2code[email] = code; // associer un code aleatoire au mail pour la verification
      
      res.cookie('codeWait', "dummy", { maxAge: 60 * 1000 } );
      res.render("register_verify", { email, error_message : "", attempt: 0 }) // renvoie le mail + un message d'erreur vide pour la prochaine requete
   } else {
      res.render("register", { error_message: "Un compte est déjà associé a cet email" });
   }
});

// verifier le code fournit par mail 
app.post("/check_verify_code", async (req, res) => {
   const { email, code, attempt } = req.body; // permet de recupere le mail avec le code qui sera rentre
   const cookie = req.cookies;
   

   console.log("code :", code);
   console.log("cookie :", cookie);

   if ('codeWait' in cookie) { //verifier si le cookie est present 
      if ( attempt < 3 ) {
         if ( email2code[email] === parseInt(code)) { // relancer la verification si le code entre != du code associe au mail
            res.render("set_name_password", { email, error_message: ""});
         } else {
            res.render("register_verify", { 
               email, 
               error_message: `Code Incorrect, il vous reste ${3 - attempt} essais`, 
               attempt: Number(attempt) + 1
            });
         } 
      } else {
         res.render("register", { email, error_message: "Nombre d'essai expiré"} );
      }
   } else { // si code expiré on change de page
      res.render("register", { email, error_message: "Code expiré"} );
   }
});

// save account in database
app.post("/save_new_account", async (req,res) => {
   const { email, name, password, confirmPwd} = req.body;

   if (password !== confirmPwd) {
      res.render("set_name_password", { email, name, password, error_message : "Mot de passe différents"})
   } else {
      const hashPwd = await bcrypt.hash(password, 5);  // hash le mot de passe pour plus de securite
      const createUser = await prisma.user.create({ data: { email: email, name: name, password: hashPwd}});  // ajoute le nv compte à la db
      res.render("login", { error_message: ""});
   };
});



// --------------------  MODIFY PASSWORD  ----------------------------------

// envoyer un code pour verifier si l'email
app.post("/check_email_pwd", async (req, res) => {
   const { email } = req.body;
   const user = await prisma.user.findUnique( { where: { email } });

   const code = generateCode();
   if ( user.email === email ) {
      // sendMail( {
      //    to: "clementfullstack@yopmail.com",
      //    subject: "Code de Verification",
      //    html: `Votre code est : ${code}`,
      // });
      email2code[email] = code;
      console.log("email2code :", email2code);

      res.cookie('codeWait', "dummy", { maxAge: 60 * 1000 } );
      res.render("forgotten_password_verify", { email, error_message: ""});
   } else {
      res.render("forgotten_password", { error_message: "Aucun compte est associé à cet email" });
   }
});

// Verifier le code envoye par mail
app.post("/check_email_pwd_code", async (req, res) => {
   const{ email, code } = req.body;
   const cookie = req.cookies;
   
   console.log(email2code)
   if ( 'codeWait' in cookie ) {
      if ( email2code[email] === parseInt(code) ) {
         res.render("reset_password", { email });
      } else {
         res.render("forgotten_password_verify", { email, error_message:"Code incorrect"});
      };
   } else {
      res.render("forgotten_password_verify", { email, error_message:"Code expiré"});
   };




});




/*
app.get('/users/:id', async (req, res) => {
   const id = parseInt(req.params.id)
   const user = await prisma.User.findUnique({
      where: { id }
   })
   res.send(user)
})

app.get('/users', async (req, res) => {
   const users = await prisma.User.findMany({})
   res.send(users)
})
*/

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
   console.log(`Server listening on port http://localhost:${PORT}`)
})
