const { MongoClient } = require("mongodb");
const url = require("./url");
const client = new MongoClient(url);

const dbName = "crud";
const user_collection_bookmark = client.db(dbName).collection("bookmarks");
const user_collection_user = client.db(dbName).collection("user");

const bookmarkId = "g";
const bookmarkToInsert = {
  _id: "g",
  userId: [1, 2, 3],
  title: "netflix",
  url: "http://www.netflix.com",
  description: "watch movies",
  tags: ["movies", "entertainment"],
  isPublic: true,
  createdAt: new Date(),
};
const bookmarkIdToUpdate = "c";
const update = {
  $set: { description: "This helps to find awesome communities" },
};
const bookmarkIdToDelete = "f";
const tagToSearch = "blogs";
const titleToSearch = "Medium";
const descriptionToSearch = "";
const keyword = "for";
const bookmarkIdNew = "a";

const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log(`Connected to the database ${dbName}`);
  } catch (err) {
    console.error("Failed to connect to the database", err);
  }
};

//to read the bookmark data of a given user
const getBookmarkData = async (bookmarkId) => {
  try {
    const result = await user_collection_bookmark
      .find({ _id: bookmarkId })
      .toArray();
    console.log(result);
  } catch (err) {
    console.error("Failed to retrieve data", err);
  }
};

//to creat a new bookmark
const createBookmark = async (bookmarkToInsert) => {
  try {
    const result = await user_collection_bookmark.insertOne(bookmarkToInsert);
    const userUpdate = await user_collection_user.updateMany(
      { _id: { $in: bookmarkToInsert.userId } },
      { $push: { bookmark_ids: bookmarkToInsert._id } }
    );
    console.log("New bookmark created");
  } catch (err) {
    console.error("Failed to create a new bookmark", err);
  }
};

//update the bookmark
const updateBookmark = async (bookmarkId, update) => {
  try {
    const result = await user_collection_bookmark.updateOne(
      { _id: bookmarkId },
      update
    );
    result.modifiedCount > 0
      ? console.log("Updated successfully")
      : console.log("Failed to update");
  } catch (err) {
    console.error("Failed to update bookmark", err);
  }
};

//to delete a bookmark
const deleteBookmark = async (bookMarkToDelete) => {
  try {
    const objBookmark = await user_collection_bookmark.findOne({
      _id: bookMarkToDelete,
    });
    const result = await user_collection_bookmark.deleteOne({
      _id: bookMarkToDelete,
    });
    const deleteFromUser = await user_collection_user.updateMany(
      { _id: { $in: objBookmark.userId } },
      { $pull: { bookmark_ids: bookMarkToDelete } }
    );
    result.deletedCount > 0
      ? console.log("Updated successfully")
      : console.log("Failed to update");
  } catch (err) {
    console.error("Failed to delete bookmark", err);
  }
};

//to find tag
const findTag = async (tag) => {
  try {
    const result = await user_collection_bookmark.find({ tags: tag }).toArray();
    console.log(result);
  } catch {
    console.error("Failed to find tag", err);
  }
};

//to find title
const findTitle = async (title) => {
  try {
    const result = await user_collection_bookmark
      .find({ title: title })
      .toArray();
    console.log(result);
  } catch {
    console.error("Failed to find title", err);
  }
};

//to find description
const findDescription = async (description) => {
  try {
    const result = await user_collection_bookmark
      .find({ description: description })
      .toArray();
    console.log(result);
  } catch {
    console.error("Failed to find description", err);
  }
};

//to find text search and tag filter and also sorting
const searchAndTagFilter = async (keyword, tag) => {
  try {
    const result = await user_collection_bookmark
      .aggregate([
        {
          $match: {
            $or: [{ title: keyword }, { description: keyword }],
            tags: tag,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $limit: 2,
        },
      ])
      .toArray();
    console.log(result);
  } catch (err) {
    console.error("Failed to find text search and tag filter", err);
  }
};

//fetch user details of a bookmark
const getUserDetails = async (bookmarkIdNew) => {
  try {
    const result = await user_collection_bookmark.findOne({
      _id: bookmarkIdNew,
    });
    const userDetails = await user_collection_user
      .find({ _id: { $in: result.userId } })
      .toArray();
    console.log(userDetails);
  } catch (err) {
    console.error("Failed to fetch user details", err);
  }
};

//most used tags in public bookmarks
async function mostUsedTags() {
  try {
    const result = await cuser_collection_bookmark
      .aggregate([
        {
          $match: { isPublic: true },
        },
        {
          $unwind: "$tags",
        },
        {
          $group: {
            _id: "$tags",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ])
      .toArray();
    if (result.length > 0) {
      console.log("Most used tags in public bookmarks:");

      result.forEach((tag) => {
        console.log(`${tag._id}: ${tag.count}`);
      });
    } else {
      console.log("No public bookmarks found.");
    }
  } catch (err) {
    console.error("Error during the aggregation:", err);
  }
}

const main = async () => {
  try {
    await connectToDatabase();
    //await getBookmarkData(bookmarkId);
    //await createBookmark(bookmarkToInsert);
    //await updateBookmark(bookmarkIdToUpdate , update);
    //await getBookmarkData('c');
    // await deleteBookmark(bookmarkIdToDelete);
    // await getBookmarkData("e");
    //await findTag(tagToSearch);
    // await findTitle(titleToSearch);
    // await findDescription(descriptionToSearch);
    //await searchAndTagFilter(titleToSearch, tagToSearch);
    mostUsedTags();
    await getUserDetails(bookmarkIdNew);
  } catch (error) {
    console.error(error);
  } finally {
    client.close();
  }
};
main();
