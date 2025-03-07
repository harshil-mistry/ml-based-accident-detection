import asyncio
import numpy as np
from ultralytics import YOLO
import cv2
import pywhatkit
import cvzone
import math
import time
from modules.sort import *
from geopy.geocoders import Nominatim
import base64

# Load YOLO model
model = YOLO('models/i1-yolov8s.pt')

cap = cv2.VideoCapture("./Videos/car-crash.mov")

# Alerting the Ambulance
async def send_whatsapp_message(phone_number, message):
   # pywhatkit.sendwhatmsg_instantly(phone_number, message)
    print(f"Sending WhatsApp message to {phone_number}: {message}")

async def main():
    tracker = Sort(max_age=20, min_hits=3, iou_threshold=0.3) # Tracking Objects Using Simple Online and Real Time
    totalAccidents = []
    tempConf = 0
    accident_count = 0
    total_processing_time = 0
    total_frames_analyzed = 0
    location = Nominatim(user_agent="iteration1-accident-detection-system", timeout=10)
    getLoc = location.reverse("23.1730605,72.5763418") # Assuming the Camera Is located here

    print(getLoc.raw)
    while True:
        start_time = time.time()  
        success, img = cap.read()
        if not success:
            break
        
        total_frames_analyzed += 1  # Increment frame count
        results = model(img, stream=True)
        detections = np.empty((0, 5))

        for r in results:
            boxes = r.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                w, h = x2 - x1, y2 - y1
                conf = math.ceil((box.conf[0] * 100)) / 100
                tempConf = conf

                if float(tempConf) > 0.5: # Rate of Accident Detection
                    cvzone.cornerRect(img, (x1, y1, w, h))
                    cvzone.putTextRect(img, f'Accident {conf}', (max(0, x1), max(35, y1)), colorR=(0, 165, 255))
                    currentArray = np.array([x1, y1, x2, y2, conf])
                    detections = np.vstack((detections, currentArray))

        trackerResults = tracker.update(detections)

        for result in trackerResults:
            x1, y1, x2, y2, id = result
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            id = int(id)
            w, h = x2 - x1, y2 - y1
            if totalAccidents.count(id) == 0:
                
                accident_count += 1

                if getLoc is not None:
                    _, frame_encoded = cv2.imencode('.jpg', img)
                    frame_base64 = base64.b64encode(frame_encoded).decode('utf-8')
                    data = {
                        "address": getLoc.address,
                        "city": getLoc.raw.get("address", {}).get("city"),
                        "latitude": getLoc.latitude,
                        "longitude": getLoc.longitude,
                        "severityInPercentage": tempConf * 100,
                        "severity": "Moderate",
                        "frame": frame_base64
                    }
                    # Send WhatsApp message to the designated number
                    message = f"Accident detected at {getLoc.address}, Severity: {tempConf * 100}%"
                    await send_whatsapp_message("+911212121212", message)

                cvzone.cornerRect(img, (x1, y1, w, h), colorR=(255, 0, 255))
                cvzone.putTextRect(img, f'{id}', (max(0, x1), max(35, y1)))
                cx, cy = x1 + w // 2, y1 + h // 2
                cv2.circle(img, (cx, cy), 5, (255, 0, 255), cv2.FILLED)
                totalAccidents.append(id)

        # Calculate processing time for each frame
        frame_processing_time = time.time() - start_time
        total_processing_time += frame_processing_time
        
        # Calculate the average processing time per accident detection
        avg_processing_time = total_processing_time / (accident_count if accident_count > 0 else 1)

        cvzone.putTextRect(img, f"Accidents Detected: {accident_count}", (10, 40), colorR=(0, 255, 0))
        #cvzone.putTextRect(img, f"Frames Analyzed: {total_frames_analyzed}", (10, 100), colorR=(0, 255, 0))
        #cvzone.putTextRect(img, f"Avg Processing Time: {avg_processing_time:.2f} sec", (10, 140), colorR=(0, 255, 0))
        
        # Display the video
        cv2.imshow("CCTV Camera", img)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        await asyncio.sleep(0.01)

    print(f"Total Accidents Detected: {accident_count}")
    print(f"Total Frames Analyzed: {total_frames_analyzed}")
    print(f"Average Processing Time per Accident: {avg_processing_time:.2f} seconds")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main())
    finally:
        loop.close()
