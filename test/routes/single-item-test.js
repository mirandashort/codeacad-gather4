const {assert} = require('chai');
const request = require('supertest');
const app = require('../../app');
const {parseTextFromHTML, parseAttributeFromHTML, seedItemToDatabase} = require('../test-utils');
const {connectDatabaseAndDropData, diconnectDatabase} = require('../setup-teardown-utils');
const Item = require('../../models/item');

describe('Server path: /items/:id', () => {
  beforeEach(connectDatabaseAndDropData);
  afterEach(diconnectDatabase);

  describe('GET', () => {
    it('renders an items title, description, and imageUrl', async () => {
      const item = await seedItemToDatabase();
      const response = await request(app)
        .get(`/items/${item._id}`);

      assert.include(parseTextFromHTML(response.text, '#item-title'), item.title);
      assert.include(parseTextFromHTML(response.text, '#item-description'), item.description);
      assert.include(parseAttributeFromHTML(response.text, '#item-imageUrl', 'src'), item.imageUrl);
    });
  });
});
