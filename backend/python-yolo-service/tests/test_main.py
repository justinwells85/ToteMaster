"""
Unit tests for YOLO service
Tests the FastAPI endpoints and YOLO detection logic with mocked dependencies
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from PIL import Image
import io

# Mock YOLO before importing main
@pytest.fixture(autouse=True)
def mock_yolo_model():
    """Mock the YOLO model to avoid loading actual model in tests"""
    with patch('main.YOLO') as mock_yolo:
        # Create mock model instance
        mock_model_instance = Mock()
        mock_model_instance.names = {
            0: 'person', 15: 'cat', 16: 'dog', 63: 'laptop',
            64: 'mouse', 65: 'remote', 66: 'keyboard', 67: 'cell phone'
        }
        mock_yolo.return_value = mock_model_instance
        yield mock_model_instance


@pytest.fixture
def client():
    """Create test client"""
    # Import after YOLO is mocked
    from main import app
    return TestClient(app)


@pytest.fixture
def sample_image():
    """Create a sample test image"""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes


class TestHealthCheck:
    """Test health check endpoint"""

    def test_root_endpoint(self, client):
        """Test GET / returns service info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "YOLO Object Detection"
        assert data["version"] == "2.0.0"
        assert data["model"] == "YOLOv11n"
        assert data["status"] == "healthy"


class TestAnalyzeSinglePhoto:
    """Test single photo analysis endpoint"""

    @patch('main.download_image')
    @patch('main.detect_objects')
    def test_analyze_photo_success(self, mock_detect, mock_download, client, sample_image):
        """Test successful photo analysis"""
        # Mock image download
        mock_download.return_value = Image.new('RGB', (100, 100))

        # Mock object detection
        mock_detect.return_value = [
            {'class': 'laptop', 'confidence': 0.92},
            {'class': 'mouse', 'confidence': 0.85},
        ]

        request_data = {
            "photoUrl": "http://localhost:3000/uploads/test.jpg"
        }

        response = client.post("/analyze", json=request_data)
        assert response.status_code == 200

        data = response.json()
        assert "items" in data
        assert "photosAnalyzed" in data
        assert data["photosAnalyzed"] == 1
        assert len(data["items"]) == 2

        # Verify first item
        assert data["items"][0]["name"] == "Laptop"
        assert data["items"][0]["category"] == "electronics"
        assert data["items"][0]["confidence"] == "high"
        assert data["items"][0]["aiGenerated"] is True

    @patch('main.download_image')
    def test_analyze_photo_download_failure(self, mock_download, client):
        """Test handling of image download failure"""
        mock_download.side_effect = Exception("Failed to download")

        request_data = {
            "photoUrl": "http://localhost:3000/uploads/test.jpg"
        }

        response = client.post("/analyze", json=request_data)
        assert response.status_code >= 400

    @patch('main.download_image')
    @patch('main.detect_objects')
    def test_analyze_photo_no_detections(self, mock_detect, mock_download, client):
        """Test analysis with no objects detected"""
        mock_download.return_value = Image.new('RGB', (100, 100))
        mock_detect.return_value = []

        request_data = {
            "photoUrl": "http://localhost:3000/uploads/test.jpg"
        }

        response = client.post("/analyze", json=request_data)
        assert response.status_code == 200

        data = response.json()
        assert data["items"] == []
        assert data["photosAnalyzed"] == 1


class TestAnalyzeMultiplePhotos:
    """Test multiple photos analysis endpoint"""

    @patch('main.download_image')
    @patch('main.detect_objects')
    def test_analyze_multiple_photos_success(self, mock_detect, mock_download, client):
        """Test successful multiple photo analysis"""
        mock_download.return_value = Image.new('RGB', (100, 100))
        mock_detect.side_effect = [
            [{'class': 'laptop', 'confidence': 0.92}],
            [{'class': 'laptop', 'confidence': 0.88}, {'class': 'mouse', 'confidence': 0.85}],
        ]

        request_data = {
            "photoUrls": [
                "http://localhost:3000/uploads/photo1.jpg",
                "http://localhost:3000/uploads/photo2.jpg"
            ]
        }

        response = client.post("/analyze-multiple", json=request_data)
        assert response.status_code == 200

        data = response.json()
        assert data["photosAnalyzed"] == 2
        assert len(data["items"]) > 0

        # Verify consolidation - laptops should be consolidated
        laptop_items = [item for item in data["items"] if item["name"] == "Laptop"]
        assert len(laptop_items) == 1
        assert laptop_items[0]["quantity"] == 2  # Consolidated from 2 photos

    @patch('main.download_image')
    @patch('main.detect_objects')
    def test_analyze_multiple_photos_partial_failure(self, mock_detect, mock_download, client):
        """Test handling when some photos fail to analyze"""
        def download_side_effect(url):
            if "photo1" in url:
                return Image.new('RGB', (100, 100))
            raise Exception("Failed to download")

        mock_download.side_effect = download_side_effect
        mock_detect.return_value = [{'class': 'laptop', 'confidence': 0.92}]

        request_data = {
            "photoUrls": [
                "http://localhost:3000/uploads/photo1.jpg",
                "http://localhost:3000/uploads/photo2.jpg"
            ]
        }

        response = client.post("/analyze-multiple", json=request_data)
        assert response.status_code == 200

        data = response.json()
        # Should still return results from successful photos
        assert data["photosAnalyzed"] == 2


