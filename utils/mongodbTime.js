function mongodbTime() {
  // Pad the string to ensure it's 8 characters long (representing 4 bytes)
  return new Date();
}

module.exports = mongodbTime;
