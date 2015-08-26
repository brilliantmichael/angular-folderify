define([
  'lodash',
  'alertify',
  '../lib/angular/angular.schema.viewFunctions.data.Suppliers[].proposedSkus',
  '../lib/angular/angular.schema.viewFunctions.data.Products',
  '../lib/angular/angular.schema.viewFunctions.data.Issues'
], function(
  _,
  alertify,
  $viewFunctions_data_Suppliers___proposedSkus,
  $viewFunctions_data_Products,
  $viewFunctions_data_Issues
) {

  return {
    "data": {
      labelKey: "Suppliers"
    },

    // ../Suppliers.html

    "data.Suppliers": {
      viewTemplate: "suppliersView.html", // supplier list
      labelKey: "Company"
    },


    "data.Suppliers[]": {
      viewTemplate: "supplierProfileView.html", // supplier profile
      labelKey: "Company",
      primaryKey: "Account ID",
      labelMap: {
        addresses: "Addresses",
        margin_rates: "Margin rates",
        people: "People",
        proposedSkus: "Proposed SKUs",
        shipping_rates: "Shipping rates",
        issues: "Issues",
        website: "Website"
      },
      propertiesToLink: [{
        path: "data.Products",
        propertyName: "Products",
        localKey: "Company",
        foreignKey: "dropship_supplier_name"
      }, {
        path: "data.Orders",
        propertyName: "Orders",
        localKey: "Company",
        foreignKey: "Vendor Name"
      }, {
        path: "data.People",
        propertyName: "People",
        localKey: "Company",
        foreignKey: "Company"
      }, {
        path: "data.Issues",
        propertyName: "Issues",
        localKey: "Company",
        foreignKey: "Company"
      }],
      propertiesToSync: [{
        propertyName: "proposedSkus",
        primaryKey: "title",
        syncWith: "//danmurphys-marketplace.s3.amazonaws.com/form-data/data.Suppliers[].proposedSkus/data.Suppliers[].proposedSkus.{{primaryKeyParent}}.json",
        valueIfNotFound: []
      }]
    },
    "data.Suppliers[].issues": {
      labelKey: "createdAt",
      primaryKey: "createdAt",
      viewTemplate: "supplierIssues.html"
    },
    "data.Suppliers[].proposedSkus": {
      labelKey: "title",
      primaryKey: "title",
      viewTemplate: "supplierProposedSkus.html",
      viewFunctions: $viewFunctions_data_Suppliers___proposedSkus
    },

    "data.Suppliers[].addresses": {
      labelKey: "type"
    },
    "data.Suppliers[].Orders": {
      labelKey: "PO Number"
    },
    "data.Suppliers[].Orders[]": {
      viewTemplate: "ordersView.html",
      primaryKey: "PO Number"
    },
    "data.Suppliers[].Products": {
      viewTemplate: "supplierProductsView.html",
      labelKey: "title"
    },
    "data.Suppliers[].People": {
      labelKey: "firstname"
    },
    "data.Suppliers[].People[]": {
      viewTemplate: "peopleView.html",
      labelKey: "firstname",
      labelMap: {
        firstname: "First name",
        lastname: "Last name",
        role: "Role",
        emails: "Emails",
        phonenumbers: "Phone numbers"
      }
    },




    "data.Orders": {
      labelKey: "PO Number"
    },
    "data.Products": {
      labelKey: "title",
      viewTemplate: "productsView.html",
      viewFunctions: $viewFunctions_data_Products
    },
    "data.Issues": {
      viewTemplate: "issuesView.html",
      labelKey: "Subject",
      viewFunctions: $viewFunctions_data_Issues
    },
    "data.Issues[]": {
      labelMap: {
        Supplier_ID: "Supplier ID",
        createdAt: "Created at"
      }
    },




    "data.People": {
      labelKey: "firstname"
    },
    "data.People[]": {
      viewTemplate: "peopleView.html",
      labelKey: "firstname"
    }
  };
});
