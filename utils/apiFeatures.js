class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A))) Buidling query Object, excluding page, limit, sort and fields
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //1B))) Advance filter
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //1C))) run find on query witht the filter object
    this.query = this.query.find(JSON.parse(queryStr));
    //1D))) return the query so we could chain other methods
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      //special sorts
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      //sort as default
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    //3))) Fields Limit
    if (this.queryString.fields) {
      //select specific fields
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //by default
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    //4))) Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
