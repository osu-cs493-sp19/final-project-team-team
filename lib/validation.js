const moment = require('moment');

/*
 * Performs data validation on an object by verifying that it contains
 * all required fields specified in a given schema.
 *
 * Returns true if the object is valid agianst the schema and false otherwise.
 */
exports.validateAgainstSchema = function (obj, schema) {
  return obj && Object.keys(schema).every(
    field => !schema[field].required || obj[field]
  );
};

/*
 * Extracts all fields from an object that are valid according to a specified
 * schema.  Extracted fields can be either required or optional.
 *
 * Returns a new object containing all valid fields extracted from the
 * original object.
 */
exports.extractValidFields = function (obj, schema) {
  let validObj = {};
  Object.keys(schema).forEach((field) => {
    if (obj[field]) {
      validObj[field] = obj[field];
    }
  });
  return validObj;
};

/*
 * Small function that uses moment.js to validate that a date is in ISO 8601 
 * date-time format.
 */
function validateDate(date) {
  return moment(date, "YYYY-MM-DDTHH:mm:ss-HH:mm", true).isValid();
}
exports.validateDate = validateDate;
