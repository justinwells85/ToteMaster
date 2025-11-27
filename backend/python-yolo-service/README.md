# YOLO Object Detection Service

Python FastAPI microservice that uses YOLOv8 to detect objects in tote photos.

## Features

- **YOLOv8n** model (nano - fastest, ~6MB)
- **80 object classes** detection (COCO dataset)
- **Real-time detection** (~30ms per image on GPU)
- **No API costs** - runs locally
- **Auto category mapping** to inventory categories

## Setup

### 1. Create Virtual Environment

```bash
cd backend/python-yolo-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

On first run, YOLOv8n model (~6MB) will be automatically downloaded.

### 3. Run Service

```bash
# Development
python main.py

# Production with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Service will run on `http://localhost:8001`

## API Endpoints

### GET /
Health check endpoint

**Response:**
```json
{
  "service": "YOLO Object Detection",
  "version": "1.0.0",
  "model": "YOLOv8n",
  "status": "healthy"
}
```

### POST /analyze
Analyze a single photo

**Request:**
```json
{
  "photoUrl": "http://localhost:3000/uploads/totes/123/photo.jpg"
}
```

**Response:**
```json
{
  "items": [
    {
      "name": "Laptop",
      "description": "Detected with 92% confidence",
      "category": "electronics",
      "quantity": 1,
      "condition": "good",
      "confidence": "high",
      "aiGenerated": true,
      "sourcePhoto": "http://localhost:3000/uploads/totes/123/photo.jpg"
    }
  ],
  "photosAnalyzed": 1
}
```

### POST /analyze-multiple
Analyze multiple photos and consolidate results

**Request:**
```json
{
  "photoUrls": [
    "http://localhost:3000/uploads/totes/123/photo1.jpg",
    "http://localhost:3000/uploads/totes/123/photo2.jpg"
  ]
}
```

## YOLOv8 Models

| Model | Size | Speed (CPU) | Speed (GPU) | mAP |
|-------|------|-------------|-------------|-----|
| YOLOv8n | 6.2MB | ~40ms | ~1.5ms | 37.3 |
| YOLOv8s | 21.5MB | ~80ms | ~2.5ms | 44.9 |
| YOLOv8m | 49.7MB | ~180ms | ~5.0ms | 50.2 |
| YOLOv8l | 83.7MB | ~320ms | ~8.0ms | 52.9 |
| YOLOv8x | 130.5MB | ~520ms | ~12.0ms | 53.9 |

Default: **YOLOv8n** (nano) for fastest performance. Change in `main.py`:
```python
model = YOLO('yolov8s.pt')  # small
model = YOLO('yolov8m.pt')  # medium
model = YOLO('yolov8l.pt')  # large
model = YOLO('yolov8x.pt')  # extra large
```

## Detected Object Classes (COCO)

The service can detect 80 object classes including:

**Electronics:** laptop, cell phone, tv, keyboard, mouse, remote, clock
**Kitchen:** bottle, cup, fork, knife, spoon, bowl, microwave, oven, toaster
**Clothing:** handbag, tie, suitcase, umbrella, backpack
**Sports:** frisbee, sports ball, skateboard, surfboard, tennis racket
**Tools:** scissors, hair drier, toothbrush
**Books/Toys:** book, teddy bear
**Furniture:** chair, couch, potted plant, bed, dining table

See `CATEGORY_MAPPING` in `main.py` for full list and category assignments.

## Configuration

### Confidence Threshold

Adjust detection sensitivity (default: 0.5 = 50%)

```python
detections = detect_objects(image, confidence_threshold=0.7)  # Higher = fewer, more confident detections
```

### Add Custom Categories

Edit `CATEGORY_MAPPING` in `main.py`:

```python
CATEGORY_MAPPING = {
    'laptop': 'electronics',
    'your_object': 'your_category',
    # ...
}
```

## Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

Build and run:
```bash
docker build -t yolo-service .
docker run -p 8001:8001 yolo-service
```

## GPU Acceleration (Optional)

For faster inference on NVIDIA GPUs:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

YOLOv8 will automatically use GPU if available.

## Troubleshooting

**Model download fails:**
- Check internet connection
- Manually download from: https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
- Place in project directory

**Low detection accuracy:**
- Increase model size (yolov8s, yolov8m, etc.)
- Adjust confidence threshold
- Ensure good image quality and lighting

**Slow performance:**
- Use YOLOv8n (fastest)
- Enable GPU acceleration
- Reduce image resolution before detection
