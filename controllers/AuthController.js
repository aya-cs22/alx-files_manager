import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';

import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) { // sign-in the user by generating a new authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(400).json({ error: 'Missing or malformed Authorization header' });
    }
    // Remove the "Basic" Prefix
    // Split "Basic <encoded string>" and retrieves the encoded part
    const base64Credentials = authHeader.split(' ')[1];
    // Decode the Base64 string
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = decodedCredentials.split(':');
    // hashing the pass to compare
    const hashedPassword = sha1(password);
    const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Generate a new token
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id, 86400);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) { // sign-out the user
    const token = req.headers['X-Token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }

  static async getMe(req, res) {
    const token = req.headers['X-Token'];
    const userId = await redisClient.get(`auth_${token}`);
    const userCollection = dbClient.db.collection('users');
    const user = await userCollection.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default AuthController;
