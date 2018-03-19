const {assert} = require('chai');
const request = require('supertest');
const {jsdom} = require('jsdom');
const app = require('../../app');

const {parseTextFromHTML,
   parseAttributeFromHTML,
   seedItemToDatabase} = require('../test-utils');
const {connectDatabaseAndDropData, diconnectDatabase} = require('../setup-teardown-utils');
const Item = require('../../models/item');

describe('Server path: /items/:id/update', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(diconnectDatabase);

  describe('GET', () => {
    it('renders an items title', async () => {
        const item = await seedItemToDatabase();
        const response = await request(app)
          .get(`/items/${item._id}/update`);
        assert.include(parseAttributeFromHTML(response.text, '#title-input', 'value'), item.title);
    });

    it('renders an items description', async () => {
      const item = await seedItemToDatabase();
      const response = await request(app)
        .get(`/items/${item._id}/update`);
      assert.include(parseTextFromHTML(response.text, '#description-input'), item.description);
    });

    it('renders an items imageUrl', async () => {
      const item = await seedItemToDatabase();
      const response = await request(app)
        .get(`/items/${item._id}/update`);
      assert.include(parseAttributeFromHTML(response.text, '#imageUrl-input', 'value'), item.imageUrl);
    });
  });

  describe('POST', () => {
    it('updates an already created item', async () => {
      const item = await seedItemToDatabase();
      const newItemInfo = {
        title: 'German Dird',
        description: 'This german boy is a happy fren',
        imageUrl: 'https://i.huffpost.com/gen/1497386/thumbs/a-DIRD3-640x468.jpg?6'
      };

      const response = await request(app)
        .post(`/items/${item._id}/update`)
        .type('form')
        .send(newItemInfo);
      const updatedItem = await Item.findOne({'title': newItemInfo.title});

      assert.equal(newItemInfo.title, updatedItem.title);
      assert.equal(newItemInfo.description, updatedItem.description);
      assert.equal(newItemInfo.imageUrl, updatedItem.imageUrl);
    });

    it('redirects to the single item page after update', async () => {
      const item = await seedItemToDatabase();
      const newItemInfo = {
        title: 'German Dird',
        description: 'This german boy is a happy fren',
        imageUrl: 'https://i.huffpost.com/gen/1497386/thumbs/a-DIRD3-640x468.jpg?6'
      };

      const response = await request(app)
        .post(`/items/${item._id}/update`)
        .type('form')
        .send(newItemInfo);
      const updatedItem = await Item.findOne({'title': newItemInfo.title});

      assert.equal(response.status, 302);
      assert.equal(response.headers.location, `/items/${item._id}`);
    });

    it('displays an error message when supplied an empty title', async () => {
      const item = await seedItemToDatabase();
      const invalidItem = {
        title: '',
        description: 'This german boy is a happy fren',
        imageUrl: 'https://i.huffpost.com/gen/1497386/thumbs/a-DIRD3-640x468.jpg?6'
      };

      const response = await request(app)
        .post(`/items/${item._id}/update`)
        .type('form')
        .send(invalidItem);
      const allItems = await Item.find({description: invalidItem.description});

      assert.equal(allItems.length, 0);
      assert.equal(response.status, 400);
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });

    it('displays an error message when supplied an empty description', async () => {
      const item = await seedItemToDatabase();
      const invalidItem = {
        title: 'German Dird',
        description: '',
        imageUrl: 'https://i.huffpost.com/gen/1497386/thumbs/a-DIRD3-640x468.jpg?6'
      };

      const response = await request(app)
        .post(`/items/${item._id}/update`)
        .type('form')
        .send(invalidItem);
      const allItems = await Item.find({title: invalidItem.title});

      assert.equal(allItems.length, 0);
      assert.equal(response.status, 400);
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });

    it('displays an error message when supplied an empty imageUrl', async () => {
      const item = await seedItemToDatabase();
      const invalidItem = {
        title: 'A dird',
        description: 'cross between a dog and a bird',
        imageUrl: ''
      };

      const response = await request(app)
        .post(`/items/${item._id}/update`)
        .type('form')
        .send(invalidItem);
      const allItems = await Item.find({title: invalidItem.title});

      assert.equal(allItems.length, 0);
      assert.equal(response.status, 400);
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });
  });

});
