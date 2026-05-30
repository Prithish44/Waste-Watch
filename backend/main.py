import os
import base64
import re
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import help as helper  # Make sure this has `run_pipeline` and `get_patches_from_results`

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
print("GOOGLE_API_KEY:", os.getenv("GOOGLE_API_KEY"))
# Initialize the model
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)


# Utility function to encode image
def encode_image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode("utf-8")

# Main function to calculate severity
def get_severity(model_path: str, image_path: str, patch_save_dir: str = "uploads"):
    # Run YOLO pipeline to get detection results
    results = helper.run_pipeline(model_path, image_path)

    # Save cropped patches to specified folder
    patches = helper.get_patches_from_results(results, save=True, save_dir=patch_save_dir)
    if not patches:
        print("❌ No patches detected.")
        return "Unknown"

    percentage_all = []

    # Gemini prompt
    prompt_text = (
        "Estimate the percentage of garbage in this image that is "
        "biodegradable like leaves, food scraps, torn pieces of clothing etc., "
        "non-biodegradable like plastic bottle, plastic etc., "
        "hazardous like lead poisonous metal, battery, electrical wire etc., "
        "and medical waste like injection syringe, medical cotton, bandage, blood coated. "
        "Give only the values in this format : "
        "Biodegradable: __%, Non-biodegradable: __%, Hazardous: __%, Medical: __%."
    )

    # Ask Gemini for each patch
    for i, filename in enumerate(os.listdir(patch_save_dir)):
        patch_path = os.path.join(patch_save_dir, filename)
        if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        base64_image = encode_image_to_base64(patch_path)

        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt_text},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
            ]
        )

        result = llm.invoke([message])
        print(f"📦 Patch {i+1} Response:\n{result.content}\n")
        percentage_all.append(result.content)

    # Extract and average values
    biodegradable_vals, non_biodegradable_vals, hazardous_vals, medical_vals = [], [], [], []

    for perc in percentage_all:
        match = re.findall(r"(\d+)%", perc)
        if len(match) == 4:
            b, nb, h, m = map(int, match)
            biodegradable_vals.append(b)
            non_biodegradable_vals.append(nb)
            hazardous_vals.append(h)
            medical_vals.append(m)
        else:
            print("⚠️ Could not parse percentages from one patch.")

    if not biodegradable_vals:
        print("❌ Failed to extract percentage values.")
        return "Unknown"

    # Calculate weighted severity

    avg_b = round(sum(biodegradable_vals) / len(biodegradable_vals), 2)
    avg_nb = round(sum(non_biodegradable_vals) / len(non_biodegradable_vals), 2)
    avg_h = round(sum(hazardous_vals) / len(hazardous_vals), 2)
    avg_m = round(sum(medical_vals) / len(medical_vals), 2)

    print("📊 Average Garbage Type Percentages:")
    print(f"Biodegradable: {avg_b}%, Non-Biodegradable: {avg_nb}%, Hazardous: {avg_h}%, Medical: {avg_m}%")

    weights = {"bio": 0.3, "non_bio": 0.6, "haz": 1.0, "med": 0.9}
    severity = (avg_b * weights["bio"] + avg_nb * weights["non_bio"] +
                avg_h * weights["haz"] + avg_m * weights["med"]) / (weights["bio"]+weights["non_bio"] + weights["haz"] + weights["med"])
    severity = round(severity, 3)

    print(f"🔥 Final Severity Score: {severity}")

    # avg = round(sum(percentages) / len(percentages), 2)
    
    return severity

'''

def get_severity(model_path: str, image_path: str, patch_save_dir: str = "uploads"):
    
    # Run YOLO pipeline to get detection results
    results = helper.run_pipeline(model_path, image_path)

    # Save cropped patches to specified folder
    patches = helper.get_patches_from_results(results, save=True, save_dir=patch_save_dir)
    if not patches:
        print("❌ No patches detected.")
        return "Unknown"

    # Gemini prompt: hazardousness only
    prompt_text = (
        "On a scale of 0 to 100, what is the percentage of hazardousness in this image? "
        "Only reply with the number. No explanation."
    )

    percentage_all = []

    for filename in os.listdir(patch_save_dir):
        if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        patch_path = os.path.join(patch_save_dir, filename)

        # Encode image
        with open(patch_path, "rb") as img_file:
            base64_image = base64.b64encode(img_file.read()).decode("utf-8")

        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt_text},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                }
            ]
        )

        try:
            response = llm.invoke([message])
            print(f" Patch: {filename}")
            print(" Gemini response:", response.content)
            percentage_all.append(response.content)
        except Exception as e:
            print(" Error with patch:", filename, "->", e)

    # Extract and average values
    percentages = []
    for text in percentage_all:
        match = re.search(r"\d{1,3}(?:\.\d+)?", text)
        if match:
            percentages.append(float(match.group()))

    if not percentages:
        print("No valid percentages extracted:", percentage_all)
        return "Unknown"

    avg = round(sum(percentages) / len(percentages), 2)
    print(" All Patch Hazardousness:", percentages)
    print(f" Final Average Hazardous Severity: {avg}")

    return avg

''' 