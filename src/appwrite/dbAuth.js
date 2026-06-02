import { Client, ID, TablesDB,Storage } from "appwrite";
import conf from "../../conf/conf";
export class DbAuthService {
    client = new Client();
    tablesDB;
    bucket;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.tablesDB = new TablesDB(this.client);
        this.bucket = new Storage(this.client);
    }

    async createPost({ title, slug, content, featuredImage, status, userId }) {
        try {
            return await this.tablesDB.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteTableId,
                slug,
                data: {
                    title,
                    content,
                    featuredImage,
                    status,
                    userId
                }
            })
        } catch (error) {
            console.log("appwrite service:: createPost :: error ", error);
        }
    }

    async updatePost(slug, { title, content, featuredImage, status }) {
        try {
            return await this.tablesDB.updateRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteTableId,
                slug,
                data: {
                    title,
                    content,
                    featuredImage,
                    status
                }
            })
        } catch (error) {
            console.log("appwrite service :: updatePost :: error ", error);
        }
    }

    async deletePost(slug) {
        try {
            return await this.tablesDB.deleteRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteTableId,
                slug,
            })
        } catch (error) {
            console.log("appwrite service :: deletePost :: error ", error);
            return false
        }
    }

    async getPost(slug) {
        try {

            return await this.tablesDB.getRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteTableId,
                slug,
            })
            
        } catch (error) {
            console.log("appwrite service :: getPost :: error ", error);
            return false
        }
    }

    async getPosts() {
        try {
            return await this.tablesDB.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteTableId,
            })
        } catch (error) {
            console.log("appwrite service :: getPosts :: error ", error);
            return false
        }
    }

    //Upload file to appwrite storage and return file details

    async uploadFile(file){
        try {
            return await this.bucket.createFile({
                bucketId : conf.appwriteBucketId,
                fileId : ID.unique(),
                file
            })
        
            }
         catch (error) {
            console.log("appwrite service :: uploadFFile :: error ", error);
            return false
        }
    }

    async deleteFile(fileId){
        try {
            return await this.bucket.deleteFile({
                bucketId : conf.appwriteBucketId,
                fileId
            })


        } catch (error) {
            console.log("appwrite service :: deleteFile :: error ", error);
            return false
        }
    }

     getFilePreview(fileId){
        try {
            return this.bucket.getFilePreview({
                bucketId : conf.appwriteBucketId,
                fileId
            })
        } catch (error) {
            console.log("appwrite service :: getFilePreview :: error ", error);
            return false
        }
    }

}

const dbAuthService = new DbAuthService();

export default dbAuthService;