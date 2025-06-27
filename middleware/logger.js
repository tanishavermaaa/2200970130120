module.exports = (req, res, next) => {
  try {
    const log = `${new Date().toISOString()} ${req.method} ${req.originalUrl}`;
    console.info(log);
    next(); 
  } catch (err) {
    console.error("Logger middleware error:", err);
    next(err); 
  }
};

