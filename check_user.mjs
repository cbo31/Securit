import prisma from './prisma.js'

//Vérifier si un utilisateur est dans la base de donnée ou non 

export function checkUser( {email, database} ) {
    database = prisma.database;
    const user = database.findUnique({
        where: {email: email},
    })

    console.log("Base de donnée 'user'", user);
};