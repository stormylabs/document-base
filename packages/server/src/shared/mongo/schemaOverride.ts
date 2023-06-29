export const toJSONOverride = {
  transform: function (doc, ret) {
    ret._id = ret._id.toString(); // Transform _id to string and assign it to id field
    delete ret.__v; // Remove __v field
  },
};
