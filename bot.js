class Bot {
    constructor(bundle) {
        this.bundle = bundle;

        this._handleUpdate()
    }

    _handleUpdate() {
        let { botly, db, base64 } = this.bundle

        botly.on("message", (senderId, message, data) => {
            console.log(`\n[INFO] Message from ${senderId}:\n`, JSON.stringify(message))
            console.log('\n[INFO] Data:\n', JSON.stringify(data))

            if (/policy/g.test(data.text)) {
                botly.sendText({
                    id: senderId,
                    text: 'Here are our terms of service: http://techninjas.shop/fit-control/main/terms'
                })
            } else {
                botly.sendText({
                    id: senderId,
                    text: "This bot's function is to support customers of Techninjas online shop. Please visit http://techninjas.shop/fit-control/main/index to place your order"
                })
            }
        })

        botly.on("postback", (sender, message, postback, ref) => {
            console.log('post')
            /**
             * where postback is the postback payload
             * and ref will arrive if m.me params were passed on a get started button (if defined)
             */
        });
    }

    handleOptin(message) {
        let { botly, db, base64 } = this.bundle

        console.log('\n[INFO] Optin Message:\n', JSON.stringify(message))

        try {
            let order = base64.decode(message.optin.ref)
            order = JSON.parse(order)

            console.log('\n[INFO] Parsed ref:\n', order)

            if (order.email && order.orderId) {
                db.createRef(message.optin.user_ref, order, (status, user) => {
                    console.log('ref status - ' + status)
                    console.log('ref user - ' + JSON.stringify(user))
                    if (status == 'reffered' || status == 'ordered') {
                        this.sendText(user, `Thank you for your order. The order ID is ${order.orderId}, you can use it when contacting us with any questions related to your purchase.`)
                    }

                    if (status == 'reffered' || status == 'ordered') {

                        setTimeout(() => {
                            console.log('timeout ' + order.orderId)

                            db.checkApprove(order.orderId, (status, user, order) => {
                                if (status != 'approved') {
                                    if (user && order) {
                                        let buttons = []
                                        buttons.push({
                                            "type": "web_url",
                                            "url": order.url,
                                            "title": "Get 20% OFF"
                                        })
                                        
                                        this.sendButtons(user, `Your order ${order.orderId} is not paid yet. Click the link below to get extra 20% OFF your order now!`, buttons)
                                    }
                                }
                            })
                        }, 40000)
                    }
                })
            } else {
                console.log(`~~~ Error, while handling referral, there is no email or orderId: ${order}`)
            }
        } catch (error) {
            console.log(`~~~ Error while decoding ref link`, message, error)
        }
    }

    sendText(user, msg) {
        let { axios, config } = this.bundle

        console.log('[INFO] sending text to user', user)

        axios.post(`https://graph.facebook.com/v2.6/me/messages?access_token=${config.accessToken}`, {
            recipient: {
                user_ref: user.sender
            },
            message: {
                text: msg
            }
        }).then(function (response) {
            console.log(response.data)
        }).catch(function (error) {
            console.log(error)
        })
    }

    sendButtons(user, text, buttons) {
        let { axios, config } = this.bundle

        axios.post(`https://graph.facebook.com/v2.6/me/messages?access_token=${config.accessToken}`, {
            recipient: {
                user_ref: user.sender
            },
            message: {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": text,
                        "buttons": buttons
                    }
                }
            }
        }).then(function (response) {
            console.log(response.data)
        }).catch(function (error) {
            console.log(error.data)
        })
    }

    restoreApproveChecking() {
        let { botly, db, base64 } = this.bundle

        db.getApproves((err, users) => {
            if (!err && users) {
                users.forEach(user => {
                    user.orders.forEach(order => {
                        if (order.status != 'approved' && order.checkApprove_ts > Date.now()) {
                            console.log('not approved - ' + order.orderId)
                            setTimeout(() => {
                                console.log('timeout ' + order.orderId)
                                db.checkApprove(order.orderId, status => {
                                    if (status != 'approved') {
                                        let buttons = [];
                                        buttons.push(botly.createWebURLButton("Get 20% OFF", order.url));
                                        botly.sendButtons({ id: user.sender, text: `Your order ${order.orderId} is not paid yet. Click the link below to get extra 20% OFF your order now!`, buttons: buttons }, (err, data) => {
                                            err && console.log(err)
                                            console.log(data)
                                        });
                                    }
                                })
                            }, order.checkApprove_ts - Date.now());
                        }
                    })
                })
            }
        })
    }
}

module.exports = Bot;