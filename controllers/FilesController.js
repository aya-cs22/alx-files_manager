const { redisClient } = require('../utils/redis');
const { dbClient } = require('../utils/db');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { redisClient } = require('../utils/redis');
const { dbClient } = require('../utils/db');

class FilesController {
    static async postUpload(req, res) {
        // Retrieve the X-Token from the header
        const token = req.headers['x-token'];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Retrieve the user ID from Redis
        const userId = await redisClient.get(`auth_${token}`);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name, type, parentId, isPublic = false, data } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }

        if (!type || !['folder', 'file', 'image'].includes(type)) {
            return res.status(400).json({ error: 'Missing type' });
        }

        if (type !== 'folder' && !data) {
            return res.status(400).json({ error: 'Missing data' }); 
        }

        if (parentId) {
            const parentFile = await dbClient.client.db(dbClient.database).collection('files').findOne({ _id: parentId });

            if (!parentFile) {
                return res.status(400).json({ error: 'Parent not found' });
            }

            if (parentFile.type !== 'folder') {
                return res.status(400).json({ error: 'Parent is not a folder' }); 
            }
        }

        if (type === 'folder') {
            const newFolder = {
                userId,
                name,
                type,
                isPublic,
                parentId: parentId || 0
            };

            const result = await dbClient.client.db(dbClient.database).collection('files').insertOne(newFolder);
            return res.status(201).json(result.ops[0]);
        }

        // If type is "file" or "image", i create the file
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const absolutePath = path.join(folderPath, uuidv4()); // Create  path using a UUID
        // Create the folder if it does not exist
        fs.mkdirSync(folderPath, { recursive: true });

        // Store data in a file
        fs.writeFileSync(absolutePath, Buffer.from(data, 'base64')); // Save the data as a file

        // Add the new document to the database
        const newFile = {
            userId,
            name,
            type,
            isPublic,
            parentId: parentId || 0,
            localPath: absolutePath
        };

        const result = await dbClient.client.db(dbClient.database).collection('files').insertOne(newFile);
        return res.status(201).json(result.ops[0]); // Return the new file
    }
    static async getShow(req, res) {
        const token = req.headers['x-token'];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = await redisClient.get(`auth_${token}`); 

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        const file = await dbClient.client.db(dbClient.database).collection('files').findOne({ _id: id, userId }); // Search for the file in the database

        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        return res.json(file); // Return the file document
    }

    // A function to retrieve all file documents
    static async getIndex(req, res) {
        const token = req.headers['x-token'];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' }); 
        }

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get page queries and parent ID
        const { parentId = 0, page = 0 } = req.query; // Set parentId and page to the default value

        // Browsing settings
        const limit = 20; // Maximum number of elements per page
        const skip = page * limit; // Skip previous items

        // Retrieve file documents from the database
        const files = await dbClient.client.db(dbClient.database).collection('files')
            .find({ userId, parentId })
            .skip(skip) 
            .limit(limit) 
            .toArray(); 
        return res.json(files); // Returns a list of files
    }
}

module.exports = FilesController;
