## HROne

### Backend

# API Testing Examples and Results

This document provides example API requests and their expected responses for the **Product** and **Order** endpoints.

### -Note: For MongoDB hosting, I opted for ScaleGrid instead of MongoDB Atlas due to issues with TLS certificate verification on Render.
---

## 1. Product Endpoints

### 🔹 Create Product

**Method:** POST
**URL:** https://hrone-d4cc.onrender.com/products
**Headers:**
- Content-Type: application/json

**Request Body:**
```json
{
  "name": "Premium Laptop",
  "price": 1299.99,
  "sizes": ["Standard"]
}
```

**Expected Response:**
```json
{
  "id": "687b0527bd3b1eb21cea2a80"
}
```

---

### 🔹 List Products

**Method:** GET
**URL:** https://hrone-d4cc.onrender.com/products
**Query Parameters:**
- name: laptop
- limit: 5
- offset: 0

**Expected Response:**
```json
{
  "data": [
    {
      "id": "687b0392d6d8680060602f19",
      "name": "Premium Laptop",
      "price": 1299.99
    },
    {
      "id": "687b04ba0cece5fbfcc6e3c8",
      "name": "Premium Laptop",
      "price": 1299.99
    },
    {
      "id": "687b0527bd3b1eb21cea2a80",
      "name": "Premium Laptop 2025",
      "price": 1299.99
    }
  ],
  "page": {
    "next": 5,
    "limit": 3,
    "previous": -5
  }
}
```

---

## 2. Order Endpoints

### 🔹 Create Order

**Method:** POST
**URL:** https://hrone-d4cc.onrender.com/orders
**Headers:**
- Content-Type: application/json

**Request Body:**
```json
{
  "userId": "user123",
  "items": [{
    "productId": "687b0527bd3b1eb21cea2a80",
    "qty": 2
  }]
}
```

**Expected Response:**
```json
{
  "id": "687b052fbd3b1eb21cea2a81"
}
```

---

### 🔹 Get User Orders

**Method:** GET
**URL:** https://hrone-d4cc.onrender.com/orders/user123
**Query Parameters:**
- limit: 3
- offset: 0

**Expected Response:**
```json
{
  "data": [
    {
      "id": "687b052fbd3b1eb21cea2a81",
      "items": [
        {
          "productDetails": {
            "name": "Premium Laptop 2025",
            "id": "687b0527bd3b1eb21cea2a80"
          },
          "qty": 2
        }
      ],
      "total": 2599.98
    }
  ],
  "page": {
    "next": 3,
    "limit": 1,
    "previous": 0
  }
}
```

---

## ✅ Key Features Demonstrated

### 📦 Product Management

* Creates products with unique IDs
* Lists products with pagination and optional search
* Case-insensitive search supported

### 📑 Order Management

* Creates orders associated with users
* Links products with orders and computes total price
* Returns detailed product info in order responses

### 🔄 Pagination Support

* All list endpoints support `limit` and `offset`
* Returns accurate pagination metadata (`next`, `previous`, `limit`)

### 🚫 Error Handling

* Returns meaningful error messages
* Handles invalid IDs gracefully
* 404 returned for non-existent resources


## 2. Frontend

### Json Schema Builder

This is a json schema builder that can be used to build json schemas for any purpose.

**Preview:** https://hr-one-frontend.vercel.app/

**Screenshot:**

![Screenshot of the json schema builder](./frontend/public/json%20fromatter.png)