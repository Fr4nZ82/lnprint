var mongoose = require('mongoose');

var ProductS = new mongoose.Schema({
  name: { //calendario A3 | orecchini belli
    type: String,
    unique: true,
    required: true
  },
  tags:Array,
  preset: String,  //calendario | orecchini
  works: Array,   //[123,234] | []
  description: String,  //un bel calendario | dei bei orecchini
  mainPhoto: String,
  photos: Array,
  video: String,
  extLink: String,
  draftPrice: Number,
  draftTime: Number,
  workPrice: Number,
  workTime: Number,
  copiesPrice: Number,
  copiesTime: Number,
  readyToSell: Number, //0 | 3
  listable: Boolean, //true | true
  shipmentType: String, //BC | ABC
  selled: { type: Number, default: 0 },
  date_modified: { type: Date, default: Date.now }
});

var Product = mongoose.model('Product', ProductS);
module.exports = Product;

/*
[
  {
    "type": "text",
    "required": true,
    "label": "Product name",
    "className": "form-control",
    "name": "productName",
    "subtype": "text"
  },
  {
    "type": "checkbox-group",
    "label": "
",
    "description": "de-flag the checkbox to hide this product to the users",
    "name": "pListable",
    "values": [
      {
        "label": "Listable",
        "value": "check",
        "selected": true
      }
    ]
  },
  {
    "type": "number",
    "label": "Disponibility",
    "description": "If this is a ready-made products insert how many piece are avaible to sell",
    "placeholder": "0",
    "className": "form-control",
    "name": "pDisponibility",
    "min": "0",
    "step": "1"
  },
  {
    "type": "textarea",
    "label": "Tags",
    "description": "Insert tags separed by comma",
    "className": "form-control",
    "name": "productTags",
    "subtype": "textarea"
  },
  {
    "type": "select",
    "label": "Form preset
",
    "className": "form-control",
    "name": "formPresets",
    "values": [
      {
        "label": "none",
        "value": "none",
        "selected": true
      },
      {
        "label": "calendario",
        "value": "calendario"
      },
      {
        "label": "only color",
        "value": "color"
      }
    ]
  },
  {
    "type": "textarea",
    "label": "Description",
    "className": "form-control",
    "name": "pDescription",
    "subtype": "textarea"
  },
  {
    "type": "radio-group",
    "label": "Shipment availability
",
    "description": "Select shipping method available for this product",
    "name": "pShipment",
    "values": [
      {
        "label": "Option 1",
        "value": "option-1"
      },
      {
        "label": "Option 2",
        "value": "option-2"
      },
      {
        "label": "Option 3",
        "value": "option-3"
      }
    ]
  },
  {
    "type": "file",
    "subtype": "fineuploader",
    "label": "Upload photos",
    "description": "You can upload multiple files",
    "className": "form-control",
    "name": "pPhotos",
    "multiple": true
  },
  {
    "type": "select",
    "label": "Main photo
",
    "description": "select product main photo",
    "className": "form-control",
    "name": "pMainPhoto",
    "values": [
      {
        "label": "Option 1",
        "value": "option-1",
        "selected": true
      },
      {
        "label": "Option 2",
        "value": "option-2"
      }
    ]
  },
  {
    "type": "text",
    "label": "Video (link)
",
    "description": "Optional insert a link to a video",
    "className": "form-control",
    "name": "pViedo",
    "subtype": "text"
  },
  {
    "type": "text",
    "label": "External link
",
    "description": "Optional insert an external link to product specifics",
    "className": "form-control",
    "name": "pExtLink",
    "subtype": "text"
  }
]
*/
