from knowledge_base import knowledge_base

def diagnose(user_symptoms):
    matched_conditions = []

    # Normalize user_symptoms: convert strings to dicts with "name" key
    normalized_symptoms = []
    for symptom in user_symptoms:
        if isinstance(symptom, str):
            normalized_symptoms.append({"name": symptom})
        elif isinstance(symptom, dict):
            normalized_symptoms.append(symptom)

    for entry in knowledge_base:
        condition_symptoms = entry["symptoms"]
        total_symptoms = len(condition_symptoms)
        matches = 0

        for cond_symptom in condition_symptoms:
            for user_symptom in normalized_symptoms:
                # Basic match on symptom name
                if cond_symptom["name"] == user_symptom["name"]:
                    # Bonus if severity/type matches
                    if "severity" in cond_symptom and "severity" in user_symptom:
                        if cond_symptom["severity"] == user_symptom["severity"]:
                            matches += 1.5  # Detailed match
                        else:
                            matches += 1
                    elif "type" in cond_symptom and "type" in user_symptom:
                        if cond_symptom["type"] == user_symptom["type"]:
                            matches += 1.5
                        else:
                            matches += 1
                    else:
                        matches += 1  # Simple name match

        match_percentage = (matches / total_symptoms) * 100

        if match_percentage >= 40:  # Threshold for possible match
            matched_conditions.append({
                "condition": entry["condition"],
                "match_percentage": round(match_percentage, 2),
                "advice": entry["advice"]
            })

    # Sort conditions by match percentage
    matched_conditions.sort(key=lambda x: x["match_percentage"], reverse=True)

    # Return top 3 conditions or "Unknown" if no match
    return matched_conditions[:3] if matched_conditions else [{
        "condition": "Unknown",
        "match_percentage": 0,
        "advice": "No clear match found. Please consult a healthcare professional."
    }]
