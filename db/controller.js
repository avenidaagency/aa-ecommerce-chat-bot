'use strict'
const Init = require('./init.js');

class Controller {
    constructor(url) {
        const init = new Init(url);

        this.User = init.User;
    }

    getUsers(cond, cb) {
        this.User.find(cond, (err, users) => {
            if (err) {
                console.log(`There is some error, while loading agents: `, err);
                cb(err);
            }
            else {
                if (users.length) {
                    cb(undefined, users);
                } else {
                    cb('There is no users')
                }
            }
        })
    }

    getUser(cond, cb) {
        this.User.findOne(cond, (err, user) => {
            if (err) {
                console.log(`There is some error, while loading agents: `, err);
                cb(err);
            }
            else {
                if (user) {
                    cb(undefined, user);
                } else {
                    cb('There is no such user')
                }
            }
        })
    }

    getDraftUser() {
        return new this.User()
    }

    createOrder(cb) {
        this.Agent.find({}, '-json.raw', (err, agents) => {
            if (err) {
                console.log(`There is some error, while loading agents: `, err);
                cb(err);
            }
            else {
                cb(err, agents);
            }
        })
    }

    /* updateAgent(agent, cb) {
        this.Agent.findByIdAndUpdate(agent._id, agent, { upsert: true, new: true }, (err, newAgent) => {
            if (err) {
                console.log('There is some error, while upfating agent: ' + err);
                cb(err);
            }
            else {
                // console.log('From DB:');
                // console.log(newAgent);
                cb(undefined, newAgent);
            }
        })
    }

    getAgent(agentID, cb) {
        this.Agent.findById(agentID, (err, agent) => {
            if (err) {
                console.log(`There is some error, while searching agent with ID(${agentID}): ` + err);
                cb(err);
            }
            else {
                cb(err, agent);
            }
        })
    }

    getAgents(cb) {
        this.Agent.find({}, '-json.raw', (err, agents) => {
            if (err) {
                console.log(`There is some error, while loading agents: `, err);
                cb(err);
            }
            else {
                cb(err, agents);
            }
        })
    }

    updateRequests(agent, cb) {
        this.Agent.update({ _id: agent._id }, { $push: { requests: Date.now() } }, (err, agent) => {
            cb(agent)
        });
    } */
}

module.exports = Controller;