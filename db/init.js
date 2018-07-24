'use strict'
const mongoose = require('mongoose');

// Database initializer
class Init {
    constructor(url) {
        mongoose.connect(url);
        const connection = mongoose.connection;

        const userSchema = mongoose.Schema({
            _id: String,
            email: String,
            sender: String,
            user_ref: String,
            orders: [{
                orderId: String,
                url: String,
                products: [],
                status: String,
                checkApprove_ts: Number
            }]
        }); 


        this.connection = connection
        this.User =  mongoose.model('User', userSchema)

        //Listeners
        connection.on('error', console.error.bind(console, 'connection error:'));
        connection.once('open', () => { console.log("mLab is connected") });
    }
}

module.exports = Init;