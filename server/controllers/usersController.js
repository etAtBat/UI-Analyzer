var model = require('../db/model');

// var User = sequelize.define('user', {
//   id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
//   email: { type: Sequelize.STRING, unique: true, notNull: true, notEmpty: true },
//   password: { type: Sequelize.STRING, notNull: true, notEmpty: true },
//   salt: { type: Sequelize.STRING, notNull: true, notEmpty: true },
//   firstname: { type: Sequelize.STRING },
//   surname: { type: Sequelize.STRING },
//   company: { type: Sequelize.STRING }
// }, { timestamps: false });

// input should be of the following format:
// { email: 'abc@abc.com', password: '32kj3r2kjsdnkjsd', salt: '23423asfdsafsd', company: 'abc' || NULL, firstname: 'abc' || NULL, surname: 'abc' || NULL }
// output shall be of the following format:
// { id: 123, email: 'abc@abc.com', password: *null*, salt: *null*, etc }
var createUser = function (user) {
  params = {
    email: user.email,
    password: user.password,
    company: user.company,
    firstname: user.firstname,
    surname: user.surname
  };

  return model.User.findOrCreate({
    where: params,
    defaults: params
  })
  .spread(function (newUser, created) {
    if (!created) {
      throw (new Error ('Error! User already exists!'));
    } else {
      var returnObject = newUser.set({ password: null });
      return returnObject;
    }
  });
};

// input should be of the following format:
// { email: 'abc@abc.com' }
// output shall be of the following format:
// { id: 123, email: 'abc@abc.com', password: '32kj3r2kjsdnkjsd', company: 'abc' (optional), firstname: 'abc' (optional), surname: 'abc' (optional) }
var retrieveUser = function (user) {
  return model.User.findOne({
    where: user
  })
  .then(function (result) {
    if (result === null) {
      throw (new Error ('Error! User does not exist!'));
    } else {
      return result;
    }
  });
};

// input should be of the following format:
// { id: 123 (optional), email: 'abc@abc.com', password: '32kj3r2kjsdnkjsd' (optional), company: 'abc' (optional), firstname: 'abc' (optional), surname: 'abc' (optional) }
// output shall be of the following format:
// { id: 123 (optional), email: 'abc@abc.com', password: '32kj3r2kjsdnkjsd' (optional), company: 'abc' (optional), firstname: 'abc' (optional), surname: 'abc' (optional) }
var updateUser = function (user) {
  var params = { email: user.email };

  return model.User.update(user, {
    where: params
  })
  .spread(function (updated) {
    if (updated === 0) {
      throw (new Error ('Error! User update failed!'));
    } else {
      return user;
    }
  });
};

// input should be of the following format:
// { id: 123 }
// output shall be of the following format:
// 1
var deleteUser = function (user) {
  return model.User.destroy({
    where: user
  })
  .then(function (deleted) {
    if (deleted === 0) {
      throw (new Error ('Error! User delete failed!'));
    } else {
      return deleted;
    }
  });
};

module.exports = {
  createUser: createUser,
  retrieveUser: retrieveUser,
  updateUser: updateUser,
  deleteUser: deleteUser
};

// TEST AREA
// model.init()
// createUser({ email: 'max@max.com', password: 'abc123', salt: 'salty', firstname: null, surname: null, company: null })
// // retrieveUser({ email: 'max@max.com' })
//   .then(function(test) {
//     console.log(test.get())
//   })
//   .then(function () {
//     return deleteUser({email: 'max@max.com'})
//       .then(function(deleted) {
//         console.log(deleted)
//       })
//   })
