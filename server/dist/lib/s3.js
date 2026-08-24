"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = uploadToS3;
exports.deleteFromS3 = deleteFromS3;
const client_s3_1 = require("@aws-sdk/client-s3");
const logger_1 = __importDefault(require("./logger"));
// Validate required env vars at startup so we fail fast if S3 isn't configured
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.S3_BUCKET;
if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET) {
    throw new Error("Missing required AWS env vars (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET)");
}
// Create one shared S3 client - reused across all uploads/deletes
const s3Client = new client_s3_1.S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});
// Upload a file buffer to S3 and return the key
async function uploadToS3(key, buffer, contentType) {
    try {
        await s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }));
    }
    catch (err) {
        logger_1.default.error("[s3.uploadToS3]", err);
        throw err;
    }
}
// Delete a file from S3 by its key
async function deleteFromS3(key) {
    try {
        await s3Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
        }));
    }
    catch (err) {
        logger_1.default.error("[s3.deleteFromS3]", err);
        throw err;
    }
}
//# sourceMappingURL=s3.js.map