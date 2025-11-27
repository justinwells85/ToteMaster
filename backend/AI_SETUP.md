# AI-Powered Image Analysis Setup Guide

This guide explains how to set up and use the YOLOv11-based AI image analysis feature for automatic inventory item detection.

## Overview

The system now uses **YOLOv11** (You Only Look Once) for local, cost-free object detection instead of cloud-based APIs. YOLO is a state-of-the-art computer vision model that can detect 80 different object types in real-time.

### Benefits vs. OpenAI GPT-4 Vision

| Feature | YOLOv11 | OpenAI GPT-4 Vision |
|---------|---------|---------------------|
| **Cost** | Free (local) | ~$0.01 per image |
| **Speed** | ~20ms per image (GPU) | ~2-5 seconds per image |
| **Privacy** | Fully local, no data sent externally | Images sent to OpenAI |
| **Requirements** | Python 3.8+, ~200MB disk | API key, internet |
| **Accuracy** | Good for objects, no descriptions | Excellent for descriptions |
| **Offline** | ✅ Works offline | ❌ Requires internet |
| **vs YOLOv8** | 22% faster, better accuracy | N/A |

## Architecture

```
Frontend (React)
    ↓ HTTP
Node.js Backend (Express)
    ↓ HTTP (localhost:8001)
Python YOLO Service (FastAPI)
    ↓
YOLOv11 Model
```

## Quick Start

### Option 1: Automated Setup (Recommended)

**Linux/Mac:**
```bash
cd backend
./start-with-ai.sh
```

**Windows:**
```bash
cd backend
start-with-ai.bat
```

This will:
1. Create Python virtual environment (if needed)
2. Install all dependencies
3. Start YOLO service on port 8001
4. Start Node.js backend on port 3000

### Option 2: Manual Setup

#### 1. Install Python Dependencies

```bash
cd backend/python-yolo-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt
```

On first run, YOLOv11n model (~5MB) will be automatically downloaded.

#### 2. Start YOLO Service

**In Terminal 1:**
```bash
cd backend/python-yolo-service
source venv/bin/activate  # or venv\Scripts\activate.bat on Windows
python main.py
```

You should see:
```
INFO:     Loading YOLOv11 model...
INFO:     YOLOv11 model loaded successfully
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

#### 3. Start Node.js Backend

**In Terminal 2:**
```bash
cd backend
npm run dev
```

You should see:
```
INFO: YOLO service is available {"url":"http://localhost:8001","model":"YOLOv11n"}
Server running on port 3000
```

#### 4. Start Frontend

**In Terminal 3:**
```bash
cd frontend
npm run dev
```

## Configuration

### Environment Variables

Edit `backend/.env`:

```bash
# Enable AI features
AI_ENABLED=true

