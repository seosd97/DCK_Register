exports.responseError = (code, msg) => {
  return {
    status: {
      code: code,
      message: msg,
    },
  };
};
