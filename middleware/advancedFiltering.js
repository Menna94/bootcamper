const advancedFiltering = (model, populate) => async (req, res, next) => {
  const reqQuery = { ...req.query };

  //Fields to execlude
  const removedFields = ["select", "sort", "page", "limit"];

  //Loop over removedFields and delete them from req.query
  removedFields.forEach((param) => delete reqQuery[param]);

  //Create query string
  let queryStr = JSON.stringify(reqQuery);

  //Create $gt $gte $lt $lte $in ..
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //Finding resource
  let query = model.find(JSON.parse(queryStr));

  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  //Executing query
  const results = await query;

  //Pagination Result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  if (results) {
    return res.status(201).send({
      success: true,
      count: results.length,
      msg: "All Data Fetched SUCCESSFULLY~",
      pagination,
      data: results,
    });
  }
  return res.status(404).send({
    success: false,
    msg: "Couldn't Fetch Data!",
    data: null,
  });

  next();
};

module.exports = advancedFiltering;
