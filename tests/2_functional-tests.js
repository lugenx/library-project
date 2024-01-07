/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("1 #example Test GET /api/books", function(done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function(_err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function() {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function() {
        test("2 Test POST /api/books with title", function(done) {
          chai
            .request(server)
            .post("/api/books")
            .send({
              title: "test book A",
            })
            .end(function(_err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, "response body should be an object");
              assert.strictEqual(res.body.title, "test book A");
              done();
            });
        });

        test("3 Test POST /api/books with no title given", function(done) {
          chai
            .request(server)
            .post("/api/books")
            .send({})
            .end(function(_err, res) {
              assert.equal(res.status, 200);
              assert.strictEqual(res.text, "missing required field title");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function() {
      test("4 Test GET /api/books", function(done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function(_err, res) {
            assert.isArray(res.body, "response body should be an array");
            for (let elem of res.body) {
              assert.property(elem, "title", "should have a title property");
              assert.property(
                elem,
                "commentcount",
                "should have a commentcount property"
              );
            }
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function() {
      let notExistedBookId = "659aa61415868af8d23b3daf";
      let existedBookId;
      before(function(done) {
        chai
          .request(server)
          .post("/api/books")
          .send({
            title: "test book B",
          })
          .end(function(err, res) {
            if (err) {
              done(err);
              return;
            }
            if (res.status === 200) {
              existedBookId = res.body._id;
            } else {
              console.log("'before' function failed to prepare test data");
            }
            done();
          });
      });

      test("5 Test GET /api/books/[id] with id not in db", function(done) {
        chai
          .request(server)
          .get(`/api/books/${notExistedBookId}`)
          .end(function(_err, res) {
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.text, "no book exists");
            done();
          });
      });

      test("6 Test GET /api/books/[id] with valid id in db", function(done) {
        chai
          .request(server)
          .get(`/api/books/${existedBookId}`)
          .end(function(_err, res) {
            assert.strictEqual(res.status, 200);
            assert.isObject(res.body);
            assert.strictEqual(res.body._id, existedBookId);
            assert.property(res.body, "title", "has title property");
            assert.property(res.body, "comments", "has comments property");
            done();
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function() {
        let notExistedBookId = "659aa61415868af8d23b3daf";
        let existedBookId;

        before(function(done) {
          chai
            .request(server)
            .post("/api/books")
            .send({
              title: "test book C",
            })
            .end(function(err, res) {
              if (err) {
                done(err);
                return;
              }
              if (res.status === 200) {
                existedBookId = res.body._id;
              } else {
                console.log("'before' function failed to prepare test data");
              }
              done();
            });
        });

        test("7 Test POST /api/books/[id] with comment", function(done) {
          chai
            .request(server)
            .post(`/api/books/${existedBookId}`)
            .send({
              comment: "test comment 1",
            })
            .end(function(_err, res) {
              assert.strictEqual(res.status, 200);
              assert.isObject(res.body);
              assert.strictEqual(res.body._id, existedBookId);
              assert.strictEqual(res.body.title, "test book C");
              assert.isArray(res.body.comments);
              assert.strictEqual(res.body.comments[0], "test comment 1");
              done();
            });
        });

        test("8 Test POST /api/books/[id] without comment field", function(done) {
          chai
            .request(server)
            .post(`/api/books/${existedBookId}`)
            .send({
              comment: "",
            })
            .end(function(_err, res) {
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.text, "missing required field comment");
              done();
            });
        });

        test("9 Test POST /api/books/[id] with comment, id not in db", function(done) {
          chai
            .request(server)
            .post(`/api/books/${notExistedBookId}`)
            .send({
              comment: "test comment 2",
            })
            .end(function(_err, res) {
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.text, "no book exists");
              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function() {
      let notExistedBookId = "659aa61415868af8d23b3daf";
      let existedBookId;

      before(function(done) {
        chai
          .request(server)
          .post("/api/books")
          .send({
            title: "test book C",
          })
          .end(function(err, res) {
            if (err) {
              done(err);
              return;
            }
            if (res.status === 200) {
              existedBookId = res.body._id;
            } else {
              console.log("'before' function failed to prepare test data");
            }
            done();
          });
      });
      test("10 Test DELETE /api/books/[id] with valid id in db", function(done) {
        chai
          .request(server)
          .delete(`/api/books/${existedBookId}`)
          .end(function(_err, res) {
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.text, "delete successful");
            done();
          });
      });

      test("11 Test DELETE /api/books/[id] with  id not in db", function(done) {
        chai
          .request(server)
          .delete(`/api/books/${existedBookId}`)
          .end(function(_err, res) {
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.text, "no book exists");
            done();
          });
      });
    });
  });
});
