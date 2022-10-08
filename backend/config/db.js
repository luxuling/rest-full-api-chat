const mongoose = require("mongoose")

const getMongo = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology:true,
    })
    console.log(`monoogo connected: ${conn.connection.host}`.cyan.bold)
  } catch (error) {
    console.log(error)
    process.exit()
  }
}
module.exports = getMongo