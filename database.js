require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");

//Db connection
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database;

async function connectDb() {
  try {
    await client.connect();
    database = client.db("quality-assurance-cert-projects");
    return database;
  } catch (err) {
    console.log("MongoDB Connection Error: ", err);
    throw err;
  }
}

async function getCollection() {
  try {
    const response = database.collection("books");

    return response;
  } catch (err) {
    console.log("MongoDB error in getCollection");
  }
}

module.exports = {
  connectDb,
  getCollection,
};
