const error = (req, res, next) => {
  try {
    next()
  } 
  catch (err) {
    console.error(err)

    res.status = err.statusCode || err.status || 500
    res.json = { message: err.message }
  }
}


export default error
