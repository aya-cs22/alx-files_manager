import redisClient from '../utils/redis';

import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      res.status(200).send({ redis: true, db: true });
    }
  }

  static async getStats(req, res) {
    const usersNum = await dbClient.nbUsers();
    const filesNum = await dbClient.nbFiles();
    res.status(200).send({ users: usersNum, files: filesNum });
  }
}

export default AppController;
