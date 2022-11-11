// app/routes.js
// grab the nerd model we just created

var mongoose = require('mongoose');
const { check } = require('express-validator');
var validator = require("node-email-validation");
const bcrypt = require('bcrypt');
const saltRounds = 10;

var userSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    password: String
});

function checkPassword(password) {
    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    return passwordRegex.test(password);
}

function checkName(name) {
    var nameRegex = /^([\w]{3,})+\s+([\w\s]{3,})+$/i;
    return nameRegex.test(name);
}

const User = mongoose.model("user", userSchema);

module.exports = function (app) {

    app.post('/user/create', async (req, res) => {

        console.log(req.body);
        passwordValid = true;
        passwordError = "";
        emailValid = true;
        emailError = "";
        nameValid = true;
        nameError = "";

        try {
            const bcryptpassword = await bcrypt.hash(req.body.password, saltRounds);
            if (req.body.password == "") {
                passwordValid = false;
                passwordError = "Password cannot be empty";
                res.send(passwordError);
                return;
            }
            if (req.body.email == "") {
                emailValid = false;
                emailError = "Email cannot be empty";
                res.send(emailError);
                return;
            }
            if (req.body.fullname == "") {
                nameValid = false;
                nameError = "Full Name cannot be empty";
                res.send(nameError);
                return;
            }
            if (!checkName(req.body.fullname)) {
                nameValid = false;
                nameError = "Enter a valid full name";
                res.send(nameError);
                return;
            }
            if (!validator.is_email_valid(req.body.email)) {
                emailValid = false;
                emailError = "Enter valid Email ID";
                res.send(emailError);
                return;
            }
            if (req.body.password.length < 5) {
                passwordValid = false;
                passwordError = "Password cannot be less than 5 characters";
                res.send(passwordError);
                return;
            }
            if (req.body.password.length > 15) {
                passwordValid = false;
                passwordError = "Password cannot be more than 15 characters";
                res.send(passwordError);
                return;
            }
            if (!checkPassword(req.body.password)) {
                passwordValid = false;
                passwordError = "Password should have one uppercase, one lowercase, one number and one special character";
                res.send(passwordError);
                return;
            }
            if (passwordValid == true && emailValid == true && nameValid == true) {
                const insertResult = await User.create({
                    fullname: req.body.fullname,
                    email: req.body.email,
                    password: bcryptpassword
                });

                res.send("Data saved successfully " + insertResult);
                return;
            }

        } catch (error) {
            console.log(error);
            res.status(500).send("Error");
        }
    });

    app.put('/user/edit', async (req, res) => {

        console.log(req.body);
        passwordValid = true;
        passwordError = "";
        nameValid = true;
        nameError = "";

        try {
            const bcryptpassword = await bcrypt.hash(req.body.password, saltRounds);
            if (req.body.password == "") {
                passwordValid = false;
                passwordError = "Password cannot be empty";
                res.send(passwordError);
                return;
            }
            if (req.body.fullname == "") {
                nameValid = false;
                nameError = "Full Name cannot be empty";
                res.send(nameError);
                return;
            }
            if (!checkName(req.body.fullname)) {
                nameValid = false;
                nameError = "Enter a valid full name";
                res.send(nameError);
                return;
            }
            if (req.body.password.length < 5) {
                passwordValid = false;
                passwordError = "Password cannot be less than 5 characters";
                res.send(passwordError);
                return;
            }
            if (req.body.password.length > 15) {
                passwordValid = false;
                passwordError = "Password cannot be more than 15 characters";
                res.send(passwordError);
                return;
            }
            if (!checkPassword(req.body.password)) {
                passwordValid = false;
                passwordError = "Password should have one uppercase, one lowercase, one number and one special character";
                res.send(passwordError);
                return;
            }

            User.countDocuments({ email: req.body.email }, function (err, count) {

                if (count > 0) {
                    var updateEmail = { email: req.body.email };
                    var updateValues = { $set: { fullname: req.body.fullname, password: bcryptpassword } };
                    User.updateOne(updateEmail, updateValues, function (err, resp) {
                        if (err) {
                            throw err;
                        }
                        res.send("Document with email id " + req.body.email + " updated successfully");
                        return;
                    })
                } else {
                    res.send("User Email not present")
                    return;
                }
            })
        } catch (error) {
            console.log(error);
            res.status(500).send("Error");
        }
    });

    app.delete('/user/delete', function (req, res) {

        console.log(req.body);

        User.countDocuments({ email: req.body.email }, function (err, count) {

            if (count > 0) {
                var deleteEmail = { email: req.body.email };

                User.deleteOne(deleteEmail, function (err, resp) {
                    if (err) {
                        throw err;
                    }
                    res.send("Document with email id " + req.body.email + " deleted successfully");
                    return;
                })
            } else {
                res.send("User Email not present")
                return;
            }
        });
    });

    app.get('/user/getAll', function(req, res) {
        
        User.find(function(err, resp) {
            if (err)
                res.send(err);
            console.log('User Details', resp);
            res.send(resp);
        });
    });
};