import redisClient from "../utils/redis";

import dbCli from "../utils/db";


class AppController {
  static getStatus(req, res) {
    if (redisClient.isAlive() && dbCli.isAlive()) {
      res.status(200).send({ redis: true, db: true });
    }
  }

  static async getStats(req, res) {
    const usersNum = await dbCli.nbUsers();
    const filesNum = await dbCli.nbFiles();
    res.status(200).send({ "users": usersNum, "files": filesNum })
  }
}

export default AppController;
