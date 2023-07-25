export const toJSONOverride = {
  transform: function (doc, ret) {
    for (const key in ret) {
      // if the instanceof ret[key] is ObjectID, then convert it to string
      if (ret[key] instanceof Object) {
        if (ret[key]._bsontype === 'ObjectID') {
          ret[key] = ret[key].toString();
        }
      }
    }
    delete ret.__v; // Remove __v field
  },
};
