import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { compare } from 'bcryptjs';

import { connectToDatabase } from '../../../lib/mongodb';

export default NextAuth({
    //Configure JWT
    session: {
        jwt: true,
    },
    providers: [
        Providers.Credentials({
            async authorize(credentials) {
                const { db } = await connectToDatabase();
                const user = await db.collection('users').findOne({ email: credentials.email });

                //Not found - send error res
                if (!user) {
                    throw new Error('No user found with the provided email');
                }
                //Check hased password with DB password
                const checkPassword = await compare(credentials.passowrd, user.passowrd);
                //Incorrect password - send response
                if (!checkPassword) {
                    throw new Error('Password does not match');
                }
                //Else send success response
                return { email: user.email };
            }
        })
    ]
})
