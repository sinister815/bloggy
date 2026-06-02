import conf from '../../conf/conf';
import { Client, Account, ID } from "appwrite";


export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
            
    }

    async createAccount({email, password, name}) {
        try {
            const userAccount = await this.account.create({
                userId: ID.unique(),
                email,
                password,
                name
            });
            if (userAccount) {
                // call another method
                return this.login({email, password}); //login() expects an object, so we pass email and password as object properties.
            } else {
               return  userAccount;
            }
        } catch (error) {
            throw error;
        }
    }

    async login({email, password}) {
        try {
            return await this.account.createEmailPasswordSession({
                email,
                password
            })
        } catch (error) {
            throw error;
        }
    }

    // login() is used to sign in a user, but getCurrentUser() is used later to check if a user is already logged in and fetch their current session data.

    async getCurrentUser() {
        try {
            const user =  await this.account.get();
            console.log("user ki lelo: ",user)
            return user
        } catch (error) {
            // console.log("Appwrite serive :: getCurrentUser :: error", error);
            console.log("user not logged in ");

        }

        return null;
    }

    async logout() {

        try {
            await this.account.deleteSessions();
        } catch (error) {
            console.log("Appwrite serive :: logout :: error", error);
        }
    }
}

const authService = new AuthService();

export default authService

