const Product = require("../models/product");
const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({
    price: { $gt: 40 },
    rating: { $gte: 4.9 },
  })
    .sort("price")
    .select("rating");
  res.status(200).json({ msg: products, nbHits: products.length });
};
//skip for pagination functionality
const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFields } = req.query;
  const queryObject = {};
  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    //matches the string that contains the search value and is case insensitive
    queryObject.name = { $regex: name, $options: "i" };
  }

  if (numericFields) {
    const operatrorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(>|>=|=|<|<=)\b/g;
    let filters = numericFields.replace(
      regEx,
      (match) => `-${operatrorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
    console.log(queryObject);
  }

  let result = Product.find(queryObject);

  //sort
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createAt");
  }
  //limits and skips
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  //fields
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }
  const products = await result;

  res.status(200).json({ msg: products, nbHits: products.length });
};

module.exports = { getAllProducts, getAllProductsStatic };
