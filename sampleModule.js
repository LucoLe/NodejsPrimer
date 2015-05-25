var fs = require('fs'),
    Client = require('ftp'),
    http = require('http');

var downloadLink = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
  return dest;
};

var processFeed = function (inputfeed1, inputfeed2) {
  var bufArr1 = fs.readFileSync(inputfeed1, 'utf8').split('\r\n'),
      bufArr2 = fs.readFileSync(inputfeed2, 'utf8').split('\r\n'),
      inputFeedHeaders = [],
      productFeedHeaders = ["gtin", "mpn", "name", "brand", "brand_images", "short_description", "long_description", "keywords", "images", "accessories", "others", "category_ids", "group_id", "attributes"],
      inventoryFeedHeaders = ["store_code", "gtin", "price", "special_price", "special_price_from", "special_price_to", "delivery_cost", "quantity", "url"],
      inputArr = [],
      productsArr = [],
      invetntoryArr = [],
      outputProductCatalog = "ProductCatalogDataFeed.csv",
      outputInventory = "InventoryDataFeed.csv";

  // Parse the buffer array into array of arrays
  bufArr1 = bufArr1.filter(function(n){ return n != '' }) //filter the empty lines
  bufArr2 = bufArr2.filter(function(n){ return n != '' }) //filter the empty lines
  for (var i = 0; i < bufArr1.length; i++) {
    bufArr1[i] = bufArr1[i].split(';')
  };
  for (var i = 0; i < bufArr2.length; i++) {
    bufArr2[i] = bufArr2[i].split(';')
  };

  // Fill the inputFeedHeaders array
  for (var i = 0; i < bufArr1[0].length; i++) {
    inputFeedHeaders.push(bufArr1[0][i])
  };
  for (var i = 0; i < bufArr2[0].length; i++) {
    inputFeedHeaders.push(bufArr2[0][i])
  };

  function InputFeed (id, gtin, mpn, title, brand, description, image_link, google_product_category, product_type, condition, shipping_weight, gender, age_group, size, color, material, pattern, store_nr, price, shipping, availability, link) {
    this[inputFeedHeaders[1]] = id;
    this[inputFeedHeaders[0]] = parseInt(gtin);
    this[inputFeedHeaders[10]] = mpn;
    this[inputFeedHeaders[2]] = title;
    this[inputFeedHeaders[9]] = brand;
    this[inputFeedHeaders[3]] = description;
    this[inputFeedHeaders[7]] = image_link;
    this[inputFeedHeaders[4]] = google_product_category;
    this[inputFeedHeaders[5]] = product_type;
    this[inputFeedHeaders[8]] = condition;
    this[inputFeedHeaders[12]] = shipping_weight;
    this[inputFeedHeaders[13]] = gender;
    this[inputFeedHeaders[14]] = age_group;
    this[inputFeedHeaders[15]] = size;
    this[inputFeedHeaders[16]] = color;
    this[inputFeedHeaders[18]] = material;
    this[inputFeedHeaders[19]] = pattern;
    this[inputFeedHeaders[21]] = parseInt(store_nr);
    this[inputFeedHeaders[23]] = parseFloat(price);
    this[inputFeedHeaders[27]] = shipping;
    this[inputFeedHeaders[22]] = availability;
    this[inputFeedHeaders[6]] = link;
  };

  function ProductCatalogFeed (gtin, mpn, name, brand, brand_images, short_description, long_description, keywords, images, accessories, others, category_ids, group_id, attributes) {
    this[productFeedHeaders[0]] = gtin;
    this[productFeedHeaders[1]] = mpn;
    this[productFeedHeaders[2]] = name;
    this[productFeedHeaders[3]] = brand;
    this[productFeedHeaders[4]] = brand_images;
    this[productFeedHeaders[5]] = short_description;
    this[productFeedHeaders[6]] = long_description;
    this[productFeedHeaders[7]] = keywords;
    this[productFeedHeaders[8]] = images;
    this[productFeedHeaders[9]] = accessories;
    this[productFeedHeaders[10]] = others;
    this[productFeedHeaders[11]] = category_ids;
    this[productFeedHeaders[12]] = group_id;
    this[productFeedHeaders[13]] = attributes;
  };

  function AtributesObj (condition, shipping_weight, gender, age_group, size, color, material, pattern) {
    this[inputFeedHeaders[8]] = condition;
    this[inputFeedHeaders[12]] = shipping_weight;
    this[inputFeedHeaders[13]] = gender;
    this[inputFeedHeaders[14]] = age_group;
    this[inputFeedHeaders[15]] = size;
    this[inputFeedHeaders[16]] = color;
    this[inputFeedHeaders[18]] = material;
    this[inputFeedHeaders[19]] = pattern;
  }

  function InventoryFeed (store_code, gtin, price, special_price, special_price_from, special_price_to, delivery_cost, quantity, url) {
    this[inventoryFeedHeaders[0]] = store_code;
    this[inventoryFeedHeaders[1]] = gtin;
    this[inventoryFeedHeaders[2]] = price;
    this[inventoryFeedHeaders[3]] = special_price;
    this[inventoryFeedHeaders[4]] = special_price_from;
    this[inventoryFeedHeaders[5]] = special_price_to;
    this[inventoryFeedHeaders[6]] = delivery_cost;
    this[inventoryFeedHeaders[7]] = quantity;
    this[inventoryFeedHeaders[8]] = url;
  }

  // Create the InputFeed objects array
  for (var i = 1; i < bufArr1.length; i++) {
    var inpFeed;

    inpFeed = new InputFeed(bufArr1[i][1], bufArr1[i][0], bufArr1[i][10], bufArr1[i][2], bufArr1[i][9], bufArr1[i][3], bufArr1[i][7], bufArr1[i][4], bufArr1[i][5],  bufArr1[i][8], bufArr1[i][12], bufArr1[i][13], bufArr1[i][14], bufArr1[i][15], bufArr1[i][16], bufArr1[i][18], bufArr1[i][19], bufArr2[i][1], bufArr2[i][3], bufArr2[i][7].match(/\d+\.\d+/), bufArr2[i][2], bufArr1[i][6])

    inputArr.push(inpFeed)
  };

  // Create the ProductCatalogFeed and InventoryFeed objects arrays
  for (var i = 0; i < inputArr.length; i++) {
    var productCatalog, inventory, available;

    if (typeof inputArr[i].availability == "number") {
      available = inputArr[i].availability
    } else if (inputArr[i].availability == "in stock") {
      available = 1
    } else {
      available = 0
    };

    var attributesJSON = new AtributesObj(inputArr[i][inputFeedHeaders[8]],
                                  inputArr[i][inputFeedHeaders[12]],
                                  inputArr[i][inputFeedHeaders[13]],
                                  inputArr[i][inputFeedHeaders[14]],
                                  inputArr[i][inputFeedHeaders[15]],
                                  inputArr[i][inputFeedHeaders[16]],
                                  inputArr[i][inputFeedHeaders[18]],
                                  inputArr[i][inputFeedHeaders[19]]);

    productCatalog = new ProductCatalogFeed(inputArr[i].gtin, inputArr[i].mpn, inputArr[i].title, inputArr[i].brand, "", inputArr[i].description, "", "", inputArr[i].image_link, "", "", inputArr[i].google_product_category, inputArr[i].product_type,JSON.stringify(attributesJSON));

    inventory = new InventoryFeed(inputArr[i].store_nr, inputArr[i].gtin, inputArr[i].price, "", "", "", inputArr[i].shipping, available, inputArr[i].link)

    productsArr.push(productCatalog)
    invetntoryArr.push(inventory)
  }

  // Create the strings to append to ProductCatalogDataFeed.csv
  fs.writeFileSync(outputProductCatalog, productFeedHeaders.join(';') + '\n', 'utf8')
  for (var i = 0; i < productsArr.length; i++) {
    var csvDataString = '';
    for (var j = 0; j < productFeedHeaders.length; j++) {
      csvDataString += productsArr[i][productFeedHeaders[j]]
      if (j < productFeedHeaders.length - 1){
        csvDataString += ';'
      };
    };
    if (i < productsArr.length - 1){
      csvDataString += '\n'
    }
    fs.appendFileSync(outputProductCatalog, csvDataString, 'utf8')
  };

  // Create the strings to append to InventoryDataFeed.csv
  fs.writeFileSync(outputInventory, inventoryFeedHeaders.join(';') + '\n', 'utf8')
  for (var i = 0; i < invetntoryArr.length; i++) {
    var csvDataString = '';
    for (var j = 0; j < inventoryFeedHeaders.length; j++) {
      csvDataString += invetntoryArr[i][inventoryFeedHeaders[j]]
      if (j < inventoryFeedHeaders.length - 1){
        csvDataString += ';'
      };
    };
    if (i < invetntoryArr.length - 1){
      csvDataString += '\n'
    }
    fs.appendFileSync(outputInventory, csvDataString, 'utf8')
  };
  return [outputProductCatalog, outputInventory]

};

var uploadData = function (connectionProperties, files, destPath) {
  for (var i = 0; i < files.length; i++) {
    var c = new Client();
    c.on('ready', function() {
      c.put(files[i], destPath[i], function(err) {
        if (err) throw err;
        c.end();
      });
    });
    // connect to localhost:21 as anonymous
    c.connect(connectionProperties);
  }
};

module.exports = {
  downloadLink: downloadLink,
  processFeed: processFeed,
  uploadData: uploadData
}