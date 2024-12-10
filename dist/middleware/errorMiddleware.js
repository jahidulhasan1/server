const errorMiddleware = (err, req, res, next) => {
    err.message || (err.message = "internal server error");
    err.statusCode || (err.statusCode = 500);
    if (err.name === "CastError")
        err.message = "Invalid Id";
    // Handle the error
    return res.status(500).json({ error: err.message });
};
export const tryCatch = (func) => (req, res, next) => {
    return Promise.resolve(func(req, res, next)).catch(next);
};
export default errorMiddleware;
