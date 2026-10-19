const createError = require('http-errors');

const { NotFound, Unauthorized, Forbidden, UnprocessableEntity, BadRequest } = createError;

class RestartError extends Error { }

class Errors {
  handleError(res, error, message) {
    const errMsg = `${error.message}`;
    let status = 500;
    if (createError.isHttpError(error)) {
      status = error.status;
    }
    if (error.status == 409) {
      status = error.status;
    }
    else {
      console.error(error.message ? error.message : error);
    }
    res.status(status).send(errMsg);
  }

  static getInstance() {
    if (!Errors.__instance) {
      Errors.__instance = new Errors();
    }
    return Errors.__instance;
  }
}

module.exports = {
  errors: Errors.getInstance(),
  BadRequest,
  RestartError,
  NotFound,
  UnprocessableEntity,
  Unauthorized,
  Forbidden,
};
