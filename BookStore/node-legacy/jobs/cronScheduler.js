const cron = require('node-cron');
const Book = require('../api/models/book')




cron.schedule("*/5 * * * * * ", async () => {
  let Books = [];
  // console.log("background task  started");
  Books = await Book.find({ stock: { $lt: 3 }, status: "ACTIVE" })
    .select('title author price stock status');

  if (Books.length > 0) {
    console.log("Scheduled Task : ");
    console.log(Books);
    }

  else {
  console.log("No Book Found");
}
});

