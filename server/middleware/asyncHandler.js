const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
        // Catch invalid ObjectId errors from Mongoose
        if (err.name === "CastError") {
            res.status(400);
            return next(new Error(`Invalid ID format: ${err.value}`));
        }
        next(err);
    });
};

export default asyncHandler;
