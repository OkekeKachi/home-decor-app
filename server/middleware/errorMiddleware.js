const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: Object.values(err.errors).map(val => val.message)
        });
    }

    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
        message: err.message || "Server Error",
    });
};

export default errorHandler;
