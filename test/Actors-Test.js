const app = require("../app");
const chai = require("chai");
const sinon = require("sinon");
const chaiHttp = require("chai-http");
var mongoose = require('mongoose'),
Actor = mongoose.model('Actors');

const { expect } = chai;
chai.use(chaiHttp);

describe("Actors Tests", () => {

  describe("Get Actors tests", () => {
    let dbFind;
    beforeEach(() => {
      const actors = [
        new Actor({
          "preferredLanguage": "en",
          "role": ["EXPLORER"],
          "validated": false,
          "name": "NewExplorerName1",
          "surname": "NewExplorerSurname1",
          "email": "explorer123@fakemail11.com",
          "password": "$2b$05$fMPnmaTx6doE/ISNc/I1leKTQcwAegVmzMP6WtKZ2xKeFP89kOxvO",
          "phone": "+34612345679",
          "address": "myAddress"
        }),
        new Actor({
          "preferredLanguage": "en",
          "role": ["MANAGER"],
          "validated": false,
          "name": "NewManagerName1",
          "surname": "NewManagerSurname1",
          "email": "manager123@fakemail11.com",
          "password": "$2b$05$fMPnmaTx6doE/ISNc/I1leKTQcwAegVmzMP6WtKZ2xKeFP89kOxvO",
          "phone": "+34612345679",
          "address": "myAddress"
        }),
      ];
      dbFind = sinon.spy(Actor, "find");

    });
    afterEach(() => {
      dbFind.restore();
    });

    it("Get Actors", done => {
      chai
        .request(app)
        .get("/v1/actors")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect('Content-Type', /json/);
          if (err) done(err);
          else done();
        });
    });
  });

  describe("Post Actors tests", () => {
    const explorer = {
      "preferredLanguage": "en",
      "role": ["EXPLORER"],
      "validated": false,
      "name": "NewExplorerName1",
      "surname": "NewExplorerSurname1",
      "email": "explorer123@fakemail11.com",
      "password": "$2b$05$fMPnmaTx6doE/ISNc/I1leKTQcwAegVmzMP6WtKZ2xKeFP89kOxvO",
      "phone": "+34612345679",
      "address": "myAddress"
    };

    const manager = {
      "preferredLanguage": "en",
      "role": ["MANAGER"],
      "validated": false,
      "name": "NewManagerName2",
      "surname": "NewManagerSurname2",
      "email": "manager124@fakemail11.com",
      "password": "$2b$05$fMPnmaTx6doE/ISNc/I1leKTQcwAegVmzMP6WtKZ2xKeFP89kOxvO",
      "phone": "+34612345679",
      "address": "myAddress"
    };
  
    let dbInsert;

    beforeEach(() => {
      dbInsert = sinon.spy(Actor, "create");
    })

    afterEach(() => {
      dbInsert.restore();
    });

    it("Post Actor: Explorer with an user that haven't been authenticated", done => {
      chai
        .request(app)
        .post("/v1/actors")
        .send(explorer)
        .end((err, res) => {
          expect(res).to.have.status(200);
          if (err) done(err);
          else done();
        });
    });

    it("Post Actor: Manager as an Administrator", done => {
      chai
        .request(app)
        .post("/v1/actors")
        .set({ role: "ADMINISTRATOR" })
        .send(manager)
        .end((err, res) => {
          expect(res).to.have.status(200);
          if (err) done(err);
          else done();
        });
    });

    it("Post Actor: Explorer as an Administrator", done => {
      chai
        .request(app)
        .post("/v1/actors")
        .set({ role: "ADMINISTRATOR" })
        .send(explorer)
        .end((err, res) => {
          expect(res).to.have.status(403);
          if (err) done(err);
          else done();
        });
    });

    it("Post Actor: Manager with an user without role", done => {
      chai
        .request(app)
        .post("/v1/actors")
        .send(manager)
        .end((err, res) => {
          expect(res).to.have.status(403);
          if (err) done(err);
          else done();
        });
    });
  });
});

