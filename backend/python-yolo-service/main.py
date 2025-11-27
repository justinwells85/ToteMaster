"""
YOLO Object Detection Service for Tote Master
Uses YOLOv8 to detect objects in tote photos and return structured item data
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
import uvicorn
import requests
from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="YOLO Object Detection Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLOv8 model (will download on first run)
logger.info("Loading YOLOv8 model...")
model = YOLO('yolov8n.pt')  # 'n' = nano (fastest), can use 's', 'm', 'l', 'x' for better accuracy
logger.info("YOLOv8 model loaded successfully")

# Map YOLO classes to inventory categories
CATEGORY_MAPPING = {
    # Electronics
    'laptop': 'electronics',
    'cell phone': 'electronics',
    'tv': 'electronics',
    'keyboard': 'electronics',
    'mouse': 'electronics',
    'remote': 'electronics',
    'clock': 'electronics',

    # Kitchen
    'bottle': 'kitchen',
    'wine glass': 'kitchen',
    'cup': 'kitchen',
    'fork': 'kitchen',
    'knife': 'kitchen',
    'spoon': 'kitchen',
    'bowl': 'kitchen',
    'banana': 'kitchen',
    'apple': 'kitchen',
    'orange': 'kitchen',
    'broccoli': 'kitchen',
    'carrot': 'kitchen',
    'pizza': 'kitchen',
    'donut': 'kitchen',
    'cake': 'kitchen',
    'refrigerator': 'kitchen',
    'microwave': 'kitchen',
    'oven': 'kitchen',
    'toaster': 'kitchen',

    # Clothing
    'handbag': 'clothing',
    'tie': 'clothing',
    'suitcase': 'clothing',
    'umbrella': 'clothing',
    'backpack': 'clothing',

    # Sports
    'frisbee': 'sports',
    'skis': 'sports',
    'snowboard': 'sports',
    'sports ball': 'sports',
    'kite': 'sports',
    'baseball bat': 'sports',
    'baseball glove': 'sports',
    'skateboard': 'sports',
    'surfboard': 'sports',
    'tennis racket': 'sports',

    # Toys/Books
    'book': 'books',
    'teddy bear': 'toys',

    # Tools
    'scissors': 'tools',
    'hair drier': 'tools',
    'toothbrush': 'tools',

    # Furniture/Decorations
    'chair': 'decorations',
    'couch': 'decorations',
    'potted plant': 'decorations',
    'bed': 'decorations',
    'dining table': 'decorations',
    'toilet': 'decorations',
    'sink': 'decorations',
    'vase': 'decorations',
}


class AnalyzeRequest(BaseModel):
    photoUrl: HttpUrl


class AnalyzeMultipleRequest(BaseModel):
    photoUrls: List[HttpUrl]


class DetectedItem(BaseModel):
    name: str
    description: str
    category: str
    quantity: int
    condition: str
    confidence: str
    aiGenerated: bool = True
    sourcePhoto: str


class AnalysisResponse(BaseModel):
    items: List[DetectedItem]
    photosAnalyzed: int


def download_image(url: str) -> Image.Image:
    """Download image from URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return Image.open(BytesIO(response.content))
    except Exception as e:
        logger.error(f"Failed to download image from {url}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")


def detect_objects(image: Image.Image, confidence_threshold: float = 0.5) -> List[dict]:
    """Detect objects using YOLOv8"""
    try:
        # Run inference
        results = model(image, conf=confidence_threshold)

        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get box details
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                class_name = model.names[cls]

                detections.append({
                    'class': class_name,
                    'confidence': conf,
                })

        logger.info(f"Detected {len(detections)} objects")
        return detections

    except Exception as e:
        logger.error(f"Detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


def map_detection_to_item(detection: dict, photo_url: str) -> DetectedItem:
    """Convert YOLO detection to inventory item format"""
    class_name = detection['class']
    confidence_score = detection['confidence']

    # Map to category
    category = CATEGORY_MAPPING.get(class_name.lower(), 'uncategorized')

    # Generate item name (capitalize and clean up)
    item_name = class_name.title()

    # Generate description based on confidence
    description = f"Detected with {confidence_score:.0%} confidence"

    # Determine confidence level
    if confidence_score >= 0.8:
        confidence_level = 'high'
    elif confidence_score >= 0.5:
        confidence_level = 'medium'
    else:
        confidence_level = 'low'

    # Estimate condition (YOLO can't determine this, default to 'good')
    condition = 'good'

    return DetectedItem(
        name=item_name,
        description=description,
        category=category,
        quantity=1,
        condition=condition,
        confidence=confidence_level,
        aiGenerated=True,
        sourcePhoto=photo_url,
    )


def consolidate_items(items: List[DetectedItem]) -> List[DetectedItem]:
    """Consolidate duplicate items and sum quantities"""
    item_map = {}

    for item in items:
        # Create unique key based on name and category
        key = f"{item.name.lower()}-{item.category}"

        if key in item_map:
            # Increment quantity
            item_map[key].quantity += 1

            # Update confidence to higher value
            confidence_levels = {'high': 3, 'medium': 2, 'low': 1}
            current_level = confidence_levels[item_map[key].confidence]
            new_level = confidence_levels[item.confidence]
            if new_level > current_level:
                item_map[key].confidence = item.confidence
        else:
            item_map[key] = item

    return list(item_map.values())


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "service": "YOLO Object Detection",
        "version": "1.0.0",
        "model": "YOLOv8n",
        "status": "healthy"
    }


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_photo(request: AnalyzeRequest):
    """Analyze a single photo and return detected items"""
    logger.info(f"Analyzing photo: {request.photoUrl}")

    # Download image
    image = download_image(str(request.photoUrl))

    # Detect objects
    detections = detect_objects(image)

    # Convert to items
    items = [map_detection_to_item(det, str(request.photoUrl)) for det in detections]

    # Consolidate duplicates
    consolidated_items = consolidate_items(items)

    return AnalysisResponse(
        items=consolidated_items,
        photosAnalyzed=1
    )


@app.post("/analyze-multiple", response_model=AnalysisResponse)
async def analyze_multiple_photos(request: AnalyzeMultipleRequest):
    """Analyze multiple photos and return consolidated detected items"""
    logger.info(f"Analyzing {len(request.photoUrls)} photos")

    all_items = []

    for photo_url in request.photoUrls:
        try:
            # Download image
            image = download_image(str(photo_url))

            # Detect objects
            detections = detect_objects(image)

            # Convert to items
            items = [map_detection_to_item(det, str(photo_url)) for det in detections]
            all_items.extend(items)

        except Exception as e:
            logger.error(f"Failed to analyze {photo_url}: {str(e)}")
            # Continue with other photos
            continue

    # Consolidate all items
    consolidated_items = consolidate_items(all_items)

    return AnalysisResponse(
        items=consolidated_items,
        photosAnalyzed=len(request.photoUrls)
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