class TestDetectionLogic:
    """Test object detection and mapping logic"""

    @patch('main.model')
    def test_detect_objects_with_mock_model(self, mock_model, sample_image):
        """Test object detection with mocked YOLO model"""
        from main import detect_objects

        # Mock YOLO results
        mock_result = Mock()
        mock_box = Mock()
        mock_box.cls = [63]  # laptop class
        mock_box.conf = [0.92]
        mock_result.boxes = [mock_box]
        mock_model.return_value = [mock_result]
        mock_model.names = {63: 'laptop'}

        img = Image.new('RGB', (100, 100))
        detections = detect_objects(img, confidence_threshold=0.5)

        assert len(detections) == 1
        assert detections[0]['class'] == 'laptop'
        assert detections[0]['confidence'] == 0.92

    def test_category_mapping(self):
        """Test that detected classes map to correct categories"""
        from main import CATEGORY_MAPPING

        # Test electronics mapping
        assert CATEGORY_MAPPING['laptop'] == 'electronics'
        assert CATEGORY_MAPPING['cell phone'] == 'electronics'
        assert CATEGORY_MAPPING['keyboard'] == 'electronics'

        # Test kitchen mapping
        assert CATEGORY_MAPPING['bottle'] == 'kitchen'
        assert CATEGORY_MAPPING['cup'] == 'kitchen'

        # Test sports mapping
        assert CATEGORY_MAPPING['sports ball'] == 'sports'

    def test_map_detection_to_item(self):
        """Test detection to item conversion"""
        from main import map_detection_to_item

        detection = {
            'class': 'laptop',
            'confidence': 0.92
        }
        photo_url = 'http://test.com/photo.jpg'

        item = map_detection_to_item(detection, photo_url)

        assert item.name == 'Laptop'
        assert item.category == 'electronics'
        assert item.confidence == 'high'
        assert item.quantity == 1
        assert item.condition == 'good'
        assert item.aiGenerated is True
        assert item.sourcePhoto == photo_url

    def test_confidence_level_mapping(self):
        """Test confidence score to level mapping"""
        from main import map_detection_to_item

        # High confidence
        high_conf = map_detection_to_item({'class': 'laptop', 'confidence': 0.92}, 'url')
        assert high_conf.confidence == 'high'

        # Medium confidence
        med_conf = map_detection_to_item({'class': 'laptop', 'confidence': 0.65}, 'url')
        assert med_conf.confidence == 'medium'

        # Low confidence
        low_conf = map_detection_to_item({'class': 'laptop', 'confidence': 0.45}, 'url')
        assert low_conf.confidence == 'low'


class TestItemConsolidation:
    """Test item consolidation logic"""

    def test_consolidate_duplicate_items(self):
        """Test consolidating items with same name and category"""
        from main import consolidate_items, DetectedItem

        items = [
            DetectedItem(
                name="Laptop",
                description="Test",
                category="electronics",
                quantity=1,
                condition="good",
                confidence="high",
                sourcePhoto="photo1.jpg"
            ),
            DetectedItem(
                name="Laptop",
                description="Test",
                category="electronics",
                quantity=1,
                condition="good",
                confidence="high",
                sourcePhoto="photo2.jpg"
            ),
        ]

        consolidated = consolidate_items(items)

        assert len(consolidated) == 1
        assert consolidated[0].quantity == 2

    def test_consolidate_different_items(self):
        """Test that different items are not consolidated"""
        from main import consolidate_items, DetectedItem

        items = [
            DetectedItem(
                name="Laptop",
                category="electronics",
                quantity=1,
                description="", condition="good", confidence="high", sourcePhoto="url"
            ),
            DetectedItem(
                name="Mouse",
                category="electronics",
                quantity=1,
                description="", condition="good", confidence="high", sourcePhoto="url"
            ),
        ]

        consolidated = consolidate_items(items)

        assert len(consolidated) == 2

    def test_consolidate_confidence_levels(self):
        """Test that higher confidence is preserved when consolidating"""
        from main import consolidate_items, DetectedItem

        items = [
            DetectedItem(
                name="Laptop",
                category="electronics",
                quantity=1,
                confidence="medium",
                description="", condition="good", sourcePhoto="url"
            ),
            DetectedItem(
                name="Laptop",
                category="electronics",
                quantity=1,
                confidence="high",
                description="", condition="good", sourcePhoto="url"
            ),
        ]

        consolidated = consolidate_items(items)

        assert len(consolidated) == 1
        assert consolidated[0].confidence == "high"


class TestImageDownload:
    """Test image download functionality"""

    @patch('main.requests.get')
    def test_download_image_success(self, mock_get):
        """Test successful image download"""
        from main import download_image

        # Mock successful response
        mock_response = Mock()
        mock_response.status_code = 200
        img = Image.new('RGB', (100, 100))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        mock_response.content = img_bytes.getvalue()
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        result = download_image("http://test.com/image.jpg")
        assert isinstance(result, Image.Image)

    @patch('main.requests.get')
    def test_download_image_failure(self, mock_get):
        """Test image download failure"""
        from main import download_image

        mock_get.side_effect = Exception("Connection error")

        with pytest.raises(Exception):
            download_image("http://test.com/image.jpg")


@pytest.mark.parametrize("object_class,expected_category", [
    ("laptop", "electronics"),
    ("cell phone", "electronics"),
    ("bottle", "kitchen"),
    ("cup", "kitchen"),
    ("sports ball", "sports"),
    ("book", "books"),
    ("teddy bear", "toys"),
    ("unknown_item", "uncategorized"),
])
def test_category_mappings(object_class, expected_category):
    """Test all category mappings"""
    from main import CATEGORY_MAPPING
    assert CATEGORY_MAPPING.get(object_class, 'uncategorized') == expected_category
