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

            
            let text = `echo: ${data.text}`

            botly.sendText({
                id: senderId,
                text: text
            })
        })

        botly.on("postback", (sender, message, postback, ref) => {
            console.log('post')
            /**
             * where postback is the postback payload
             * and ref will arrive if m.me params were passed on a get started button (if defined)
             */
        });

        botly.on("optin", (sender, message, optin) => {
            console.log('\n[INFO] Optin sender:\n', JSON.stringify(sender))
            console.log('\n[INFO] Optin Message:\n', JSON.stringify(message))
            console.log('\n[INFO] Optin ref:\n', JSON.stringify(optin))

            try {
                let order = base64.decode(optin)
                order = JSON.parse(order)

                console.log('\n[INFO] Parsed ref:\n', order)

                if (order.email && order.orderId) {
                    db.createRef(sender, order, (status, user) => {
                        console.log('ref status - ' + status)
                        console.log('ref user - ' + JSON.stringify(user))
                        if (status == 'ordered') {
                            botly.sendText({
                                id: user.sender,
                                text: `Thank you for your order. The order ID is ${order.orderId}, you can use it when contacting us with any questions related to your purchase.`
                            });
                        }

                        if (status == 'reffered' || status == 'ordered') {

                            setTimeout(() => {
                                console.log('timeout ' + order.orderId)

                                db.checkApprove(order.orderId, (status, user, order) => {
                                    if (status != 'approved') {
                                        if (user && order) {
                                            let buttons = [];
                                            buttons.push(botly.createWebURLButton("Get 20% OFF", order.url));
                                            botly.sendButtons({ id: user.sender, text: `Your order ${order.orderId} is not paid yet. Click the link below to get extra 20% OFF your order now!`, buttons: buttons }, (err, data) => {
                                                err && console.log(err)
                                                console.log(data)
                                            });
                                        }
                                    }
                                })
                            }, 120000);
                        }
                    })
                } else {
                    console.log(`~~~ Error, while handling referral, there is no email or orderId - ${optin}`)
                }
            } catch (error) {
                console.log(`~~~ Error while decoding ref link - "${optin}" - ` + error)
            }
        });
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