from flask import Flask, render_template, request
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect', methods=['GET', 'POST'])  # Include POST for form submission
def detect():
    if request.method == 'POST':
        # Handle file upload
        uploaded_file = request.files.get('video')
        if uploaded_file:
            # Process the uploaded file
            return "Video uploaded successfully!"
        else:
            return "No video uploaded!", 400
    return render_template('detect.html')

@app.route('/report')
def report():
    return render_template('report.html')

@app.route('/ai-detection')
def ai_detection():
    return render_template('ai-detection.html')

@app.route('/early-warning')
def early_warning():
    return render_template('early-warning.html')

@app.route('/guidelines')
def guidelines():
    return render_template('guidelines.html')

@app.route('/smart-mapping')
def smart_mapping():
    return render_template('smart-mapping.html')

@app.route('/traffic')
def traffic():

    url = "https://api.weatherstack.com/current?access_key=key"
    ip_address = request.remote_addr
    response = requests.get(f"https://ipapi.co/{ip_address}/json/")
    data = response.json()
    city = data.get('city') if data.get('city') else 'Ahmedabad'
    print(city)
    querystring = {"query": city}
    response = requests.get(url, params=querystring)

    weather_data = response.json()

    # Extract current weather data
    current_weather = weather_data['current']

    # Define safety thresholds
    SAFE_TEMPERATURE_RANGE = (0, 40)  # Degrees Celsius
    SAFE_VISIBILITY = 5              # Kilometers
    MAX_SAFE_WIND_SPEED = 20         # Km/h
    MAX_SAFE_PRECIPITATION = 2       # Millimeters

    # Extract relevant conditions
    temperature = current_weather['temperature']
    visibility = current_weather['visibility']
    wind_speed = current_weather['wind_speed']
    precipitation = current_weather['precip']
    weather_descriptions = current_weather['weather_descriptions']

    # Evaluate safety conditions
    is_safe_temperature = SAFE_TEMPERATURE_RANGE[0] <= temperature <= SAFE_TEMPERATURE_RANGE[1]
    is_safe_visibility = visibility >= SAFE_VISIBILITY
    is_safe_wind = wind_speed <= MAX_SAFE_WIND_SPEED
    is_safe_precipitation = precipitation <= MAX_SAFE_PRECIPITATION

    # Conclude whether it's safe to go out
    if is_safe_temperature and is_safe_visibility and is_safe_wind and is_safe_precipitation:
        conclusion = "It is safe to go out for driving or walking. The weather is clear and pleasant."
    else:
        conclusion = "It may not be safe to go out for driving or walking. Consider the following:"
        if not is_safe_temperature:
            conclusion += f"\n- Temperature is outside the safe range ({temperature}°C)."
        if not is_safe_visibility:
            conclusion += f"\n- Visibility is low ({visibility} km)."
        if not is_safe_wind:
            conclusion += f"\n- Wind speed is high ({wind_speed} km/h)."
        if not is_safe_precipitation:
            conclusion += f"\n- Precipitation level is high ({precipitation} mm)."

    # Output the conclusion
    return render_template('traffic-final.html', conclusion=conclusion)

if __name__ == "__main__":
    app.run(debug=True)
