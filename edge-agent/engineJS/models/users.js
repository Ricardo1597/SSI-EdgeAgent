var mongoose = require('mongoose')

var bcrypt = require('bcryptjs')

var Schema = mongoose.Schema


var UserSchema = new Schema({
    name: {
        type: String, 
        required : true
    },
    username: {
        type: String, 
        required : true, 
        unique: true
    },
    password: {
        type: String, 
        required : true
    }
})

UserSchema.pre('save', async function (next) {
    var hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    next()
    
})

UserSchema.methods.isValidPassword = async function(password){
    var user = this
    var compare = await bcrypt.compare(password, user.password)
    return compare
}

var UserModel = mongoose.model('User', UserSchema)


module.exports = UserModel
