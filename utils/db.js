import { MongoClient } from 'mongodb';

class DBClient {
  // Constructor - Used to create a MongoDB client
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    // Create database URL
    this.url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(this.url, { useUnifiedTopology: true });
    this.dbName = database;
    this.isConnected = false;
    this.db = null; // Initialize db to null
    this.connect();
  }

  // Asynchronous function to connect to database
  async connect() {
    try {
      await this.client.connect(); // Trying to connect to the database
      this.isConnected = true;
      this.db = this.client.db(this.dbName); // Store the database reference
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
      this.isConnected = false; // Set to false if connection fails
    }
  }

  // Function to check if the database connection is still active
  isAlive() {
    return this.isConnected; // Return the connection status
  }

  // Asynchronous function to get the number of documents in the 'users' collection
  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('Not connected to the database');
    }
    const count = await this.db.collection('users').countDocuments();
    return count;
  }

  // Asynchronous function to get the number of documents in the 'files' collection
  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('Not connected to the database');
    }
    const count = await this.db.collection('files').countDocuments();
    return count;
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
