'''from ultralytics import YOLO
import cv2
import os
# from patched_yolo_infer import MakeCropsDetectThem, CombineDetections
# def extract_severity_features(detections, image_shape):
#     H, W = image_shape[:2]
#     image_area = H * W

#     total_garbage_area = 0
#     grid_cells = [[0] * 3 for _ in range(3)] 
#     count = 0
#     box_areas = []
#     for det in detections:
#         x1, y1, x2, y2 = det
#         area = (x2 - x1) * (y2 - y1)
#         total_garbage_area += area
#         box_areas.append(area)
#         count += 1
#         cx = int(((x1 + x2) / 2) / W * 3)
#         cy = int(((y1 + y2) / 2) / H * 3)
#         cx, cy = min(cx, 2), min(cy, 2)
#         grid_cells[cy][cx] += 1

#     density = total_garbage_area / image_area
#     scatter_score = sum(1 for row in grid_cells for val in row if val > 0)
#     avg_box_area = sum(box_areas) / count if count > 0 else 0

#     return {
#         "count": count,
#         "density": density,
#         "scatter_score": scatter_score,
#         "avg_box_area": avg_box_area
#     }


# def get_severity_label(features):
#     count = features['count']
#     density = features['density']   
#     scatter_score = features['scatter_score']
#     avg_box_area = features['avg_box_area']
#     if density>0.35 or count >20 or scatter_score>=6:
#         return "High"
#     elif density>0.15 or count >10 or scatter_score>=4:
#         return "Medium"
#     else:
#         return "Low"
    

def get_detection_boxes(results):
    boxes = []
    for box in results.boxes.xyxy:
        x1, y1, x2, y2 = map(int, box.tolist())
        boxes.append((x1, y1, x2, y2))
    return boxes

def detect_objects(model, image):
    return model(image,save=True)[0]
def load_image(image_path):
    return cv2.imread(image_path)

def load_model(model_path):
    return YOLO(model_path)

def run_pipeline(model_path, image_path):
    model = load_model(model_path)
    img = load_image(image_path)
    # image_shape = img.shape
    results = detect_objects(model, img)
    # boxes = get_detection_boxes(results)
    # features = extract_severity_features(boxes, image_shape)
    # label = get_severity_label(features)
    
    # return [results, features, label]
    return results
def get_patches_from_results(results, save=False, prefix="patch", save_dir = "uploads"):
    image = results.orig_img
    boxes = results.boxes.xyxy  # Bounding box coordinates
    patches = []
    if save : 
        if os.path.exists(save_dir) : 
            for f in os.listdir(save_dir) : 
                os.remove(os.path.join(save_dir, f))
        else :
            os.makedirs(save_dir)
        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box.tolist())
            patch = image[y1:y2, x1:x2]
            patches.append(patch)
            if save:
                filename = f"{prefix}_{i}.jpg"
                save_path = os.path.join(save_dir, filename)
                cv2.imwrite(save_path, patch)
    return patches
'''

from ultralytics import YOLO
import cv2
import os
'''
# def get_detection_boxes(results):
#     boxes = []
#     for box in results.boxes.xyxy:
#         x1, y1, x2, y2 = map(int, box.tolist())
#         boxes.append((x1, y1, x2, y2))
#     return boxes

# def extract_severity_features(detections, image_shape):
#     H, W = image_shape[:2]
#     image_area = H * W

#     total_garbage_area = 0
#     grid_cells = [[0] * 3 for _ in range(3)] 
#     count = 0
#     box_areas = []

#     for det in detections:
#         x1, y1, x2, y2 = det
#         area = (x2 - x1) * (y2 - y1)
#         total_garbage_area += area
#         box_areas.append(area)
#         count += 1
#         cx = int(((x1 + x2) / 2) / W * 3)
#         cy = int(((y1 + y2) / 2) / H * 3)
#         cx, cy = min(cx, 2), min(cy, 2)
#         grid_cells[cy][cx] += 1

#     density = total_garbage_area / image_area
#     scatter_score = sum(1 for row in grid_cells for val in row if val > 0)
#     avg_box_area = sum(box_areas) / count if count > 0 else 0

#     return {
#         "count": count,
#         "density": density,
#         "scatter_score": scatter_score,
#         "avg_box_area": avg_box_area
#     }

# def get_severity_label(features):
#     count = features['count']
#     density = features['density']
#     scatter_score = features['scatter_score']
#     avg_box_area = features['avg_box_area']

#     if density > 0.35 or count > 20 or scatter_score >= 6:
#         return "High"
#     elif density > 0.15 or count > 10 or scatter_score >= 4:
#         return "Medium"
#     else:
#         return "Low"

'''   
def detect_objects(model, image):
    return model(image, save=True)[0]

def load_image(image_path):
    return cv2.imread(image_path)

def load_model(model_path):
    return YOLO(model_path)

def run_pipeline(model_path, image_path):
    model = load_model(model_path)
    img = load_image(image_path)
    results = detect_objects(model, img)
    # boxes = get_detection_boxes(results)
    # features = extract_severity_features(boxes, img.shape)
    # label = get_severity_label(features)
    
    # return results, features, label
    return results

def get_patches_from_results(results, save=False, prefix="patch", save_dir="uploads"):
    image = results.orig_img
    boxes = results.boxes.xyxy
    patches = []

    if save:
        if os.path.exists(save_dir):
            for f in os.listdir(save_dir):
                os.remove(os.path.join(save_dir, f))
        else:
            os.makedirs(save_dir)

    for i, box in enumerate(boxes):
        x1, y1, x2, y2 = map(int, box.tolist())
        patch = image[y1:y2, x1:x2]
        patches.append(patch)
        if save:
            filename = f"{prefix}_{i}.jpg"
            save_path = os.path.join(save_dir, filename)
            cv2.imwrite(save_path, patch)

    return patches
