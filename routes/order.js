const express = require('express');
const order = express.Router();

class OrderRouter {
    constructor(bundle) {
        this.bundle = bundle;

        this.setRoute();
    }

    setRoute() {
        let { db, botly } = this.bundle;

        order.get('/health', (req, res) => {
            res.send('Hello there ;)')
        })

        order.post('/', (req, res) => {
            console.log('Request - ' + JSON.stringify(req.body))

            let body = req.body

            if (body.email && body.orderId) {
                db.createOrder(body, (status, user) => {
                    console.log('order status - ' + status)
                    console.log('order user - ' + JSON.stringify(user))

                    if (status == 'ordered' && user) {
                        botly.sendText({
                            id: user.sender,
                            text: `Thank you for your order. The order ID is ${body.orderId}, you can use it when contacting us with any questions related to your purchase.`
                        });

                        res.send({
                            status: 'success',
                            data: "~~~ The message was sent"
                        })
                    } else if (status == 'ordered_notified') {
                        res.send({
                            status: 'error',
                            data: "~~~ User was already notified"
                        })
                    } else {
                        res.send({
                            status: 'error',
                            data: "~~~ Can`t send order message to user. There is no such orderId or user in DB. After clicking on sendToMessanger button, this message will be sent"
                        })
                    }
                })
            } else {
                res.send({
                    status: 'error',
                    data: "~~~ There is no email or orderId in a request"
                })
            }
        });

        order.post('/approve', (req, res) => {
            console.log('Request - ' + JSON.stringify(req.body))

            db.createApprove(req.body.orderId, (status, user) => {
                console.log('order status - ' + status)
                console.log('order user - ' + JSON.stringify(user))

                if (status == 'approved' && user) {
                    botly.sendText({
                        id: user.sender,
                        text: `We've received your payment, your order will be on it's way soon.`
                    });

                    res.send({
                        status: 'success',
                        data: "~~~ The message was sent"
                    })
                } else if (status == 'doesnt_exist') {
                    res.send({
                        status: 'error',
                        data: "~~~ There is no such orderId in DB"
                    })
                } else {
                    res.send({
                        status: 'error',
                        data: "~~~ Can`t send message to user."
                    })
                }
            })
        })
    }

    getRoute() {
        return order;
    }
}



module.exports = OrderRouter;
