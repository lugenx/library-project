/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const { getCollection } = require("../database.js");
const { ObjectId } = require("mongodb");
module.exports = function(app) {
  app
    .route("/api/books")
    .get(async function(_req, res) {
      try {
        const collection = await getCollection();
        const foundBooks = await collection.find({}).toArray();
        const books = foundBooks.map((book) => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length,
        }));
        return res.json(books);
        //response will be array of book objects
        //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      } catch (error) {
        console.log(error);
      }
    })

    .post(async function(req, res) {
      try {
        let title = req.body.title;
        if (!title) return res.send("missing required field title");

        const collection = await getCollection();
        const response = await collection.insertOne({
          title: title,
          comments: [],
        });

        if (response.acknowledged) {
          const book = await collection.findOne({ _id: response.insertedId });
          return res.json(book);
        } else {
          throw Error("MongoDB could not insert new document");
        }
        //response will contain new book object including atleast _id and title
      } catch (error) {
        console.log(error);
      }
    })

    .delete(async function(_req, res) {
      try {
        const collection = await getCollection();
        const deletion = await collection.deleteMany({});
        console.log(deletion.acknowledged);
        if (deletion.acknowledged) {
          return res.send("complete delete successful");
        } else {
          throw Error("MongoDB could not delete documents");
        }
      } catch (error) {
        console.log(error);
      }
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(async function(req, res) {
      try {
        let bookid = new ObjectId(req.params.id);
        const collection = await getCollection();
        const book = await collection.findOne({ _id: bookid });
        if (!book) return res.send("no book exists");
        res.json(book);
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      } catch (error) {
        console.log(error);
      }
    })

    .post(async function(req, res) {
      try {
        let bookid = new ObjectId(req.params.id);
        let comment = req.body.comment;
        if (!comment) return res.send("missing required field comment");
        const collection = await getCollection();

        const updatedBook = await collection.findOneAndUpdate(
          { _id: bookid },
          {
            $push: { comments: comment },
          }
        );
        if (updatedBook) {
          const book = await collection.findOne({ _id: bookid });
          return res.json(book);
        } else {
          return res.send("no book exists");
        }
        //json res format same as .get
      } catch (error) {
        console.log(error);
      }
    })

    .delete(async function(req, res) {
      try {
        let bookid = new ObjectId(req.params.id);
        const collection = await getCollection();
        const deletion = await collection.deleteOne({ _id: bookid });

        if (deletion.deletedCount < 1) return res.send("no book exists");
        if (deletion.acknowledged) {
          return res.send("delete successful");
        }
      } catch (error) {
        console.log(error);
      }
      //if successful response will be 'delete successful'
    });
};
