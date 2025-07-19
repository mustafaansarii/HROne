import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status, Query
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from pydantic import BaseModel, Field
from bson import ObjectId
from typing import List, Optional
load_dotenv()

app = FastAPI()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is not set")

# MongoDB connection
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    db = client["hrone"]
    products = db["products"]
    orders = db["orders"]
except ServerSelectionTimeoutError as e:
    raise ConnectionError(f"Failed to connect to MongoDB Atlas: {str(e)}")
except Exception as e:
    raise ConnectionError(f"Unexpected error connecting to MongoDB: {str(e)}")

# Product model
class ProductCreate(BaseModel):
    name: str
    price: float = Field(gt=0, description="Price must be greater than 0")
    sizes: List[str]

class ProductResponse(BaseModel):
    id: str
    name: str
    price: float

class PaginatedProductResponse(BaseModel):
    data: List[ProductResponse]
    page: dict

class OrderItemCreate(BaseModel):
    productId: str
    qty: int = Field(gt=0, description="Quantity must be greater than 0")

class OrderCreate(BaseModel):
    userId: str
    items: List[OrderItemCreate]

class ProductDetails(BaseModel):
    name: str
    id: str

class OrderItemResponse(BaseModel):
    productDetails: ProductDetails
    qty: int

class OrderResponse(BaseModel):
    id: str
    items: List[OrderItemResponse]
    total: float

class PaginatedOrderResponse(BaseModel):
    data: List[OrderResponse]
    page: dict

# Product endpoints
@app.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate):
    product_data = product.dict()
    result = products.insert_one(product_data)
    return {"id": str(result.inserted_id)}

@app.get("/products", response_model=PaginatedProductResponse)
async def list_products(
    name: Optional[str] = Query(None),
    size: Optional[str] = Query(None),
    limit: int = Query(10, gt=0, le=1000), 
    offset: int = Query(0, ge=0)
):
    query = {}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    if size:
        query["sizes"] = size
    
    cursor = products.find(query).skip(offset).limit(limit)
    product_list = []
    for product in cursor:
        product_list.append(ProductResponse(
            id=str(product["_id"]),
            name=product["name"],
            price=product["price"]
        ))
    
    next_offset = offset + limit
    prev_offset = offset - limit
    current_count = len(product_list)
    
    return {
        "data": product_list,
        "page": {
            "next": next_offset,
            "limit": current_count,
            "previous": prev_offset
        }
    }

# Order endpoints
@app.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
    try:
        product_ids = []
        valid_items = []
        
        for item in order.items:
            try:
                product_id = ObjectId(item.productId)
                product_ids.append(product_id)
                valid_items.append({"productId": product_id, "qty": item.qty})
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid product ID format: {item.productId}"
                )
        
        existing_products = list(products.find({"_id": {"$in": product_ids}}))
        if len(existing_products) != len(product_ids):
            raise HTTPException(
                status_code=400,
                detail="One or more product IDs do not exist in the database"
            )
        
        order_data = {
            "userId": order.userId,
            "items": valid_items
        }
        
        try:
            result = orders.insert_one(order_data)
            return {"id": str(result.inserted_id)}
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create order: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/orders/{user_id}", response_model=PaginatedOrderResponse)
def get_orders(
    user_id: str,
    limit: int = Query(10, gt=0, le=1000), 
    offset: int = Query(0, ge=0)
):
    try:
        pipeline = [
            {"$match": {"userId": user_id}},  
            {"$skip": offset},
            {"$limit": limit},
            {"$lookup": {
                "from": "products",
                "localField": "items.productId",
                "foreignField": "_id",
                "as": "product_details"
            }},
            {"$addFields": {
                "items": {
                    "$map": {
                        "input": "$items",
                        "as": "item",
                        "in": {
                            "qty": "$$item.qty",
                            "product": {
                                "$arrayElemAt": [
                                    {"$filter": {
                                        "input": "$product_details",
                                        "as": "pd",
                                        "cond": {"$eq": ["$$pd._id", "$$item.productId"]}
                                    }},
                                    0
                                ]
                            }
                        }
                    }
                }
            }},
            {"$addFields": {
                "total": {
                    "$sum": {
                        "$map": {
                            "input": "$items",
                            "as": "item",
                            "in": {
                                "$multiply": [
                                    "$$item.qty",
                                    {"$ifNull": ["$$item.product.price", 0]}
                                ]
                            }
                        }
                    }
                }
            }},
            {"$addFields": {
                "items": {
                    "$map": {
                        "input": "$items",
                        "as": "item",
                        "in": {
                            "qty": "$$item.qty",
                            "productDetails": {
                                "$cond": {
                                    "if": {"$ne": ["$$item.product", None]},
                                    "then": {
                                        "name": "$$item.product.name",
                                        "id": {"$toString": "$$item.product._id"}
                                    },
                                    "else": None
                                }
                            }
                        }
                    }
                }
            }},
            {"$project": {"product_details": 0}}
        ]
        
        order_list = []
        for order in orders.aggregate(pipeline):
            order_list.append(OrderResponse(
                id=str(order["_id"]),
                items=order["items"],
                total=order["total"]
            ))
        
        next_offset = offset + limit
        prev_offset = max(0, offset - limit)
        current_count = len(order_list)
        
        return {
            "data": order_list,
            "page": {
                "next": next_offset,
                "limit": current_count,
                "previous": prev_offset
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)