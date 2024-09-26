/* This code defines a class called RedisClient to interact with a Redis database.
It contains functions to create a Redis client, check the connection status,
and retrieve, store, and delete values from Redis using given keys.
*/

import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Create a new Redis client instance
    this.client = redis.createClient({
      host: '127.0.0.1',
      port: 6379,
    });

    // Promisify the Redis get method
    this.getAsync = promisify(this.client.get).bind(this.client);

    // Set up an event listener for 'error' events on the Redis client
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });
  }

  // Method to check if the Redis client is connected to the server
  isAlive() {
    return this.client.connected; // Returns true if connected
  }

  // Method to get the value of a key from Redis
  async get(key) {
    return this.getAsync(key);
  }

  // Method to  set a key-value pair in Redis with an expiration time
  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  // Method to  delete a key from Redis
  async del(key) {
    this.client.del(key);
  }
}
// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