# YOLO service URL (default: http://localhost:8001)
YOLO_SERVICE_URL=http://localhost:8001
```

### YOLO Model Selection

Edit `backend/python-yolo-service/main.py` line 27:

```python
# Choose model size (n = nano, s = small, m = medium, l = large, x = extra large)
model = YOLO('yolov8n.pt')  # Fastest (default)
model = YOLO('yolov8s.pt')  # Better accuracy, slower
model = YOLO('yolov8m.pt')  # Even better accuracy
```

**Model Comparison:**

| Model | Size | Speed (CPU) | Speed (GPU) | Accuracy (mAP) |
|-------|------|-------------|-------------|----------------|
| n (nano) | 6MB | 40ms | 1.5ms | 37.3% |
| s (small) | 22MB | 80ms | 2.5ms | 44.9% |
| m (medium) | 50MB | 180ms | 5ms | 50.2% |
| l (large) | 84MB | 320ms | 8ms | 52.9% |

## Usage

1. **Navigate to a tote** in the web interface
2. **Upload photos** of the tote contents
3. **Click "Analyze with AI"** button
4. **Review detected items** with confidence levels
5. **Edit details** (name, category, quantity, condition)
6. **Select items** to add to inventory
7. **Click "Add X Items"** to create them

## Detected Object Classes

YOLOv11 can detect 80 object types from the COCO dataset:

### Electronics
laptop, cell phone, tv, keyboard, mouse, remote, clock

### Kitchen
bottle, cup, fork, knife, spoon, bowl, microwave, oven, toaster, wine glass, banana, apple, orange, pizza, cake

### Clothing
handbag, tie, suitcase, umbrella, backpack

### Sports
frisbee, sports ball, skateboard, surfboard, tennis racket, baseball bat/glove, skis, snowboard, kite

### Tools
scissors, hair drier, toothbrush

### Books/Toys
book, teddy bear

### Furniture/Decorations
chair, couch, potted plant, bed, dining table, vase, sink, toilet

*See `python-yolo-service/main.py` for complete list and category mappings.*

## Customization

### Add Custom Object-to-Category Mappings

Edit `backend/python-yolo-service/main.py`:

```python
CATEGORY_MAPPING = {
    'laptop': 'electronics',
    'knife': 'kitchen',
    # Add your custom mappings:
    'cell phone': 'electronics',  # Change category
    'your_object': 'your_category',
}
```

### Adjust Confidence Threshold

Edit `main.py` line 139:

```python
# Lower = more detections but less confident
# Higher = fewer detections but more confident
detections = detect_objects(image, confidence_threshold=0.5)  # Default: 50%
```

### Train Custom YOLO Model

For detecting custom items not in COCO dataset:

1. **Collect training images** of your items
2. **Annotate with bounding boxes** using tools like:
   - [Roboflow](https://roboflow.com/)
   - [LabelImg](https://github.com/heartexlabs/labelImg)
   - [CVAT](https://www.cvat.ai/)
3. **Train custom YOLOv11**:
   ```python
   from ultralytics import YOLO
   model = YOLO('yolov8n.pt')
   model.train(data='your_dataset.yaml', epochs=100)
   ```
4. **Use custom model**:
   ```python
   model = YOLO('runs/detect/train/weights/best.pt')
   ```

See [Ultralytics YOLOv11 Training Guide](https://docs.ultralytics.com/modes/train/)

## Troubleshooting

### YOLO service not starting

**Error:** `ModuleNotFoundError: No module named 'ultralytics'`
- **Solution:** Activate virtual environment and install dependencies
  ```bash
  cd backend/python-yolo-service
  source venv/bin/activate
  pip install -r requirements.txt
  ```

**Error:** `OSError: [Errno 48] Address already in use`
- **Solution:** Port 8001 is already in use. Kill the process or change port:
  ```bash
  # Find process using port 8001
  lsof -i :8001  # Mac/Linux
  netstat -ano | findstr :8001  # Windows

  # Kill the process or change port in main.py:
  uvicorn.run(app, host="0.0.0.0", port=8002)
  ```

### Node.js can't connect to YOLO service

**Error in logs:** `YOLO service not available`
- **Check:** Is YOLO service running?
  ```bash
  curl http://localhost:8001/
  # Should return: {"service":"YOLO Object Detection",...}
  ```
- **Check:** `.env` has correct URL:
  ```bash
  YOLO_SERVICE_URL=http://localhost:8001
  ```

### No items detected

**Issue:** "No items were identified in the photos"

**Solutions:**
1. **Check image quality:**
   - Ensure good lighting
   - Items should be clearly visible
   - Avoid blurry or dark photos

2. **Lower confidence threshold** (main.py line 139):
   ```python
   detections = detect_objects(image, confidence_threshold=0.3)
   ```

3. **Use larger model** for better accuracy:
   ```python
   model = YOLO('yolov8m.pt')  # Instead of 'yolov8n.pt'
   ```

4. **Check if objects are in COCO dataset:**
   - YOLO can only detect the 80 COCO classes
   - For custom items, you need to train a custom model

### Low accuracy / Wrong categories

1. **Use larger model:** `yolov8s.pt` or `yolov8m.pt`
2. **Adjust category mappings** in `CATEGORY_MAPPING`
3. **Train custom model** for your specific items

### Slow performance

1. **Use faster model:** `yolov8n.pt` (nano)
2. **Enable GPU acceleration:**
   ```bash
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   ```
3. **Reduce image size** before uploading
4. **Analyze fewer photos** at once

## GPU Acceleration (Optional)

For 10-30x faster inference:

### NVIDIA GPU (CUDA)

```bash
# Uninstall CPU-only PyTorch
pip uninstall torch torchvision

# Install GPU-enabled PyTorch
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Verify GPU is detected
python -c "import torch; print(torch.cuda.is_available())"
# Should print: True
```

### Apple Silicon (M1/M2/M3)

```bash
# PyTorch automatically uses Metal Performance Shaders
# No additional installation needed
python -c "import torch; print(torch.backends.mps.is_available())"
# Should print: True
```

## Deployment

### Docker Deployment

Create `backend/python-yolo-service/Dockerfile`:

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
cd backend/python-yolo-service
docker build -t totemaster-yolo .
docker run -p 8001:8001 totemaster-yolo
```

### Production Deployment

Use production ASGI server with workers:

```bash
# Install production server
pip install gunicorn

# Run with workers (CPU cores * 2 + 1)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

## Migration from OpenAI GPT-4 Vision

If you were previously using OpenAI:

1. **Remove OpenAI dependency** (already done):
   ```bash
   cd backend
   npm uninstall openai
   ```

2. **Update environment variables** in `.env`:
   ```bash
   # Remove these:
   # OPENAI_API_KEY=sk-...

   # Add these:
   AI_ENABLED=true
   YOLO_SERVICE_URL=http://localhost:8001
   ```

3. **Set up Python YOLO service** (see Quick Start above)

4. **Differences in results:**
   - YOLO detects **objects only** (no detailed descriptions)
   - YOLO can't assess **condition** (always defaults to "good")
   - YOLO provides **class names** (e.g., "Laptop", "Cell Phone")
   - YOLO is **faster** and **free** but less descriptive

## FAQ

**Q: Can I use both YOLO and OpenAI?**
A: Currently, only one AI service can be active at a time. The codebase is configured for YOLO.

**Q: Do I need an internet connection?**
A: Only for initial model download (~6MB). After that, YOLO works fully offline.

**Q: Can I deploy this on a server?**
A: Yes! Use Docker or deploy both services (Node.js + Python) on your server.

**Q: How much disk space do I need?**
A: ~500MB (Python venv + dependencies + YOLO model)

**Q: Can I use custom object classes?**
A: Yes, but you'll need to train a custom YOLOv11 model. See "Train Custom YOLO Model" above.

**Q: Why is detection slow on Windows?**
A: YOLO uses CPU by default. Enable GPU acceleration for 10-30x speedup (see GPU Acceleration section).

## Support

For issues or questions:
1. Check this guide
2. Review `python-yolo-service/README.md`
3. Check logs in both services
4. Open an issue on GitHub

## Resources

- [YOLOv11 Documentation](https://docs.ultralytics.com/)
- [COCO Dataset Classes](https://cocodataset.org/#explore)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Training Custom Models](https://docs.ultralytics.com/modes/train/)
