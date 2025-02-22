from flask import Flask, request, jsonify
from inference_engine import diagnose

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze_symptoms():
    data = request.get_json()
    symptoms = data.get("symptoms", [])

    if not symptoms:
        return jsonify({"error": "No symptoms provided."}), 400

    # Run enhanced inference engine
    diagnosis = diagnose(symptoms)

    return jsonify(diagnosis), 200

@app.route('/analyze_with_followup', methods=['POST'])
def analyze_symptoms_with_followup():
    data = request.get_json()
    user_symptoms = data.get("symptoms", "")
    follow_up = data.get("followUp", {})

    if not user_symptoms:
        return jsonify({"error": "No symptoms provided"}), 400

    # Process the symptoms and follow-up data
    diagnosis_result = diagnose(user_symptoms, follow_up)

    if diagnosis_result:
        return jsonify({
            "diagnosis": diagnosis_result["condition"],
            "recommendation": diagnosis_result["advice"]
        }), 200
    else:
        return jsonify({"diagnosis": None, "recommendation": "No matching condition found."}), 200

if __name__ == '__main__':
    app.run(port=5001, debug=True)