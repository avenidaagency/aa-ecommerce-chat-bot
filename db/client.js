const db = new (require('./controller'))('mongodb://techninjas:1gwN5L7boSs3@54.157.196.120:27017/techninjas');
const uuid = require('uuid/v1');

module.exports = {
    createRef: (sender, order, cb) => {
        db.getUser({ email: order.email }, (err, user) => {
            if (err) {
                let draftUser = db.getDraftUser()

                draftUser._id = uuid()
                draftUser.email = order.email
                draftUser.sender = sender
                draftUser.orders.push({
                    orderId: order.orderId,
                    status: 'reffered',
                    url: order.url,
                    checkApprove_ts: Date.now() + 1000 * 40
                })

                draftUser.save(err => {
                    err && console.log(err)
                })

                cb('reffered', draftUser)
            } else {
                let orderIndex = undefined

                user.orders.forEach((savedOrder, index) => {
                    if (savedOrder.orderId == order.orderId)
                        orderIndex = index
                });

                if (orderIndex != undefined) {
                    user.sender = sender
                    if (user.orders[orderIndex].status == 'pending_reffered') {
                        user.orders[orderIndex].status = 'ordered'
                        user.orders[orderIndex].checkApprove_ts = Date.now() + 1000 * 40

                        user.save(err => {
                            err && console.log(err)
                        })

                        cb('ordered', user)
                    } else {
                        cb('ordered_notified', user)
                    }
                } else {
                    user.sender = sender
                    user.orders.push({
                        orderId: order.orderId,
                        status: 'reffered',
                        url: order.url,
                        checkApprove_ts: Date.now() + 1000 * 40
                    })

                    user.save(err => {
                        err && console.log(err)
                    })

                    cb('reffered', user)
                }
            }
        })
    },

    createOrder: (order, cb) => {
        db.getUser({ email: order.email }, (err, user) => {
            if (err) {
                let draftUser = db.getDraftUser()

                draftUser._id = uuid()
                draftUser.email = order.email
                draftUser.orders.push({
                    orderId: order.orderId,
                    status: 'pending_reffered',
                    url: order.url,
                    products: order.products
                })

                draftUser.save(err => {
                    err && console.log(err)
                })

                cb('pending_reffered', user)
            } else {
                let orderIndex = undefined

                user.orders.forEach((savedOrder, index) => {
                    if (savedOrder.orderId == order.orderId)
                        orderIndex = index
                });

                if (orderIndex != undefined) {
                    if (user.orders[orderIndex].status == 'reffered') {
                        user.orders[orderIndex] = {
                            orderId: order.orderId,
                            status: 'ordered',
                            url: order.url,
                            products: order.products,
                            checkApprove_ts: user.orders[orderIndex].checkApprove_ts
                        }

                        user.save(err => {
                            err && console.log(err)
                        })

                        cb('ordered', user)
                    } else {
                        cb('ordered_notified', user)
                    }
                } else {
                    user.orders.push({
                        orderId: order.orderId,
                        status: 'pending_reffered',
                        url: order.url,
                        products: order.products
                    })

                    user.save(err => {
                        err && console.log(err)
                    })

                    cb('pending_reffered', user)
                }
            }
        })
    },

    createApprove: (orderId, cb) => {
        db.getUser({ orders: { $elemMatch: { orderId } } }, (err, user) => {
            console.log(user)
            if (err) {
                cb('doesnt_exist')
            } else {
                let orderIndex = undefined

                user.orders.forEach((savedOrder, index) => {
                    if (savedOrder.orderId == orderId)
                        orderIndex = index
                });

                if (user.orders[orderIndex].status == 'ordered') {
                    user.orders[orderIndex].status = 'approved'
                    delete user.orders[orderIndex].checkApprove_ts

                    user.save(err => {
                        err && console.log(err)
                    })

                    cb('approved', user)
                } else {
                    cb(user.orders[orderIndex].status)
                }
            }
        })
    },

    checkApprove: (orderId, cb) => {
        db.getUser({ orders: { $elemMatch: { orderId } } }, (err, user) => {
            if (err) {
                cb('doesnt_exist')
            } else {
                let orderIndex = undefined

                user.orders.forEach((savedOrder, index) => {
                    if (savedOrder.orderId == orderId)
                        orderIndex = index
                });

                if (user.orders[orderIndex].status == 'approved') {
                    user.save(err => {
                        err && console.log(err)
                    })

                    cb('approved', user, user.orders[orderIndex])
                } else {
                    cb(user.orders[orderIndex].status, user, user.orders[orderIndex])
                }
            }
        })
    },

    getApproves: (cb) => {
        db.getUsers({}, (err, users) => {
            //console.log(JSON.stringify(users))
            if (err) {
                cb('there is no users')
            } else {
                cb(undefined, users)
            }
        })
    }
    /*
        getAgents: (cb) => {
            db.getAgents(cb);
        },

        updateAgent: (agent, cb) => {
            db.updateAgent(agent, cb);
        },

        updateRequests: (bot, cb) => {
            db.updateRequests(bot, cb);
        } */
};
