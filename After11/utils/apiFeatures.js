class APIFeatures {
  constructor(query, queryString){
    this.query = query;
    this.queryString = queryString;
  }

  filter(){
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advenced filtering
    // { difficulty: 'easy', duration: { gte: 5} }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    queryStr = JSON.parse(queryStr);
    // { difficulty: 'easy', duration: { $gte: 5} } '$' added to gte

    this.query = this.query.find(queryStr);

    // for chaining
    return this;
  }

  sort() {
    // 2) Sorting
    // this.queryString is a list with query params(e.g. sort, select, filter)
    if(this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); // e.g. 'name price difficulty'
      this.query = this.query.sort(sortBy);
    } else{
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3) Field limiting
    if(this.queryString.fields){
      const fields = this.queryString.fields.split(',').join(' '); // e.g. 'name price difficulty'
      console.log(fields);
      this.query = this.query.select(fields);
    } else{
      this.query = this.query.select('-__v'); // minus means excluding
    } 

    return this;
  }

  paginate() {
    // 4) Pagination
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit) * 1 || 100; // 100 is the default value
    const skipNumber = (page-1) * limit;  
    // page=3&limit=10, page 1 => 1-10, page 2 => 11-20
    this.query = this.query.skip(skipNumber).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;